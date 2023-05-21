import { Database } from "./database.types"

type Nullable<T> = { [P in keyof T]: T[P] | null }

// Data Tables
type PartsData = Database["public"]["Tables"]["parts"]["Row"]
type SupplierData = Database["public"]["Tables"]["suppliers"]["Row"]
type ServiceLifeData = Database["public"]["Tables"]["service_life"]["Row"]
type DisposalData = Database["public"]["Tables"]["end_of_life"]["Row"]
type UseData = Database["public"]["Tables"]["use_phase"]["Row"]
type TransportationData = Database["public"]["Tables"]["transportation"]["Row"]
type MaterialCompositionData =
  Database["public"]["Tables"]["material_composition"]["Row"]
type OrganizationData = Database["public"]["Tables"]["organizations"]["Row"]
type UserData = Database["public"]["Tables"]["users"]["Row"]
type FacilityData = Database["public"]["Tables"]["facilities"]["Row"]
type FacilityAllocationData =
  Database["public"]["Tables"]["facility_allocation"]["Row"]
type StationaryFuelData = Database["public"]["Tables"]["stationary_fuel"]["Row"]
type PurchasedEnergyData =
  Database["public"]["Tables"]["purchased_energy"]["Row"]

// Results Tables
type CMLTotalResultsData =
  Database["public"]["Tables"]["cml_total_results"]["Row"]
type EFTotalResultsData =
  Database["public"]["Tables"]["ef_total_results"]["Row"]
type RMHTotalResultsData =
  Database["public"]["Tables"]["rmh_total_results"]["Row"]

// Views
type CMLPartsWithImpactsData =
  Database["public"]["Views"]["cml_parts_with_impacts"]["Row"]
type MaterialCompositionWithDescriptionsData =
  Database["public"]["Views"]["material_composition_with_descriptions"]["Row"]
type FacilityEnergyWithImpactsData =
  Database["public"]["Views"]["cml_facility_energy_with_impacts"]["Row"]
type PartsEngagementStatusData =
  Database["public"]["Views"]["parts_engagement_status"]["Row"]

// Enums
type UseType = Database["public"]["Enums"]["use_type_enum"]

// Functions
type CMLMaterialCompositionWithFactors = Nullable<
  Database["public"]["Functions"]["cml_material_composition_with_factors"]["Returns"][number]
>
type EFMaterialCompositionWithFactors = Nullable<
  Database["public"]["Functions"]["ef_material_composition_with_factors"]["Returns"][number]
>
type RMHMaterialCompositionWithFactors = Nullable<
  Database["public"]["Functions"]["rmh_material_composition_with_factors"]["Returns"][number]
>
type CMLTransportationWithImpacts = Nullable<
  Database["public"]["Functions"]["cml_transportation_with_impacts"]["Returns"][number]
>
type EFTransportationWithImpacts = Nullable<
  Database["public"]["Functions"]["ef_transportation_with_impacts"]["Returns"][number]
>
type RMHTransportationWithImpacts = Nullable<
  Database["public"]["Functions"]["rmh_transportation_with_impacts"]["Returns"][number]
>
type CMLManufacturingWithImpacts = Nullable<
  Database["public"]["Functions"]["cml_manufacturing_with_impacts"]["Returns"][number]
>
type EFManufacturingWithImpacts = Nullable<
  Database["public"]["Functions"]["ef_manufacturing_with_impacts"]["Returns"][number]
>
type RMHManufacturingWithImpacts = Nullable<
  Database["public"]["Functions"]["rmh_manufacturing_with_impacts"]["Returns"][number]
>
type CMLUsePhaseWtihImpacts = Nullable<
  Database["public"]["Functions"]["cml_use_phase_with_impacts"]["Returns"][number]
>
type EFUsePhaseWtihImpacts = Nullable<
  Database["public"]["Functions"]["ef_use_phase_with_impacts"]["Returns"][number]
>
type RMHUsePhaseWtihImpacts = Nullable<
  Database["public"]["Functions"]["rmh_use_phase_with_impacts"]["Returns"][number]
>
type CMLEndOfLifeWithImpacts = Nullable<
  Database["public"]["Functions"]["cml_end_of_life_with_impacts"]["Returns"][number]
>
type EFEndOfLifeWithImpacts = Nullable<
  Database["public"]["Functions"]["ef_end_of_life_with_impacts"]["Returns"][number]
>
type RMHEndOfLifeWithImpacts = Nullable<
  Database["public"]["Functions"]["rmh_end_of_life_with_impacts"]["Returns"][number]
>

export {
  type PartsData,
  type SupplierData,
  type ServiceLifeData,
  type DisposalData,
  type UseData,
  type TransportationData,
  type MaterialCompositionData,
  type OrganizationData,
  type UserData,
  type CMLTotalResultsData,
  type EFTotalResultsData,
  type RMHTotalResultsData,
  type FacilityData,
  type FacilityAllocationData,
  type StationaryFuelData,
  type PurchasedEnergyData,
}
export {
  type CMLPartsWithImpactsData,
  type MaterialCompositionWithDescriptionsData,
  type FacilityEnergyWithImpactsData,
  type PartsEngagementStatusData,
}
export { type UseType }
export {
  type CMLMaterialCompositionWithFactors,
  type EFMaterialCompositionWithFactors,
  type RMHMaterialCompositionWithFactors,
  type CMLTransportationWithImpacts,
  type EFTransportationWithImpacts,
  type RMHTransportationWithImpacts,
  type CMLManufacturingWithImpacts,
  type EFManufacturingWithImpacts,
  type RMHManufacturingWithImpacts,
  type CMLUsePhaseWtihImpacts,
  type EFUsePhaseWtihImpacts,
  type RMHUsePhaseWtihImpacts,
  type CMLEndOfLifeWithImpacts,
  type EFEndOfLifeWithImpacts,
  type RMHEndOfLifeWithImpacts,
}
