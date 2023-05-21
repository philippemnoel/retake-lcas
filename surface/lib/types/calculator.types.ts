import {
  CMLMaterialCompositionWithFactors,
  EFMaterialCompositionWithFactors,
  RMHMaterialCompositionWithFactors,
  CMLTransportationWithImpacts,
  EFTransportationWithImpacts,
  RMHTransportationWithImpacts,
  CMLManufacturingWithImpacts,
  EFManufacturingWithImpacts,
  RMHManufacturingWithImpacts,
  CMLUsePhaseWtihImpacts,
  CMLEndOfLifeWithImpacts,
  EFEndOfLifeWithImpacts,
  RMHEndOfLifeWithImpacts,
} from "./supabase-row.types"

enum LCAStage {
  MATERIALS = "Materials",
  TRANSPORTATION = "Transportation",
  MANUFACTURING = "Manufacturing",
  USE = "Use",
  DISPOSAL = "Disposal",
}

type CMLImpact = {
  total_global_warming: number
  total_acidification: number
  total_freshwater_ecotoxicity: number
  total_marine_ecotoxicity: number
  total_terrestrial_ecotoxicity: number
  total_abiotic_depletion_fossil_fuels: number
  total_eutrophication: number
  total_human_toxicity: number
  total_abiotic_depletion: number
  total_ozone_depletion: number
  total_photochemical_ozone_creation: number
}

type EFImpact = {
  total_abiotic_depletion: number
  total_abiotic_depletion_fossil_fuels: number
  total_acidification: number
  total_biogenic_global_warming: number
  total_carcinogenic_human_toxicity: number
  total_carcinogenic_inorganics_human_toxicity: number
  total_carcinogenic_organics_human_toxicity: number
  total_fossil_fuel_global_warming: number
  total_freshwater_ecotoxicity: number
  total_freshwater_eutrophication: number
  total_freshwater_inorganics_ecotoxicity: number
  total_freshwater_organics_ecotoxicity: number
  total_global_warming: number
  total_human_health_photochemical_ozone_creation: number
  total_ionizing_radiation: number
  total_land_use: number
  total_land_use_global_warming: number
  total_marine_eutrophication: number
  total_non_carcinogenic_human_toxicity: number
  total_non_carcinogenic_inorganics_human_toxicity: number
  total_non_carcinogenic_organics_human_toxicity: number
  total_ozone_depletion: number
  total_particulate_matter_formation: number
  total_terrestrial_eutrophication: number
  total_water_use: number
}

type RMHImpact = {
  total_acidification: number
  total_global_warming: number
  total_freshwater_ecotoxicity: number
  total_marine_ecotoxicity: number
  total_terrestrial_ecotoxicity: number
  total_energy_resources: number
  total_freshwater_eutrophication: number
  total_marine_eutrophication: number
  total_carcinogenic_human_toxicity: number
  total_non_carcinogenic_human_toxicity: number
  total_ionizing_radiation: number
  total_land_use: number
  total_metals_material_resources: number
  total_ozone_depletion: number
  total_particulate_matter_formation: number
  total_human_health_photochemical_ozone_creation: number
  total_terrestrial_photochemical_ozone_creation: number
  total_water_use: number
}

// Materials
type AdditionalColumns = {
  impact_source: string
  is_leaf: boolean
}

type CMLMaterialCompositionWithImpacts = CMLMaterialCompositionWithFactors &
  CMLImpact &
  AdditionalColumns
type EFMaterialCompositionWithImpacts = EFMaterialCompositionWithFactors &
  EFImpact &
  AdditionalColumns
type RMHMaterialCompositionWithImpacts = RMHMaterialCompositionWithFactors &
  RMHImpact &
  AdditionalColumns

type MaterialCompositionWithImpacts =
  | CMLMaterialCompositionWithImpacts
  | EFMaterialCompositionWithImpacts
  | RMHMaterialCompositionWithImpacts

// Transportation
type TransportationWithImpacts =
  | CMLTransportationWithImpacts
  | EFTransportationWithImpacts
  | RMHTransportationWithImpacts

// Manufacturing
type ManufacturingWithImpacts =
  | CMLManufacturingWithImpacts
  | EFManufacturingWithImpacts
  | RMHManufacturingWithImpacts

// Use Phase
type UsePhaseWithImpacts = CMLUsePhaseWtihImpacts

// End of Life
type EndOfLifeWithImpacts =
  | CMLEndOfLifeWithImpacts
  | EFEndOfLifeWithImpacts
  | RMHEndOfLifeWithImpacts

export {
  LCAStage,
  type CMLImpact,
  type EFImpact,
  type RMHImpact,
  type CMLMaterialCompositionWithImpacts,
  type EFMaterialCompositionWithImpacts,
  type RMHMaterialCompositionWithImpacts,
  type MaterialCompositionWithImpacts,
  type TransportationWithImpacts,
  type ManufacturingWithImpacts,
  type UsePhaseWithImpacts,
  type EndOfLifeWithImpacts,
}
