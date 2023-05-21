import { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"

import { post } from "lib/api"
import { supabase } from "lib/api/supabase"
import { Methodology, ImpactCategories } from "lib/calculator/methodologies"
import {
  lookupUseTypeDescription,
  lookupUseTypeUnits,
} from "lib/calculator/use"
import { TableDataUnion, units } from "lib/calculator/results"
import { formatNumber, makeSingular } from "lib/utils"
import {
  MaterialCompositionWithDescriptionsData,
  ServiceLifeData,
} from "lib/types/supabase-row.types"
import {
  MaterialCompositionWithImpacts,
  TransportationWithImpacts,
  ManufacturingWithImpacts,
  UsePhaseWithImpacts,
  EndOfLifeWithImpacts,
} from "lib/types/calculator.types"

import { computeLCAData, fetchLCAData } from "./utils"
import sortBy from "lodash.sortby"

const formatComponent = (
  material: string | null,
  description: string | null
) => {
  if (description && material) return `${description} (${material})`
  if (description) return description
  if (material) return material
  return ""
}

const formatWeight = (data: MaterialCompositionWithImpacts | undefined) =>
  data?.weight_grams ?? 0

const formatParts = (
  data: Array<MaterialCompositionWithDescriptionsData> | undefined,
  weightGrams: number
) =>
  sortBy(
    data?.map(
      (component) => ({
        weight_grams: component.weight_grams,
        percent_weight: formatNumber(
          ((component.weight_grams ?? 0) * 100) / weightGrams
        ),
        supplier_name: component.supplier_name ?? "N/A",
        part_description: formatComponent(
          component.primary_material,
          component.part_description
        ),
      }),
      "percent_weight"
    )
  )

const formatTransportation = (
  data: Array<TransportationWithImpacts> | undefined
) =>
  data?.map((t) => ({
    part_description: t.part_description,
    distance_km: formatNumber(t.distance_km ?? 0),
  }))

const formatManufacturing = (
  data: Array<ManufacturingWithImpacts> | undefined
) =>
  data?.map((d) => ({
    location: d.location,
    quantity_mj: formatNumber(d.quantity_mj ?? 0),
    quantity_kwh: formatNumber(d.quantity_kwh ?? 0),
    percent_renewable: formatNumber(d.percent_renewable ?? 0),
  }))

const formatUsePhase = (data: Array<UsePhaseWithImpacts> | undefined) =>
  data?.map((u) => ({
    description: lookupUseTypeDescription(u.use_type),
    units: lookupUseTypeUnits(u.use_type),
    quantity: formatNumber(u.quantity ?? 0),
    location: u.location,
    percent_at_location: formatNumber(u.percent_at_location ?? 0),
  }))

const formatEndofLife = (
  data: Array<EndOfLifeWithImpacts> | undefined,
  weightGrams: number
) =>
  data?.map((e) => ({
    description: e.description,
    location: e.location,
    percent: formatNumber(((e.weight_grams ?? 0) * 100) / weightGrams),
  }))

const formatServiceLife = (data: ServiceLifeData | undefined) => ({
  has_use_phase: data?.has_use_phase ?? false,
  quantity: data?.quantity,
  unit: makeSingular(data?.unit ?? ""),
})

const formatResults = (
  methodology: Methodology,
  materials: TableDataUnion,
  transportation: TableDataUnion,
  manufacturing: TableDataUnion,
  usePhase: TableDataUnion,
  endOfLife: TableDataUnion,
  total: TableDataUnion
) => {
  return Object.entries(ImpactCategories[methodology]).map(
    ([category, column]) => ({
      category,
      units: units(methodology, category),
      total_impact: formatNumber(
        Number(total?.[`total_${column}` as keyof TableDataUnion])
      ),
      materials_impact: formatNumber(
        Number(materials?.[`total_${column}` as keyof TableDataUnion])
      ),
      transportation_impact: formatNumber(
        Number(transportation?.[`total_${column}` as keyof TableDataUnion])
      ),
      manufacturing_impact: formatNumber(
        Number(manufacturing?.[`total_${column}` as keyof TableDataUnion])
      ),
      use_phase_impact: formatNumber(
        Number(usePhase?.[`total_${column}` as keyof TableDataUnion])
      ),
      end_of_life_impact: formatNumber(
        Number(endOfLife?.[`total_${column}` as keyof TableDataUnion])
      ),
    })
  )
}

// Write helper functions inspired by the above two functions for the remaining data transformations

const requestPDF = async (body: Record<string, any>) => {
  const url = process.env.HTML_DOCS_URL as string
  const data = {
    projectId: process.env.HTML_DOCS_PROJECT_ID,
    path: process.env.HTML_DOCS_PATH,
    context: body,
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HTML_DOCS_SECRET_KEY}`,
  }

  return await post(url, data, headers)
}

const constructContext = async (
  lcaId: string,
  methodology: Methodology,
  partDescription: string,
  organizationName: string,
  longDescription: string
) => {
  // Tech debt: If there are more than 500 rows, they won't be selected
  // I figure that this scenario is unlikely so I didn't account for it
  // @rebasedming

  // Pull data from Supabase
  // Fetch raw data
  const [
    materialsData,
    transportationData,
    manufacturingData,
    usePhaseData,
    endOfLifeData,
    { data: serviceLifeData },
  ] = await fetchLCAData(methodology, lcaId)

  const materialCompositionData = materialsData?.filter(
    (material) => material.level === 1
  )
  const subComponents = materialsData?.filter(
    (material) => material.level === 2
  )

  // Transform data
  const weightGrams = formatWeight(
    materialCompositionData?.[0] as MaterialCompositionWithImpacts
  )
  const parts = formatParts(
    subComponents as Array<MaterialCompositionWithDescriptionsData>,
    weightGrams
  )
  const transportation = formatTransportation(
    transportationData as Array<TransportationWithImpacts>
  )
  const manufacturing = formatManufacturing(
    manufacturingData as Array<ManufacturingWithImpacts>
  )
  const usePhase = formatUsePhase(usePhaseData as Array<UsePhaseWithImpacts>)
  const endOfLife = formatEndofLife(
    endOfLifeData as Array<EndOfLifeWithImpacts>,
    weightGrams
  )
  const serviceLife = formatServiceLife(serviceLifeData?.[0] as ServiceLifeData)

  const hasUsePhase = serviceLife?.has_use_phase ?? false

  const results = computeLCAData(
    methodology,
    hasUsePhase,
    materialCompositionData as Array<TableDataUnion>,
    transportationData as Array<TableDataUnion>,
    manufacturingData as Array<TableDataUnion>,
    usePhaseData as Array<TableDataUnion>,
    endOfLifeData as Array<TableDataUnion>
  )

  const formatted = formatResults(
    methodology,
    results.materials,
    results.transportation,
    results.manufacturing,
    results.usePhase,
    results.endOfLife,
    results.total
  )

  const date = new Date()
  const currentDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const year = date.getFullYear() - 1

  // Return formatted payload
  return {
    year,
    date: currentDate,
    organization_name: organizationName,
    product_description: longDescription,
    part_description: partDescription,
    weight_grams: weightGrams,
    methodology,
    manufacturing,
    parts,
    use_phase: usePhase,
    transportation,
    service_life: serviceLife,
    end_of_life: endOfLife,
    results: formatted,
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uploadBucket = "internal-lcas"

  const { org_id: orgId } = req.query
  const {
    lcaId,
    methodology,
    partDescription,
    organizationName,
    longDescription,
  } = req.body

  if (
    !orgId ||
    !lcaId ||
    !methodology ||
    !partDescription ||
    !organizationName ||
    !longDescription
  ) {
    res.status(400).send("Missing required parameters")
  }

  // Construct variables to send to HTMLDocs
  const context = await constructContext(
    lcaId,
    methodology,
    partDescription,
    organizationName,
    longDescription
  )

  // Generate the PDF and get the URL
  const pdfResponse = await requestPDF(context)
  if (!(pdfResponse.status === 200))
    res.status(pdfResponse.status).send(pdfResponse)

  // Download the S3 file
  const s3Url: string = await pdfResponse.json()

  const s3Response = await axios.get(s3Url, {
    responseType: "arraybuffer",
  })
  const uploadPath = `${orgId}/${lcaId}/${methodology}.pdf`

  // Write S3 public URL to Supabase storage
  const { error } = await supabase.storage
    .from(uploadBucket)
    .upload(uploadPath, s3Response.data, {
      contentType: "application/pdf",
      upsert: true,
    })

  if (error) {
    console.error(error)
    res.status(500).json({ message: error, url: s3Url })
    return
  }

  res.status(200).json({ url: s3Url })
}
