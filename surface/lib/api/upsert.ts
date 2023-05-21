import { post } from "."
import { z } from "zod"
import omit from "lodash.omit"

import { assignEmissionsFactor, updateLCAResults } from "./effects"
import {
  createPartsPayload,
  createMaterialCompositionPayload,
  createSupplierPayload,
  createDisposalPayload,
  UserSchema,
  OrganizationSchema,
  UpsertMaterialCompositionSchema,
  UpsertSupplierSchema,
  UpsertSupplierEngagementSchema,
  UpsertDisposalSchema,
  UpsertTransportationSchema,
  createTransportationPayload,
  FacilityDataSchema,
  PurchasedEnergySchema,
  StationaryFuelSchema,
  FacilityAllocationSchema,
  ServiceLifeSchema,
  UsePhaseSchema,
  CMLTotalResultsSchema,
} from "lib/api/schemas"
import {
  PartsData,
  DisposalData,
  TransportationData,
  OrganizationData,
  UserData,
  SupplierData,
  FacilityData,
  PurchasedEnergyData,
  StationaryFuelData,
  FacilityAllocationData,
  UseData,
  CMLTotalResultsData,
  ServiceLifeData,
} from "lib/types/supabase-row.types"
import { MaterialCompositionWithImpacts } from "lib/types/calculator.types"

/**
 * Upserts rows into the parts table
 * @param {Array<Partial<PartsData>>} values - The values to be upserted
 * @param {string | null | undefined} orgId - The organization ID
 * @returns {Promise} - A promise that resolves with the upserted rows
 */

