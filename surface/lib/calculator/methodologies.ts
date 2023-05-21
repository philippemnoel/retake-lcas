enum Methodology {
  CML = "CML v4.8 2016",
  EF = "EF v3.1 (EN15804)",
  RMH = "ReCiPe v1.03 2016, Midpoint (H)",
}

enum CMLCategories {
  ACIDIFICATION = "Acidification",
  EUTROPHICATION = "Eutrophication",
  GLOBAL_WARMING = "Global Warming",
  OZONE_DEPLETION = "Ozone Depletion",
  HUMAN_TOXICITY = "Human Toxicity",
  FRESWHATER_ECOTOXICITY = "Freshwater Ecotoxicity",
  MARINE_ECOTOXICITY = "Marine Ecotoxicity",
  TERRESTRIAL_ECOTOXICITY = "Terrestrial Ecotoxicity",
  ABIOTIC_DEPLETION = "Abiotic Depletion",
  ABIOTIC_DEPLETION_FOSSIL_FUELS = "Abiotic Depletion (Fossil Fuels)",
  PHOTOCHEMICAL_OZONE_CREATION = "Photochemical Ozone Creation",
}

enum EFCategories {
  ACIDIFICATION = "Acidification",
  GLOBAL_WARMING = "Global Warming",
  BIOGENIC_GLOBAL_WARMING = "Global Warming (Biogenic)",
  FOSSIL_FUEL_GLOBAL_WARMING = "Global Warming (Fossil Fuels)",
  LAND_USE_GLOBAL_WARMING = "Global Warming (Land Use)",
  FRESWATER_ECOTOXICITY = "Freshwater Ecotoxicity",
  FRESHWATER_INORGANIC_ECOTOXICITY = "Freshwater Ecotoxicity (Inorganics)",
  FRESHWATER_ORGANIC_ECOTOXICITY = "Freshwater Ecotoxicity (Organics)",
  ENERGY_RESOURCES = "Energy Resources (Non-Renewable)",
  FRESHWATER_EUTROPHICATION = "Freshwater Eutrophication",
  MARINE_EUTROPHICATION = "Marine Eutrophication",
  TERRESTRIAL_EUTROPHICATION = "Terrestrial Eutrophication",
  CARCINOGENIC_HUMAN_TOXICITY = "Carcinogenic Human Toxicity",
  CARCINOGENIC_INORGANIC_HUMAN_TOXICITY = "Carcinogenic Human Toxicity (Inorganics)",
  CARCINOGENIC_ORGANIC_HUMAN_TOXICITY = "Carcinogenic Human Toxicity (Organics)",
  NON_CARCINOGENIC_HUMAN_TOXICITY = "Non-Carcinogenic Human Toxicity",
  NON_CARCINOGENIC_INORGANIC_HUMAN_TOXICITY = "Non-Carcinogenic Human Toxicity (Inorganics)",
  NON_CARCINOGENIC_ORGANIC_HUMAN_TOXICITY = "Non-Carcinogenic Human Toxicity (Organics)",
  IONIZING_RADIATION = "Ionizing Radiation",
  LAND_USE = "Land Use",
  METALS_MATERIAL_RESOURCES = "Material Resources (Metals/Minerals)",
  OZONE_DEPLETION = "Ozone Depletion",
  PARTICULATE_MATTER_FORMATION = "Particulate Matter Formation",
  PHOTOCHEMICAL_OZONE_CREATION = "Photochemical Ozone Creation",
  WATER_USE = "Water Use",
}

