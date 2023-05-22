import { z } from "zod"

// Table Schemas
const PartsDataSchema = z.object({
  retake_part_id: z.string().nonempty(),
  org_id: z.string().optional().nullable(),
  customer_part_id: z.string().optional().nullable(),
  part_description: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  manufacturing_process: z.string().optional().nullable(),
  supplier_ids: z.array(z.string()).optional().nullable(),
  primary_material: z.string().optional().nullable(),
  long_description: z.string().optional().nullable(),
  is_base_material: z.boolean().optional(),
})

const MaterialCompositionDataSchema = z.object({
  id: z.string().optional(),
  lca_id: z.string().nonempty(),
  retake_part_id: z.string().nonempty(),
  parent_id: z.string().optional().nullable(),
  level: z.number().optional().nullable(),
  weight_grams: z.number().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  org_id: z.string().optional().nullable(),
})

const DisposalDataSchema = z.object({
  weight_grams: z.number().optional().nullable(),
  id: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  lca_id: z.string().optional().nullable(),
  factor_id: z.string().optional().nullable(),
})

const OrganizationSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
})

const UserSchema = z.object({
  sub: z.string().nonempty(),
  org_id: z.string().nonempty(),
  email: z.string().email().optional().nullable(),
  email_verified: z.boolean().optional().nullable(),
  name: z.string().optional().nullable(),
  nickname: z.string().optional().nullable(),
  picture: z.string().url().optional().nullable(),
})

const SupplierDataSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  website: z.string().optional().nullable(),
  contacts: z.array(z.string()).nonempty().optional().nullable(),
})

const TransportationDataSchema = z.object({
  org_id: z.string().optional().nullable(),
  lca_id: z.string().nonempty(),
  factor_id: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  distance_km: z.number().optional().nullable(),
  id: z.string().optional(),
  material_composition_id: z.string().optional(),
  origin: z.string().optional().nullable(),
  transportation_type: z.string().optional().nullable(),
})

const SupplierEngagementDataSchema = z.object({
  contact: z.string().nonempty(),
  organizationName: z.string().nonempty(),
  supplierId: z.string().nonempty(),
})

const SlackEPDDataSchema = z.object({
  orgId: z.string().nonempty(),
  userId: z.string().nonempty(),
  message: z.string().nullable().optional(),
  lcaId: z.string().nonempty(),
})

const FacilityDataSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  name: z.string(),
  location: z.string(),
})

const PurchasedEnergySchema = z.object({
  facility_id: z.string(),
  year: z.number(),
  org_id: z.string(),
  description: z.string(),
  quantity_kwh: z.number().default(0),
  percent_renewable: z.number().default(0),
  factor_id: z.string().optional(),
})

const StationaryFuelSchema = z.object({
  facility_id: z.string(),
  year: z.number(),
  org_id: z.string(),
  description: z.string(),
  quantity_mj: z.number().default(0),
  factor_id: z.string().optional(),
})

const FacilityAllocationSchema = z.object({
  facility_id: z.string(),
  org_id: z.string(),
  lca_id: z.string(),
  percent_revenue: z.number().default(0),
  quantity_produced: z.number().default(0),
})

const ServiceLifeSchema = z.object({
  has_use_phase: z.boolean().default(false),
  id: z.string().nullable().optional(),
  lca_id: z.string(),
  org_id: z.string(),
  quantity: z.number().default(0),
  unit: z.string().nullable().optional(),
})

const UsePhaseSchema = z.object({
  factor_id: z.string(),
  lca_id: z.string(),
  org_id: z.string(),
  id: z.string().optional().nullable(),
  percent_at_location: z.number().optional().default(100),
  quantity: z.number(),
  location: z.string().nullable().optional(),
  use_type: z.union([
    z.literal("WATER"),
    z.literal("NATURAL_GAS"),
    z.literal("PETROL"),
    z.literal("ELECTRICITY"),
  ]),
})

const LCACompletionSchema = z.object({
  lca_id: z.string(),
  org_id: z.string(),
  materials_completed: z.boolean().optional().nullable(),
  use_phase_completed: z.boolean().optional().nullable(),
  transportation_completed: z.boolean().optional().nullable(),
  disposal_completed: z.boolean().optional().nullable(),
  end_of_life_completed: z.boolean().optional().nullable(),
})

const WithSupplierIdsSchema = z.object({
  supplier_ids: z.array(z.string()).optional().nullable(),
})

