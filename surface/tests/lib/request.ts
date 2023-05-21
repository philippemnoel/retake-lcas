import { NextApiRequest, NextApiResponse } from "next"
import { createRequest, createResponse } from "node-mocks-http"

import query_handler from "../../pages/api/supabase/[org_id]/query/[table]"
import upsert_handler from "../../pages/api/supabase/[org_id]/upsert/[table]"
import remove_handler from "../../pages/api/supabase/[org_id]/remove/[table]"
import organization_handler from "../../pages/api/organizations"

import { tableName } from "lib/calculator/results"
import { Methodology } from "lib/calculator/methodologies"

export type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>
export type ApiResponse = NextApiResponse & ReturnType<typeof createResponse>
export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>

export type PostLcaResponses = {
  parts: any[]
  materials: any[]
  transportation: any[]
  manufacturing: any[]
  use: any[]
  end_of_life: any[]
}

export type GetLcaResultsResponses = {
  materials: any
  transportations: any
  facilities: any
  uses: any
  disposals: any
}

// Helper to test GET requests against a backend handler.
export const getRequest = async (
  handler: ApiHandler,
  params: Record<string, string>
) => {
  const request = createRequest<ApiRequest>({
    method: "GET",
    query: params,
  })

  const response = createResponse<ApiResponse>()
  await handler(request, response)
  return response._getData()
}

// Helper to test POST requests against a backend handler.
export const postRequest = async (
  handler: ApiHandler,
  params: Record<string, string>,
  body?: any
) => {
  const request = createRequest<ApiRequest>({
    method: "POST",
    query: params,
    body,
  })

  const response = createResponse<ApiResponse>()
  await handler(request, response)
  return response
}

export const deleteRequest = async (
  handler: ApiHandler,
  params: Record<string, string>
) => {
  const { table, ...body } = params
  const request = createRequest<ApiRequest>({
    method: "DELETE",
    query: { table },
    // @ts-ignore
    body: JSON.stringify(body),
  })

  const response = createResponse<ApiResponse>()
  await handler(request, response)
  return response
}

export const postOrganization = async (organization: any) => {
  return {
    organization: await postRequest(
      organization_handler,
      { table: "organizations", onConflict: "id", ignoreDuplicates: "false" },
      organization
    ),
  }
}

export const postPart = async (part: any) => {
  return {
    part: await postRequest(
      upsert_handler,
      {
        table: "parts",
        onConflict: "customer_part_id,org_id",
        ignoreDuplicates: "false",
      },
      part
    ),
  }
}

export const postMaterial = async (material: any) => {
  return {
    material: await postRequest(
      upsert_handler,
      {
        table: "material_composition",
        onConflict: "id",
        ignoreDuplicates: "false",
      },
      material
    ),
  }
}

export const postTransport = async ({ transport }: any) => {
  return {
    transport: await postRequest(
      upsert_handler,
      { table: "transportation", onConflict: "id", ignoreDuplicates: "false" },
      transport
    ),
  }
}

export const postManufacturing = async (data: any) => {
  return {
    facility: await postRequest(
      upsert_handler,
      { table: "facilities", onConflict: "id", ignoreDuplicates: "false" },
      data.facility
    ),
    purchased_energy: await postRequest(
      upsert_handler,
      {
        table: "purchased_energy",
        onConflict: "facility_id,year",
        ignoreDuplicates: "false",
      },
      data.purchased_energy
    ),
    stationary_fuel: await postRequest(
      upsert_handler,
      {
        table: "stationary_fuel",
        onConflict: "facility_id,year",
        ignoreDuplicates: "false",
      },
      data.stationary_fuel
    ),
    facility_allocation: await postRequest(
      upsert_handler,
      {
        table: "facility_allocation",
        onConflict: "facility_id,lca_id",
        ignoreDuplicates: "false",
      },
      data.facility_allocation
    ),
  }
}

export const postUse = async (data: any) => {
  return {
    service_life: await postRequest(
      upsert_handler,
      {
        table: "service_life",
        onConflict: "lca_id",
        ignoreDuplicates: "false",
      },
      data.service_life
    ),
    use_phase: await postRequest(
      upsert_handler,
      { table: "use_phase", onConflict: "id", ignoreDuplicates: "false" },
      data.use_phase
    ),
  }
}

export const postEndOfLife = async (data: any) => {
  return {
    end_of_life: await postRequest(
      upsert_handler,
      { table: "end_of_life", onConflict: "id", ignoreDuplicates: "false" },
      data
    ),
  }
}

export const postLca = async (lca: any): Promise<PostLcaResponses> => {
  return {
    parts: await Promise.all(lca.parts.map(postPart)),
    materials: await Promise.all(lca.materials.map(postMaterial)),
    transportation: await Promise.all(lca.transportation.map(postTransport)),
    manufacturing: await Promise.all(lca.manufacturing.map(postManufacturing)),
    use: await Promise.all(lca.use.map(postUse)),
    end_of_life: await Promise.all(lca.endOfLife.map(postEndOfLife)),
  }
}

export const getMaterialCompositionWithImpacts = async (
  lca_id: string,
  methodology: Methodology
) => {
  return await getRequest(query_handler, {
    table: tableName(methodology, "material_composition_with_impacts"),
    level: "1",
    lca_id,
  })
}

export const getTransportationWithImpacts = async (
  lca_id: string,
  methodology: Methodology
) => {
  return await getRequest(query_handler, {
    table: tableName(methodology, "transportation_with_impacts"),
    lca_id,
  })
}

export const getFacilityAllocationWithImpacts = async (
  lca_id: string,
  methodology: Methodology
) => {
  return await getRequest(query_handler, {
    table: tableName(methodology, "facility_allocation_with_impacts"),
    lca_id,
  })
}

export const getUsePhaseWithImpacts = async (
  lca_id: string,
  methodology: Methodology
) => {
  return await getRequest(query_handler, {
    table: tableName(methodology, "use_phase_with_impacts"),
    lca_id,
  })
}

export const getEndOfLifeWithImpacts = async (
  lca_id: string,
  methodology: Methodology
) => {
  return await getRequest(query_handler, {
    table: tableName(methodology, "end_of_life_with_impacts"),
    lca_id,
  })
}

export const getLcaResults = async (
  lca_id: string,
  methodology: Methodology
): Promise<GetLcaResultsResponses> => {
  const [materials, transportations, facilities, uses, disposals] =
    await Promise.all([
      getMaterialCompositionWithImpacts(lca_id, methodology),
      getTransportationWithImpacts(lca_id, methodology),
      getFacilityAllocationWithImpacts(lca_id, methodology),
      getUsePhaseWithImpacts(lca_id, methodology),
      getEndOfLifeWithImpacts(lca_id, methodology),
    ])

  return {
    materials: materials.data,
    transportations: transportations.data,
    facilities: facilities.data,
    uses: uses.data,
    disposals: disposals.data,
  }
}

export const deleteOrganization = async (id: string) => {
  return await deleteRequest(remove_handler, { table: "organizations", id })
}