enum RMHCategories {
  ACIDIFICATION = "Acidification (Terrestrial)",
  GLOBAL_WARMING = "Global Warming",
  FRESWHATER_ECOTOXICITY = "Freshwater Ecotoxicity",
  MARINE_ECOTOXICITY = "Marine Ecotoxicity",
  TERRESTRIAL_ECOTOXICITY = "Terrestrial Ecotoxicity",
  ENERGY_RESOURCES = "Energy Resources (Non-Renewable)",
  FRESHWATER_EUTROPHICATION = "Freshwater Eutrophication",
  MARINE_EUTROPHICATION = "Marine Eutrophication",
  CARCINOGENIC_HUMAN_TOXICITY = "Carcinogenic Human Toxicity",
  NON_CARCINOGENIC_HUMAN_TOXICITY = "Non-Carcinogenic Human Toxicity",
  IONIZING_RADIATION = "Ionizing Radiation",
  LAND_USE = "Land Use",
  METALS_MATERIAL_RESOURCES = "Material Resources (Metals/Minerals)",
  OZONE_DEPLETION = "Ozone Depletion",
  PARTICULATE_MATTER_FORMATION = "Particulate Matter Formation",
  HUMAN_HEALTH_PHOTOCHEMICAL_OZONE_CREATION = "Photochemical Ozone Creation (Human Health)",
  TERRESTRIAL_PHOTOCHEMICAL_OZONE_CREATIN = "Photochemical Ozone Creation (Terrestrial Ecosystems)",
  WATER_USE = "Water Use",
}

const CMLDatabaseColumns = {
  [CMLCategories.GLOBAL_WARMING]: "global_warming",
  [CMLCategories.ACIDIFICATION]: "acidification",
  [CMLCategories.EUTROPHICATION]: "eutrophication",
  [CMLCategories.OZONE_DEPLETION]: "ozone_depletion",
  [CMLCategories.HUMAN_TOXICITY]: "human_toxicity",
  [CMLCategories.FRESWHATER_ECOTOXICITY]: "freshwater_ecotoxicity",
  [CMLCategories.MARINE_ECOTOXICITY]: "marine_ecotoxicity",
  [CMLCategories.TERRESTRIAL_ECOTOXICITY]: "terrestrial_ecotoxicity",
  [CMLCategories.ABIOTIC_DEPLETION]: "abiotic_depletion",
  [CMLCategories.ABIOTIC_DEPLETION_FOSSIL_FUELS]:
    "abiotic_depletion_fossil_fuels",
  [CMLCategories.PHOTOCHEMICAL_OZONE_CREATION]: "photochemical_ozone_creation",
}

const EFDatabaseColumns = {
  [EFCategories.ACIDIFICATION]: "acidification",
  [EFCategories.GLOBAL_WARMING]: "global_warming",
  [EFCategories.BIOGENIC_GLOBAL_WARMING]: "biogenic_global_warming",
  [EFCategories.FOSSIL_FUEL_GLOBAL_WARMING]: "fossil_fuel_global_warming",
  [EFCategories.LAND_USE_GLOBAL_WARMING]: "land_use_global_warming",
  [EFCategories.FRESWATER_ECOTOXICITY]: "freshwater_ecotoxicity",
  [EFCategories.FRESHWATER_INORGANIC_ECOTOXICITY]:
    "freshwater_inorganics_ecotoxicity",
  [EFCategories.FRESHWATER_ORGANIC_ECOTOXICITY]:
    "freshwater_organics_ecotoxicity",
  [EFCategories.ENERGY_RESOURCES]: "abiotic_depletion_fossil_fuels",
  [EFCategories.FRESHWATER_EUTROPHICATION]: "freshwater_eutrophication",
  [EFCategories.MARINE_EUTROPHICATION]: "marine_eutrophication",
  [EFCategories.TERRESTRIAL_EUTROPHICATION]: "terrestrial_eutrophication",
  [EFCategories.CARCINOGENIC_HUMAN_TOXICITY]: "carcinogenic_human_toxicity",
  [EFCategories.CARCINOGENIC_INORGANIC_HUMAN_TOXICITY]:
    "carcinogenic_inorganics_human_toxicity",
  [EFCategories.CARCINOGENIC_ORGANIC_HUMAN_TOXICITY]:
    "carcinogenic_organics_human_toxicity",
  [EFCategories.NON_CARCINOGENIC_HUMAN_TOXICITY]:
    "non_carcinogenic_human_toxicity",
  [EFCategories.NON_CARCINOGENIC_INORGANIC_HUMAN_TOXICITY]:
    "non_carcinogenic_inorganics_human_toxicity",
  [EFCategories.NON_CARCINOGENIC_ORGANIC_HUMAN_TOXICITY]:
    "non_carcinogenic_organics_human_toxicity",
  [EFCategories.IONIZING_RADIATION]: "ionizing_radiation",
  [EFCategories.LAND_USE]: "land_use",
  [EFCategories.METALS_MATERIAL_RESOURCES]: "abiotic_depletion",
  [EFCategories.OZONE_DEPLETION]: "ozone_depletion",
  [EFCategories.PARTICULATE_MATTER_FORMATION]: "particulate_matter_formation",
  [EFCategories.PHOTOCHEMICAL_OZONE_CREATION]:
    "human_health_photochemical_ozone_creation",
  [EFCategories.WATER_USE]: "water_use",
}