const MaterialCompositionTreeSchema = z.object({
  is_leaf: z.boolean().optional().nullable(),
  database_name: z.string().optional().nullable(),
  reference_product_name: z.string().optional().nullable(),
  impact_source: z.string().optional().nullable(),
})

const CMLTotalResultsSchema = z.object({
  material_composition_id: z.string().uuid().nullable().optional(),
  lca_id: z.string().uuid(),
  org_id: z.string(),
  long_description: z.string().nullable().optional(),
  weight_grams: z.number().nullable().optional(),
  retake_part_id: z.string().nullable().optional(),
  customer_part_id: z.string().nullable().optional(),
  part_description: z.string().nullable().optional(),
  impact_source: z.string().nullable().optional(),
  materials_completed: z.boolean().nullable().optional(),
  transportation_completed: z.boolean().nullable().optional(),
  manufacturing_completed: z.boolean().nullable().optional(),
  use_phase_completed: z.boolean().nullable().optional(),
  end_of_life_completed: z.boolean().nullable().optional(),
  total_global_warming: z.number().nullable().optional(),
  total_acidification: z.number().nullable().optional(),
  total_eutrophication: z.number().nullable().optional(),
  total_ozone_depletion: z.number().nullable().optional(),
  total_human_toxicity: z.number().nullable().optional(),
  total_freshwater_ecotoxicity: z.number().nullable().optional(),
  total_marine_ecotoxicity: z.number().nullable().optional(),
  total_terrestrial_ecotoxicity: z.number().nullable().optional(),
  total_abiotic_depletion: z.number().nullable().optional(),
  total_abiotic_depletion_fossil_fuels: z.number().nullable().optional(),
  total_photochemical_ozone_creation: z.number().nullable().optional(),
})

const CMLCalculationsSchema = z.object({
  lca_id: z.string().uuid(),
  org_id: z.string(),
  total_global_warming: z.number().nullable().optional(),
  total_acidification: z.number().nullable().optional(),
  total_eutrophication: z.number().nullable().optional(),
  total_ozone_depletion: z.number().nullable().optional(),
  total_human_toxicity: z.number().nullable().optional(),
  total_freshwater_ecotoxicity: z.number().nullable().optional(),
  total_marine_ecotoxicity: z.number().nullable().optional(),
  total_terrestrial_ecotoxicity: z.number().nullable().optional(),
  total_abiotic_depletion: z.number().nullable().optional(),
  total_abiotic_depletion_fossil_fuels: z.number().nullable().optional(),
  total_photochemical_ozone_creation: z.number().nullable().optional(),
})

const EFTotalResultsSchema = z.object({
  material_composition_id: z.string().uuid(),
  lca_id: z.string().uuid(),
  org_id: z.string(),
  long_description: z.string().nullable().optional(),
  weight_grams: z.number().nullable().optional(),
  retake_part_id: z.string().nullable().optional(),
  customer_part_id: z.string().nullable().optional(),
  part_description: z.string().nullable().optional(),
  impact_source: z.string().nullable().optional(),
  materials_completed: z.boolean().nullable().optional(),
  transportation_completed: z.boolean().nullable().optional(),
  manufacturing_completed: z.boolean().nullable().optional(),
  use_phase_completed: z.boolean().nullable().optional(),
  end_of_life_completed: z.boolean().nullable().optional(),
  total_acidification: z.number().nullable().optional(),
  total_global_warming: z.number().nullable().optional(),
  total_biogenic_global_warming: z.number().nullable().optional(),
  total_fossil_fuel_global_warming: z.number().nullable().optional(),
  total_land_use_global_warming: z.number().nullable().optional(),
  total_freshwater_ecotoxicity: z.number().nullable().optional(),
  total_freshwater_inorganics_ecotoxicity: z.number().nullable().optional(),
  total_freshwater_organics_ecotoxicity: z.number().nullable().optional(),
  total_abiotic_depletion_fossil_fuels: z.number().nullable().optional(),
  total_freshwater_eutrophication: z.number().nullable().optional(),
  total_marine_eutrophication: z.number().nullable().optional(),
  total_terrestrial_eutrophication: z.number().nullable().optional(),
  total_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_carcinogenic_inorganics_human_toxicity: z
    .number()
    .nullable()
    .optional(),
  total_carcinogenic_organics_human_toxicity: z.number().nullable().optional(),
  total_non_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_non_carcinogenic_inorganics_human_toxicity: z
    .number()
    .nullable()
    .optional(),
  total_non_carcinogenic_organics_human_toxicity: z
    .number()
    .nullable()
    .optional(),
  total_ionizing_radiation: z.number().nullable().optional(),
  total_land_use: z.number().nullable().optional(),
  total_abiotic_depletion: z.number().nullable().optional(),
  total_ozone_depletion: z.number().nullable().optional(),
  total_particulate_matter_formation: z.number().nullable().optional(),
  total_human_health_photochemical_ozone_creation: z
    .number()
    .nullable()
    .optional(),
  total_water_use: z.number().nullable().optional(),
})