const upsertPart = (
  values: Array<Partial<PartsData>>,
  orgId: string | null | undefined,
  calculateEmissions = true
) => {
  try {
    orgId = z.string().nonempty().parse(orgId)
    values = z.array(createPartsPayload(orgId)).parse(values)

    return post(
      `/api/supabase/${orgId}/upsert/parts?onConflict=retake_part_id&ignoreDuplicates=false`,
      values
    ).then((response) => {
      if (calculateEmissions) {
        return assignEmissionsFactor(
          values.map((value) => value.retake_part_id)
        )
      } else {
        return response
      }
    })
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the material_composition table
 * @param {Array<Partial<MaterialCompositionWithImpacts>>} values - The values to be upserted
 * @param {string | null | undefined} orgId - The organization ID
 * @param {string | null} parentId - The parent ID
 * @param {string | null | undefined} lcaId - The LCA ID
 * @returns {Promise} - A promise that resolves with the upserted rows
 */

const upsertMaterialComposition = (
  values: Array<Partial<MaterialCompositionWithImpacts>>,
  orgId: string | null | undefined
) => {
  try {
    const parsed = UpsertMaterialCompositionSchema.parse({
      values,
      orgId,
    })
    const payload = z
      .array(createMaterialCompositionPayload(parsed.orgId))
      .parse(values)

    return post(
      `/api/supabase/${parsed.orgId}/upsert/material_composition?onConflict=id&ignoreDuplicates=false`,
      payload
    ).then(() => updateLCAResults(payload?.[0]?.lca_id, parsed.orgId))
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the transportation table
 * @param {Array<Partial<TransportationData>>} values - The values to be upserted
 * @param {string | null | undefined} orgId - The organization ID
 * @returns {Promise} - A promise that resolves with the upserted rows
 * @throws {Error} - If orgId is not provided or if any value in values is missing an id or name
 */

const upsertTransportation = (
  values: Array<Partial<TransportationData>>,
  orgId: string | null | undefined
) => {
  try {
    const parsed = UpsertTransportationSchema.parse({ values, orgId })
    const payload = z
      .array(createTransportationPayload(parsed.orgId))
      .parse(values)

    return post(
      `/api/supabase/${orgId}/upsert/transportation?onConflict=id&ignoreDuplicates=false`,
      payload
    ).then(() => updateLCAResults(payload[0].lca_id, parsed.orgId))
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the facility_allocation table
 * @param {Partial<FacilityAllocationData>} values - The values to be upserted
 */

const upsertFacilityAllocation = (values: Partial<FacilityAllocationData>) => {
  try {
    const parsed = FacilityAllocationSchema.parse(values)

    return post(
      `/api/supabase/${parsed.org_id}/upsert/facility_allocation?onConflict=facility_id,lca_id&ignoreDuplicates=false`,
      parsed
    ).then(() => updateLCAResults(parsed.lca_id, parsed.org_id))
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the service_life table
 * @param {Partial<FacilityAllocationData>} values - The values to be upserted
 * @returns {Promise} - A promise that resolves with the upserted rows
 */

const upsertServiceLife = (values: Partial<ServiceLifeData>) => {
  try {
    const parsed = ServiceLifeSchema.parse(values)

    return post(
      `/api/supabase/${parsed.org_id}/upsert/service_life?onConflict=lca_id&ignoreDuplicates=false`,
      parsed
    ).then(() => updateLCAResults(parsed.lca_id, parsed.org_id))
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the purchased_energy table
 * @param {Partial<PurchasedEnergyData>} values - The values to be upserted
 */

const upsertUsePhase = (values: Partial<UseData>) => {
  try {
    const parsed = UsePhaseSchema.parse(values)

    return post(
      `/api/supabase/${parsed.org_id}/upsert/use_phase?onConflict=id&ignoreDuplicates=false`,
      parsed
    ).then(() => updateLCAResults(parsed.lca_id, parsed.org_id))
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the disposal table
 * @param {Array<Partial<DisposalData>>} values - The values to be upserted
 * @param {string | null | undefined} orgId - The organization ID
 * @returns {Promise} - A promise that resolves with the upserted rows
 */

const upsertDisposal = (
  values: Array<Partial<DisposalData>>,
  orgId: string | null | undefined
) => {
  try {
    const parsed = UpsertDisposalSchema.parse({ values, orgId })
    const payload = z.array(createDisposalPayload(parsed.orgId)).parse(values)

    return post(
      `/api/supabase/${parsed.orgId}/upsert/end_of_life?onConflict=id&ignoreDuplicates=false`,
      payload
    ).then(() => updateLCAResults(payload?.[0].lca_id, parsed.orgId))
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the organizations table
 * @param {Array<Partial<OrganizationData>>} values - The values to be upserted
 * @param {string | null | undefined} orgId - The organization ID
 * @returns {Promise} - A promise that resolves with the upserted rows
 * @throws {Error} - If orgId is not provided or if any value in values is missing an id or name
 */

const upsertOrganization = (value: Partial<OrganizationData>) => {
  try {
    const parsed = OrganizationSchema.parse(value)

    return post(
      `/api/supabase/${parsed.id}/upsert/organizations?onConflict=id&ignoreDuplicates=false`,
      [parsed]
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts a row into the users table
 * @param {Partial<UserData>} user - The user data to be upserted
 * @returns {Promise} - A promise that resolves with the upserted row
 * @throws {Error} - If user.sub is not provided
 */

const upsertUser = (user: Partial<UserData>) => {
  try {
    const parsed = UserSchema.parse(user)

    return post(
      `/api/supabase/${parsed.org_id}/upsert/users?onConflict=id&ignoreDuplicates=false`,
      [{ ...omit(parsed, ["sub"]), id: parsed.sub }]
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the facilities table
 * @param {Array<Partial<FacilityData>>} values - The values to be upserted
 */

const upsertFacility = (values: Partial<FacilityData>) => {
  try {
    const parsed = FacilityDataSchema.parse(values)

    return post(
      `/api/supabase/${parsed.org_id}/upsert/facilities?onConflict=id&ignoreDuplicates=false`,
      parsed
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the purchased_energy table
 * @param {Array<Partial<PurchasedEnergyData>>} values - The values to be upserted
 */

const upsertPurchasedEnergy = (values: Partial<PurchasedEnergyData>) => {
  try {
    const parsed = PurchasedEnergySchema.parse(values)

    return post(
      `/api/supabase/${parsed.org_id}/upsert/purchased_energy?onConflict=facility_id,year&ignoreDuplicates=false`,
      parsed
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the stationary_fuel table
 * @param {Array<Partial<StationaryFuelData>>} values - The values to be upserted
 */

const upsertStationaryFuel = (values: Partial<StationaryFuelData>) => {
  try {
    const parsed = StationaryFuelSchema.parse(values)

    return post(
      `/api/supabase/${parsed.org_id}/upsert/stationary_fuel?onConflict=facility_id,year&ignoreDuplicates=false`,
      parsed
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the suppliers table
 * @param {Array<Partial<SupplierData>>} values - The values to be upserted
 * @param {string | null | undefined} orgId - The organization ID
 * @returns {Promise} - A promise that resolves with the upserted rows
 * @throws {Error} - If orgId is not provided or if any value in values is missing an id or name
 */

const upsertSupplier = (
  values: Array<Partial<SupplierData>>,
  orgId: string | null | undefined
) => {
  try {
    const parsed = UpsertSupplierSchema.parse({ values, orgId })
    const payload = z.array(createSupplierPayload(parsed.orgId)).parse(values)

    return post(
      `/api/supabase/${parsed.orgId}/upsert/suppliers?onConflict=id&ignoreDuplicates=false`,
      payload
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Upserts rows into the product_supplier_engagement table
 * @param {string} supplierId - The ID of the supplier
 * @param {string} retakePartId - The retake part ID
 * @param {string} orgId - The organization ID
 * @param {string} organizationName - The name of the organization
 * @param {string} partDescription - The description of the part
 * @returns {Promise} - A promise that resolves with the upserted rows
 */

const upsertSupplierEngagement = (
  supplierId: string | undefined,
  retakePartId: string | null | undefined,
  orgId: string | null | undefined,
  organizationName: string | null | undefined,
  partDescription: string | null | undefined
) => {
  try {
    const parsed = UpsertSupplierEngagementSchema.parse({
      supplierId,
      retakePartId,
      orgId,
      organizationName,
      partDescription,
    })

    return post(
      `/api/supabase/${parsed.orgId}/upsert/supplier_product_engagement?onConflict=id&ignoreDuplicates=true`,
      {
        id: `${parsed.supplierId}-${parsed.retakePartId}`,
        supplier_id: parsed.supplierId,
        retake_part_id: parsed.retakePartId,
        org_id: parsed.orgId,
        organization_name: parsed.organizationName,
        part_description: parsed.partDescription,
      }
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

const upsertLCA = (values: Partial<CMLTotalResultsData>) => {
  try {
    const parsed = CMLTotalResultsSchema.parse(values)
    return post(
      `/api/supabase/${parsed.org_id}/upsert/cml_total_results?onConflict=lca_id&ignoreDuplicates=false`,
      parsed
    )
  } catch (err) {
    return Promise.reject(err)
  }
}

export {
  upsertPart,
  upsertMaterialComposition,
  upsertSupplier,
  upsertSupplierEngagement,
  upsertDisposal,
  upsertServiceLife,
  upsertTransportation,
  upsertOrganization,
  upsertUser,
  upsertFacility,
  upsertPurchasedEnergy,
  upsertStationaryFuel,
  upsertUsePhase,
  upsertFacilityAllocation,
  upsertLCA,
}
