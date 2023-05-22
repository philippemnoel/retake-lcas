import type { NextApiRequest, NextApiResponse } from "next"
import { PineconeClient, type QueryRequest } from "@pinecone-database/pinecone"

import { asyncUpdateLCAResults } from "../supabase/[org_id]/results/utils"

import { supabase } from "lib/api/supabase"
import { createEmbedding } from "./gpt"
import { createClient } from "redis"
import { type Database } from "lib/types/database.types"
import { generalMaterials } from "lib/calculator/materials"

// TODO: find a cleaner way for optional type params
type Part = {
  retake_part_id: string
  reference_product_name?: string | null
  part_description: string | null
  origin: string | null
  primary_material: string | null
}

type PartsThirdPartyFactor =
  Database["public"]["Tables"]["parts_third_party_factors"]["Row"]

const sectorExcludeList = [
  "Fishing",
  "Agriculture",
  "Animal",
  "Electricity; Waste Treatment & Recycling",
]
const activityIncludeList = ["market activity", "market group"]

async function authenticate(apiKey: string): Promise<boolean> {
  const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? "16190"),
    },
  })
  await client.connect()
  const storedApiKey = await client.get("emissions-factors-endpoint-api-key")
  await client.disconnect()

  return storedApiKey === apiKey
}

async function queryPineconeIndex(vector: number[], namespace: string) {
  const pinecone = new PineconeClient()
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY ?? "",
    environment: process.env.PINECONE_ENVIRONMENT ?? "",
  })

  const index = pinecone.Index("third-party-factors")
  const queryRequest: QueryRequest = {
    namespace,
    topK: 1,
    vector,
    includeMetadata: true,
  }
  const queryResponse = await index.query({ queryRequest })

  const result = queryResponse.matches?.[0]
  const metadata = result?.metadata as { reference_name: string }

  if (metadata !== undefined) {
    return metadata.reference_name
  }
  return result?.id ?? null
}

async function checkIfPartsExist(
  partIds: string[]
): Promise<{ parts: Part[]; valid: boolean }> {
  const { data, error } = await supabase
    .from("parts")
    .select("retake_part_id,part_description,origin,primary_material")
    .in("retake_part_id", partIds)
  if (error != null) {
    console.error(error.message)
    return { parts: [], valid: false }
  }

  if (data.length === partIds.length) {
    return { parts: data, valid: true }
  }

  return { parts: [], valid: false }
}

async function computeEmissionFactor(
  part: Part
): Promise<PartsThirdPartyFactor> {
  if (
    (part.primary_material ?? "") === "" &&
    (part.part_description ?? "") === ""
  ) {
    // Skip part if it doesn't have necessary data
    throw new Error(
      "did not find a valid primary material or part description in row"
    )
  }

  // Compute the vectors for the relevant columns
  let primaryVector: number[]
  console.log("Creating embedding for", part)
  if ((part.primary_material ?? "") === "") {
    // Only if primary_material is null or empty do we use part description
    const descriptionVector = await createEmbedding(part.part_description ?? "")
    if (descriptionVector == null) {
      throw new Error("failed to get part description vector")
    }

    primaryVector = descriptionVector
  } else {
    // If the user selected a general material, map the general material to an Ecoinvent material
    if (Object.keys(generalMaterials).includes(part.primary_material ?? "")) {
      part.primary_material = generalMaterials[part.primary_material ?? ""]
    }

    const materialVector = await createEmbedding(part.primary_material ?? "")
    if (materialVector == null) {
      throw new Error("failed to get part material vector")
    }

    primaryVector = materialVector
  }

  // Only create a location vector when origin exists in the record
  let factorLocation: string | null
  if (part.origin) {
    const locationVector = await createEmbedding(part.origin)
    if (locationVector) {
      factorLocation = await queryPineconeIndex(locationVector, "locations")
      if (!factorLocation) {
        console.warn(
          "Failed to query pinecone index, using default location values"
        )
      }
    } else {
      console.log("Location vector is empty, using default location values")
    }
  } else {
    console.log("Origin column is empty, using default location values")
  }

  const factorProductName = await queryPineconeIndex(
    primaryVector,
    "reference_product_names"
  )
  if (factorProductName == null) {
    throw new Error("failed to get factor for pinecone index")
  }

  const { data: factors, error } = await supabase
    .from("third_party_factors")
    .select("factor_id,activity_name,location,reference_product_name")
    .eq("reference_product_name", factorProductName)
    .eq("reference_unit", "kg")
    .in("activity_type", activityIncludeList)
    .not("sector", "in", `(${sectorExcludeList.join(",")})`)

  if (error != null) {
    console.error(error)
    throw error
  }

  if (factors.length === 0) {
    throw new Error("did not find suitable emissions factor")
  }

  const result =
    factors.find((f) => factorLocation && f.location === factorLocation) ||
    factors.find((f) => f.location === "China") ||
    factors.find((f) => f.location === "Global") ||
    factors.find((f) => f.location === "Rest-of-World") ||
    factors.find((f) => f.location === "Europe") ||
    factors[0]

  console.log("Embedding factor", factorProductName, "found", result)
  return { retake_part_id: part.retake_part_id, factor_id: result.factor_id }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const apiKey = req.headers["x-api-key"]
  const authenicated = await authenticate(apiKey as string)

  if (!authenicated) {
    res.status(401).end()
    return
  }

  if (req.method === "POST") {
    const { part_ids, lca_ids: lcaIds } = req.body
    if (part_ids === undefined || part_ids.length === 0) {
      res.status(400).end()
      return
    }

    try {
      // First, we need to check if all parts exist in the db, to satisfy
      // the foreign constraint on the parts_third_party_factors table
      const { parts, valid } = await checkIfPartsExist(part_ids)
      if (!valid) {
        res.status(400).send("One or more objects do not exist in table parts")
        return
      }

      if (parts.length > 1) {
        // Send status 'Accepted' and continue asynchronously when doing bulk processing.
        res.status(202).end()
      }

      const FactorsPartsMap = parts.map(async (part: Part) => {
        try {
          const factor = await computeEmissionFactor(part)
          return factor
        } catch (error) {
          console.error(`Error processing part ${part.retake_part_id}`)
          return null
        }
      })

      const factorResults = await Promise.all(FactorsPartsMap)
      const upsertData = factorResults.filter(
        (factor): factor is PartsThirdPartyFactor => factor !== null
      )

      if (upsertData.length === 0) {
        res.status(200).end()
        return
      }

      const upsertResult = await supabase
        .from("parts_third_party_factors")
        .upsert(upsertData, {
          onConflict: "retake_part_id",
          ignoreDuplicates: false,
        })

      if (upsertResult.error != null) {
        throw upsertResult.error
      }

      if (lcaIds !== undefined) {
        lcaIds.forEach((lcaId: string) => {
          asyncUpdateLCAResults(lcaId)
        })
      }

      if (parts.length === 1) {
        res.status(200).end()
      }

      console.log("OK")
    } catch (error) {
      console.error(error)
      res.status(500).end()
    }
  } else {
    console.error("Method not supported", req.method)
    res.status(405).end()
  }
}
