import { remove } from "."
import { updateLCAResults } from "./effects"

const removeLCA = async (
  lcaId: string | null | undefined,
  orgId: string | null | undefined
) => {
  const body = { lca_id: lcaId }

  return await Promise.all([
    remove(`/api/supabase/${orgId}/remove/material_composition`, body),
    remove(`/api/supabase/${orgId}/remove/transportation`, body),
    remove(`/api/supabase/${orgId}/remove/facility_allocation`, body),
    remove(`/api/supabase/${orgId}/remove/use_phase`, body),
    remove(`/api/supabase/${orgId}/remove/end_of_life`, body),
    remove(`/api/supabase/${orgId}/remove/cml_materials_results`, body),
    remove(`/api/supabase/${orgId}/remove/cml_transportation_results`, body),
    remove(`/api/supabase/${orgId}/remove/cml_manufacturing_results`, body),
    remove(`/api/supabase/${orgId}/remove/cml_use_phase_results`, body),
    remove(`/api/supabase/${orgId}/remove/cml_end_of_life_results`, body),
    remove(`/api/supabase/${orgId}/remove/cml_total_results`, body),
    remove(`/api/supabase/${orgId}/remove/ef_materials_results`, body),
    remove(`/api/supabase/${orgId}/remove/ef_transportation_results`, body),
    remove(`/api/supabase/${orgId}/remove/ef_manufacturing_results`, body),
    remove(`/api/supabase/${orgId}/remove/ef_use_phase_results`, body),
    remove(`/api/supabase/${orgId}/remove/ef_end_of_life_results`, body),
    remove(`/api/supabase/${orgId}/remove/ef_total_results`, body),
    remove(`/api/supabase/${orgId}/remove/rmh_materials_results`, body),
    remove(`/api/supabase/${orgId}/remove/rmh_transportation_results`, body),
    remove(`/api/supabase/${orgId}/remove/rmh_manufacturing_results`, body),
    remove(`/api/supabase/${orgId}/remove/rmh_use_phase_results`, body),
    remove(`/api/supabase/${orgId}/remove/rmh_end_of_life_results`, body),
    remove(`/api/supabase/${orgId}/remove/rmh_total_results`, body),
  ])
}

const removeMaterialComposition = (
  id: string | null | undefined,
  lcaId: string | null | undefined,
  orgId: string | null | undefined
) =>
  remove(`/api/supabase/${orgId}/remove/material_composition`, { id }).then(
    () => updateLCAResults(lcaId, orgId)
  )

const removePart = (
  retakePartId: string | null | undefined,
  orgId: string | null | undefined
) =>
  remove(`/api/supabase/${orgId}/remove/parts`, {
    retake_part_id: retakePartId,
  })

const removeTransportation = (
  id: string | null | undefined,
  lcaId: string | null | undefined,
  orgId: string | null | undefined
) =>
  remove(`/api/supabase/${orgId}/remove/transportation`, { id }).then(() =>
    updateLCAResults(lcaId, orgId)
  )

const removeManufacturing = (
  facilityId: string | null | undefined,
  lcaId: string | null | undefined,
  orgId: string | null | undefined
) =>
  remove(`/api/supabase/${orgId}/remove/facility_allocation`, {
    facility_id: facilityId,
    lca_id: lcaId,
  }).then(() => updateLCAResults(lcaId, orgId))

const removeUsePhase = (
  id: string | null | undefined,
  lcaId: string | null | undefined,
  orgId: string | null | undefined
) =>
  remove(`/api/supabase/${orgId}/remove/use_phase`, { id }).then(() =>
    updateLCAResults(lcaId, orgId)
  )

const removeEndOfLife = (
  id: string | null | undefined,
  lcaId: string | null | undefined,
  orgId: string | null | undefined
) =>
  remove(`/api/supabase/${orgId}/remove/end_of_life`, { id }).then(() =>
    updateLCAResults(lcaId, orgId)
  )

const removeFacility = (
  id: string | null | undefined,
  orgId: string | null | undefined
) => remove(`/api/supabase/${orgId}/remove/facilities`, { id })

const removeSupplier = (
  id: string | null | undefined,
  orgId: string | null | undefined
) => remove(`/api/supabase/${orgId}/remove/suppliers`, { id })

export {
  removeLCA,
  removePart,
  removeMaterialComposition,
  removeTransportation,
  removeManufacturing,
  removeUsePhase,
  removeEndOfLife,
  removeFacility,
  removeSupplier,
}