const EFCalculationsSchema = z.object({
  lca_id: z.string().uuid(),
  org_id: z.string(),
  total_acidification: z.number().nullable().optional(),
  total_global_warming: z.number().nullable().optional(),
  total_biogenic_global_warming: z.number().nullable().optional(),
  total_fossil_fuel_global_warming: z.number().nullable().optional(),
  total_land_use_global_warming: z.number().nullable().optional(),
  total_freshwater_ecotoxicity: z.number().nullable().optional(),
  total_freshwater_inorganics_ecotoxicity: z.number().nullable().optional(),
  total_freshwater_organics_ecotoxicity: z.number().nullable().optional(),
  total_abiotic_depletion_fossil_fuels: z.number().nullable().optional(),
  total_freshwater_eutrophication: z.number().nullable().optional(),
  total_marine_eutrophication: z.number().nullable().optional(),
  total_terrestrial_eutrophication: z.number().nullable().optional(),
  total_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_carcinogenic_inorganics_human_toxicity: z
    .number()
    .nullable()
    .optional(),
  total_carcinogenic_organics_human_toxicity: z.number().nullable().optional(),
  total_non_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_non_carcinogenic_inorganics_human_toxicity: z
    .number()
    .nullable()
    .optional(),
  total_non_carcinogenic_organics_human_toxicity: z
    .number()
    .nullable()
    .optional(),
  total_ionizing_radiation: z.number().nullable().optional(),
  total_land_use: z.number().nullable().optional(),
  total_abiotic_depletion: z.number().nullable().optional(),
  total_ozone_depletion: z.number().nullable().optional(),
  total_particulate_matter_formation: z.number().nullable().optional(),
  total_human_health_photochemical_ozone_creation: z
    .number()
    .nullable()
    .optional(),
  total_water_use: z.number().nullable().optional(),
})

const RMHTotalResultsSchema = z.object({
  material_composition_id: z.string().uuid(),
  lca_id: z.string().uuid(),
  org_id: z.string(),
  long_description: z.string().nullable().optional(),
  weight_grams: z.number().nullable().optional(),
  retake_part_id: z.string().nullable().optional(),
  customer_part_id: z.string().nullable().optional(),
  part_description: z.string().nullable().optional(),
  impact_source: z.string().nullable().optional(),
  materials_completed: z.boolean().nullable().optional(),
  transportation_completed: z.boolean().nullable().optional(),
  manufacturing_completed: z.boolean().nullable().optional(),
  use_phase_completed: z.boolean().nullable().optional(),
  end_of_life_completed: z.boolean().nullable().optional(),
  total_global_warming: z.number().nullable().optional(),
  total_acidification: z.number().nullable().optional(),
  total_freshwater_ecotoxicity: z.number().nullable().optional(),
  total_marine_ecotoxicity: z.number().nullable().optional(),
  total_terrestrial_ecotoxicity: z.number().nullable().optional(),
  total_energy_resources: z.number().nullable().optional(),
  total_freshwater_eutrophication: z.number().nullable().optional(),
  total_marine_eutrophication: z.number().nullable().optional(),
  total_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_non_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_ionizing_radiation: z.number().nullable().optional(),
  total_land_use: z.number().nullable().optional(),
  total_metals_material_resources: z.number().nullable().optional(),
  total_ozone_depletion: z.number().nullable().optional(),
  total_particulate_matter_formation: z.number().nullable().optional(),
  total_human_health_photochemical_ozone_creation: z
    .number()
    .nullable()
    .optional(),
  total_terrestrial_photochemical_ozone_creation: z
    .number()
    .nullable()
    .optional(),
  total_water_use: z.number().nullable().optional(),
})