const RMHDatabaseColumns = {
  [RMHCategories.GLOBAL_WARMING]: "global_warming",
  [RMHCategories.ACIDIFICATION]: "acidification",
  [RMHCategories.FRESWHATER_ECOTOXICITY]: "freshwater_ecotoxicity",
  [RMHCategories.MARINE_ECOTOXICITY]: "marine_ecotoxicity",
  [RMHCategories.TERRESTRIAL_ECOTOXICITY]: "terrestrial_ecotoxicity",
  [RMHCategories.ENERGY_RESOURCES]: "energy_resources",
  [RMHCategories.FRESHWATER_EUTROPHICATION]: "freshwater_eutrophication",
  [RMHCategories.MARINE_EUTROPHICATION]: "marine_eutrophication",
  [RMHCategories.CARCINOGENIC_HUMAN_TOXICITY]: "carcinogenic_human_toxicity",
  [RMHCategories.NON_CARCINOGENIC_HUMAN_TOXICITY]:
    "non_carcinogenic_human_toxicity",
  [RMHCategories.IONIZING_RADIATION]: "ionizing_radiation",
  [RMHCategories.LAND_USE]: "land_use",
  [RMHCategories.METALS_MATERIAL_RESOURCES]: "metals_material_resources",
  [RMHCategories.OZONE_DEPLETION]: "ozone_depletion",
  [RMHCategories.PARTICULATE_MATTER_FORMATION]: "particulate_matter_formation",
  [RMHCategories.HUMAN_HEALTH_PHOTOCHEMICAL_OZONE_CREATION]:
    "human_health_photochemical_ozone_creation",
  [RMHCategories.TERRESTRIAL_PHOTOCHEMICAL_OZONE_CREATIN]:
    "terrestrial_photochemical_ozone_creation",
  [RMHCategories.WATER_USE]: "water_use",
}

const CMLUnits = {
  [CMLCategories.ACIDIFICATION]: "kg SO2-Eq",
  [CMLCategories.EUTROPHICATION]: "kg PO4-Eq",
  [CMLCategories.GLOBAL_WARMING]: "kg CO2-Eq",
  [CMLCategories.OZONE_DEPLETION]: "kg CFC-11-Eq",
  [CMLCategories.HUMAN_TOXICITY]: "kg 1,4-DCB-Eq",
  [CMLCategories.FRESWHATER_ECOTOXICITY]: "kg 1,4-DCB-Eq",
  [CMLCategories.MARINE_ECOTOXICITY]: "kg 1,4-DCB-Eq",
  [CMLCategories.TERRESTRIAL_ECOTOXICITY]: "kg 1,4-DCB-Eq",
  [CMLCategories.ABIOTIC_DEPLETION]: "kg Sb-Eq",
  [CMLCategories.ABIOTIC_DEPLETION_FOSSIL_FUELS]: "MJ",
  [CMLCategories.PHOTOCHEMICAL_OZONE_CREATION]: "kg C2H4-Eq",
}