const RMHCalculationsSchema = z.object({
  lca_id: z.string().uuid(),
  org_id: z.string(),
  total_global_warming: z.number().nullable().optional(),
  total_acidification: z.number().nullable().optional(),
  total_freshwater_ecotoxicity: z.number().nullable().optional(),
  total_marine_ecotoxicity: z.number().nullable().optional(),
  total_terrestrial_ecotoxicity: z.number().nullable().optional(),
  total_energy_resources: z.number().nullable().optional(),
  total_freshwater_eutrophication: z.number().nullable().optional(),
  total_marine_eutrophication: z.number().nullable().optional(),
  total_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_non_carcinogenic_human_toxicity: z.number().nullable().optional(),
  total_ionizing_radiation: z.number().nullable().optional(),
  total_land_use: z.number().nullable().optional(),
  total_metals_material_resources: z.number().nullable().optional(),
  total_ozone_depletion: z.number().nullable().optional(),
  total_particulate_matter_formation: z.number().nullable().optional(),
  total_human_health_photochemical_ozone_creation: z
    .number()
    .nullable()
    .optional(),
  total_terrestrial_photochemical_ozone_creation: z
    .number()
    .nullable()
    .optional(),
  total_water_use: z.number().nullable().optional(),
})

// Function payload schemas
const UpsertMaterialCompositionSchema = z.object({
  values: z.array(MaterialCompositionDataSchema),
  orgId: z.string().nonempty(),
})

const SupabaseDownloadSchema = z.object({
  bucket: z.string().nonempty(),
  path: z.string().nonempty(),
  orgId: z.string().nonempty(),
})

const UpsertSupplierSchema = z.object({
  values: z.array(SupplierDataSchema),
  orgId: z.string().nonempty(),
})

const UpsertSupplierEngagementSchema = z.object({
  supplierId: z.string().nonempty(),
  retakePartId: z.string().nonempty(),
  orgId: z.string().nonempty(),
  organizationName: z.string().nonempty(),
  partDescription: z.string().nonempty(),
})

const UpsertDisposalSchema = z.object({
  values: z.array(DisposalDataSchema),
  orgId: z.string().nonempty(),
})

const UpsertTransportationSchema = z.object({
  values: z.array(TransportationDataSchema),
  orgId: z.string().nonempty(),
})

const createMaterialCompositionPayload = (orgId: string) =>
  MaterialCompositionDataSchema.transform((values) => ({
    ...values,
    org_id: orgId,
  }))

const createPartsPayload = (orgId: string) =>
  PartsDataSchema.transform((values) => ({
    ...values,
    org_id: values.org_id ?? orgId,
    is_base_material: values.customer_part_id ? false : true,
    supplier_ids: values.supplier_ids ?? [],
  }))

const createSupplierPayload = (orgId: string) =>
  SupplierDataSchema.transform((values) => ({
    ...values,
    org_id: orgId,
    contacts: values.contacts?.filter((contact) => contact !== ""),
  }))

const createDisposalPayload = (orgId: string, lcaId?: string) =>
  DisposalDataSchema.transform((values) => ({
    ...values,
    org_id: orgId,
    lca_id: values?.lca_id ?? lcaId,
  }))

const createTransportationPayload = (orgId: string) =>
  TransportationDataSchema.transform((values) => ({
    ...values,
    org_id: orgId,
  }))

export {
  createPartsPayload,
  createMaterialCompositionPayload,
  createSupplierPayload,
  createDisposalPayload,
  createTransportationPayload,
  SupplierDataSchema,
  FacilityDataSchema,
  FacilityAllocationSchema,
  PurchasedEnergySchema,
  StationaryFuelSchema,
  ServiceLifeSchema,
  UsePhaseSchema,
  UserSchema,
  PartsDataSchema,
  TransportationDataSchema,
  MaterialCompositionDataSchema,
  OrganizationSchema,
  LCACompletionSchema,
  SupabaseDownloadSchema,
  SlackEPDDataSchema,
  SupplierEngagementDataSchema,
  UpsertMaterialCompositionSchema,
  UpsertSupplierSchema,
  UpsertSupplierEngagementSchema,
  UpsertDisposalSchema,
  UpsertTransportationSchema,
  CMLTotalResultsSchema,
  EFTotalResultsSchema,
  RMHTotalResultsSchema,
  CMLCalculationsSchema,
  EFCalculationsSchema,
  RMHCalculationsSchema,
  WithSupplierIdsSchema,
  MaterialCompositionTreeSchema,
}