const EFUnits = {
  [EFCategories.ACIDIFICATION]: "mol H+-Eq",
  [EFCategories.GLOBAL_WARMING]: "kg CO2-Eq",
  [EFCategories.BIOGENIC_GLOBAL_WARMING]: "kg CO2-Eq",
  [EFCategories.FOSSIL_FUEL_GLOBAL_WARMING]: "kg CO2-Eq",
  [EFCategories.LAND_USE_GLOBAL_WARMING]: "kg CO2-Eq",
  [EFCategories.FRESWATER_ECOTOXICITY]: "CTUe",
  [EFCategories.FRESHWATER_INORGANIC_ECOTOXICITY]: "CTUe",
  [EFCategories.FRESHWATER_ORGANIC_ECOTOXICITY]: "CTUe",
  [EFCategories.ENERGY_RESOURCES]: "MJ",
  [EFCategories.FRESHWATER_EUTROPHICATION]: "kg P-Eq",
  [EFCategories.MARINE_EUTROPHICATION]: "kg N-Eq",
  [EFCategories.TERRESTRIAL_EUTROPHICATION]: "mol N-Eq",
  [EFCategories.CARCINOGENIC_HUMAN_TOXICITY]: "CTUh",
  [EFCategories.CARCINOGENIC_INORGANIC_HUMAN_TOXICITY]: "CTUh",
  [EFCategories.CARCINOGENIC_ORGANIC_HUMAN_TOXICITY]: "CTUh",
  [EFCategories.NON_CARCINOGENIC_HUMAN_TOXICITY]: "CTUh",
  [EFCategories.NON_CARCINOGENIC_INORGANIC_HUMAN_TOXICITY]: "CTUh",
  [EFCategories.NON_CARCINOGENIC_ORGANIC_HUMAN_TOXICITY]: "CTUh",
  [EFCategories.IONIZING_RADIATION]: "kBq U235-Eq",
  [EFCategories.LAND_USE]: "(Soil Quality Index)",
  [EFCategories.METALS_MATERIAL_RESOURCES]: "kg Sb-Eq",
  [EFCategories.OZONE_DEPLETION]: "kg CFC-11-Eq",
  [EFCategories.PARTICULATE_MATTER_FORMATION]: "Disease Incidence",
  [EFCategories.PHOTOCHEMICAL_OZONE_CREATION]: "kg NMVOC-Eq",
  [EFCategories.WATER_USE]: "m3 world",
}

const RMHUnits = {
  [RMHCategories.GLOBAL_WARMING]: "kg CO2-Eq",
  [RMHCategories.ACIDIFICATION]: "kg SO2-Eq",
  [RMHCategories.FRESWHATER_ECOTOXICITY]: "kg 1,4-DCB-Eq",
  [RMHCategories.MARINE_ECOTOXICITY]: "kg 1,4-DCB-Eq",
  [RMHCategories.TERRESTRIAL_ECOTOXICITY]: "kg 1,4-DCB-Eq",
  [RMHCategories.ENERGY_RESOURCES]: "kg oil-Eq",
  [RMHCategories.FRESHWATER_EUTROPHICATION]: "kg P-Eq",
  [RMHCategories.MARINE_EUTROPHICATION]: "kg N-Eq",
  [RMHCategories.CARCINOGENIC_HUMAN_TOXICITY]: "kg 1,4-DCB-Eq",
  [RMHCategories.NON_CARCINOGENIC_HUMAN_TOXICITY]: "kg 1,4-DCB-Eq",
  [RMHCategories.IONIZING_RADIATION]: "kBq Co-60-Eq",
  [RMHCategories.LAND_USE]: "m2*a crop-Eq",
  [RMHCategories.METALS_MATERIAL_RESOURCES]: "kg Cu-Eq",
  [RMHCategories.OZONE_DEPLETION]: "kg CFC-11-Eq",
  [RMHCategories.PARTICULATE_MATTER_FORMATION]: "kg PM2.5-Eq",
  [RMHCategories.HUMAN_HEALTH_PHOTOCHEMICAL_OZONE_CREATION]: "kg NOx-Eq",
  [RMHCategories.TERRESTRIAL_PHOTOCHEMICAL_OZONE_CREATIN]: "kg NOx-Eq",
  [RMHCategories.WATER_USE]: "m3",
}

const ImpactCategories = {
  [Methodology.CML]: CMLDatabaseColumns,
  [Methodology.EF]: EFDatabaseColumns,
  [Methodology.RMH]: RMHDatabaseColumns,
}

const methodologies = [Methodology.CML, Methodology.EF, Methodology.RMH]

export {
  methodologies,
  Methodology,
  ImpactCategories,
  CMLUnits,
  EFUnits,
  RMHUnits,
  CMLCategories,
  EFCategories,
  RMHCategories,
  CMLDatabaseColumns,
  EFDatabaseColumns,
  RMHDatabaseColumns,
}
