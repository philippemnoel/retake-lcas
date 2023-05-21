export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          additional_data: string | null
          additional_details: string | null
          created_at: string | null
          date: string | null
          description: string | null
          document_bucket: string | null
          document_path: string | null
          factor: number | null
          factor_explanation: string | null
          factor_source: string | null
          ghg_category: string | null
          id: string
          last_updated: string | null
          org_id: string
          quantity: number | null
          region: string | null
          retake_approved: boolean | null
          total_kg_co2e: number | null
          units: string | null
          user_approved: boolean | null
          vendor: string | null
          vendor_id: string | null
          year: number | null
        }
        Insert: {
          additional_data?: string | null
          additional_details?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          document_bucket?: string | null
          document_path?: string | null
          factor?: number | null
          factor_explanation?: string | null
          factor_source?: string | null
          ghg_category?: string | null
          id?: string
          last_updated?: string | null
          org_id: string
          quantity?: number | null
          region?: string | null
          retake_approved?: boolean | null
          total_kg_co2e?: number | null
          units?: string | null
          user_approved?: boolean | null
          vendor?: string | null
          vendor_id?: string | null
          year?: number | null
        }
        Update: {
          additional_data?: string | null
          additional_details?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          document_bucket?: string | null
          document_path?: string | null
          factor?: number | null
          factor_explanation?: string | null
          factor_source?: string | null
          ghg_category?: string | null
          id?: string
          last_updated?: string | null
          org_id?: string
          quantity?: number | null
          region?: string | null
          retake_approved?: boolean | null
          total_kg_co2e?: number | null
          units?: string | null
          user_approved?: boolean | null
          vendor?: string | null
          vendor_id?: string | null
          year?: number | null
        }
      }
      cml_end_of_life_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
      }
      cml_manufacturing_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
      }
      cml_materials_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
      }
      cml_total_results: {
        Row: {
          customer_part_id: string | null
          end_of_life_completed: boolean | null
          impact_source: string | null
          lca_id: string
          long_description: string | null
          manufacturing_completed: boolean | null
          material_composition_id: string | null
          materials_completed: boolean | null
          org_id: string | null
          part_description: string | null
          retake_part_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
          transportation_completed: boolean | null
          use_phase_completed: boolean | null
          weight_grams: number | null
        }
        Insert: {
          customer_part_id?: string | null
          end_of_life_completed?: boolean | null
          impact_source?: string | null
          lca_id: string
          long_description?: string | null
          manufacturing_completed?: boolean | null
          material_composition_id?: string | null
          materials_completed?: boolean | null
          org_id?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          transportation_completed?: boolean | null
          use_phase_completed?: boolean | null
          weight_grams?: number | null
        }
        Update: {
          customer_part_id?: string | null
          end_of_life_completed?: boolean | null
          impact_source?: string | null
          lca_id?: string
          long_description?: string | null
          manufacturing_completed?: boolean | null
          material_composition_id?: string | null
          materials_completed?: boolean | null
          org_id?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          transportation_completed?: boolean | null
          use_phase_completed?: boolean | null
          weight_grams?: number | null
        }
      }
      cml_transportation_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
      }
      cml_use_phase_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_eutrophication?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_toxicity?: number | null
          total_marine_ecotoxicity?: number | null
          total_ozone_depletion?: number | null
          total_photochemical_ozone_creation?: number | null
          total_terrestrial_ecotoxicity?: number | null
        }
      }
      ef_end_of_life_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
      }
      ef_manufacturing_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
      }
      ef_materials_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
      }
      ef_total_results: {
        Row: {
          customer_part_id: string | null
          end_of_life_completed: boolean | null
          impact_source: string | null
          lca_id: string
          long_description: string | null
          manufacturing_completed: boolean | null
          material_composition_id: string | null
          materials_completed: boolean | null
          org_id: string | null
          part_description: string | null
          retake_part_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
          transportation_completed: boolean | null
          use_phase_completed: boolean | null
          weight_grams: number | null
        }
        Insert: {
          customer_part_id?: string | null
          end_of_life_completed?: boolean | null
          impact_source?: string | null
          lca_id: string
          long_description?: string | null
          manufacturing_completed?: boolean | null
          material_composition_id?: string | null
          materials_completed?: boolean | null
          org_id?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
          transportation_completed?: boolean | null
          use_phase_completed?: boolean | null
          weight_grams?: number | null
        }
        Update: {
          customer_part_id?: string | null
          end_of_life_completed?: boolean | null
          impact_source?: string | null
          lca_id?: string
          long_description?: string | null
          manufacturing_completed?: boolean | null
          material_composition_id?: string | null
          materials_completed?: boolean | null
          org_id?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
          transportation_completed?: boolean | null
          use_phase_completed?: boolean | null
          weight_grams?: number | null
        }
      }
      ef_transportation_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
      }
      ef_use_phase_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_abiotic_depletion?: number | null
          total_abiotic_depletion_fossil_fuels?: number | null
          total_acidification?: number | null
          total_biogenic_global_warming?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_carcinogenic_inorganics_human_toxicity?: number | null
          total_carcinogenic_organics_human_toxicity?: number | null
          total_fossil_fuel_global_warming?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_freshwater_inorganics_ecotoxicity?: number | null
          total_freshwater_organics_ecotoxicity?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_land_use_global_warming?: number | null
          total_marine_eutrophication?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_non_carcinogenic_inorganics_human_toxicity?: number | null
          total_non_carcinogenic_organics_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_eutrophication?: number | null
          total_water_use?: number | null
        }
      }
      end_of_life: {
        Row: {
          created_at: string | null
          description: string | null
          factor_id: string | null
          id: string
          lca_id: string | null
          location: string | null
          org_id: string | null
          weight_grams: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          factor_id?: string | null
          id?: string
          lca_id?: string | null
          location?: string | null
          org_id?: string | null
          weight_grams?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          factor_id?: string | null
          id?: string
          lca_id?: string | null
          location?: string | null
          org_id?: string | null
          weight_grams?: number | null
        }
      }
      facilities: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string | null
          org_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          location?: string | null
          name?: string | null
          org_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string | null
          org_id?: string | null
        }
      }
      facility_allocation: {
        Row: {
          created_at: string | null
          facility_id: string
          id: string
          lca_id: string | null
          org_id: string | null
          percent_revenue: number | null
          quantity_produced: number | null
        }
        Insert: {
          created_at?: string | null
          facility_id: string
          id?: string
          lca_id?: string | null
          org_id?: string | null
          percent_revenue?: number | null
          quantity_produced?: number | null
        }
        Update: {
          created_at?: string | null
          facility_id?: string
          id?: string
          lca_id?: string | null
          org_id?: string | null
          percent_revenue?: number | null
          quantity_produced?: number | null
        }
      }
      material_composition: {
        Row: {
          created_at: string | null
          id: string
          lca_id: string | null
          level: number | null
          org_id: string | null
          parent_id: string | null
          retake_part_id: string | null
          supplier_id: string | null
          weight_grams: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lca_id?: string | null
          level?: number | null
          org_id?: string | null
          parent_id?: string | null
          retake_part_id?: string | null
          supplier_id?: string | null
          weight_grams?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lca_id?: string | null
          level?: number | null
          org_id?: string | null
          parent_id?: string | null
          retake_part_id?: string | null
          supplier_id?: string | null
          weight_grams?: number | null
        }
      }
      messages: {
        Row: {
          date: string | null
          from: string | null
          id: string
          org_id: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          date?: string | null
          from?: string | null
          id: string
          org_id?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          date?: string | null
          from?: string | null
          id?: string
          org_id?: string | null
          status?: string | null
          type?: string | null
        }
      }
      messages_attachments: {
        Row: {
          bucket: string | null
          id: string
          message_id: string | null
          path: string | null
        }
        Insert: {
          bucket?: string | null
          id: string
          message_id?: string | null
          path?: string | null
        }
        Update: {
          bucket?: string | null
          id?: string
          message_id?: string | null
          path?: string | null
        }
      }
      organization_email_servers: {
        Row: {
          id: number
          inbound_address: string | null
          name: string | null
          org_id: string | null
          type: string | null
        }
        Insert: {
          id?: number
          inbound_address?: string | null
          name?: string | null
          org_id?: string | null
          type?: string | null
        }
        Update: {
          id?: number
          inbound_address?: string | null
          name?: string | null
          org_id?: string | null
          type?: string | null
        }
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          website?: string | null
        }
      }
      parts: {
        Row: {
          created_at: string | null
          customer_part_id: string | null
          is_base_material: boolean
          long_description: string | null
          manufacturing_process: string | null
          org_id: string | null
          origin: string | null
          part_description: string | null
          primary_material: string | null
          retake_part_id: string
          supplier_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          customer_part_id?: string | null
          is_base_material?: boolean
          long_description?: string | null
          manufacturing_process?: string | null
          org_id?: string | null
          origin?: string | null
          part_description?: string | null
          primary_material?: string | null
          retake_part_id: string
          supplier_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          customer_part_id?: string | null
          is_base_material?: boolean
          long_description?: string | null
          manufacturing_process?: string | null
          org_id?: string | null
          origin?: string | null
          part_description?: string | null
          primary_material?: string | null
          retake_part_id?: string
          supplier_ids?: string[] | null
        }
      }
      parts_third_party_factors: {
        Row: {
          factor_id: string
          retake_part_id: string
        }
        Insert: {
          factor_id: string
          retake_part_id: string
        }
        Update: {
          factor_id?: string
          retake_part_id?: string
        }
      }
      purchased_energy: {
        Row: {
          created_at: string | null
          description: string | null
          facility_id: string | null
          factor_id: string | null
          id: string
          org_id: string | null
          percent_renewable: number | null
          quantity_kwh: number | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          factor_id?: string | null
          id?: string
          org_id?: string | null
          percent_renewable?: number | null
          quantity_kwh?: number | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          facility_id?: string | null
          factor_id?: string | null
          id?: string
          org_id?: string | null
          percent_renewable?: number | null
          quantity_kwh?: number | null
          year?: number | null
        }
      }
      regions: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
      }
      retake_factors: {
        Row: {
          cml_ac: number | null
          cml_ad: number | null
          cml_ad_ff: number | null
          cml_eu: number | null
          cml_f_et: number | null
          cml_g: number | null
          cml_h_et: number | null
          cml_m_et: number | null
          cml_oc: number | null
          cml_od: number | null
          cml_t_et: number | null
          created_at: string | null
          ef_ac: number | null
          ef_ad: number | null
          ef_ad_ff: number | null
          ef_b_g: number | null
          ef_cht: number | null
          ef_ciht: number | null
          ef_coht: number | null
          ef_f_et: number | null
          ef_f_eu: number | null
          ef_f_i_et: number | null
          ef_f_o_et: number | null
          ef_ff_g: number | null
          ef_g: number | null
          ef_hh_oc: number | null
          ef_ir: number | null
          ef_l: number | null
          ef_l_g: number | null
          ef_m_eu: number | null
          ef_ncht: number | null
          ef_nciht: number | null
          ef_ncoht: number | null
          ef_od: number | null
          ef_pm: number | null
          ef_t_eu: number | null
          ef_w: number | null
          factor_id: string
          retake_part_id: string | null
          rmh_cht: number | null
          rmh_er: number | null
          rmh_f_et: number | null
          rmh_f_eu: number | null
          rmh_g: number | null
          rmh_hh_oc: number | null
          rmh_ir: number | null
          rmh_l: number | null
          rmh_m_et: number | null
          rmh_m_eu: number | null
          rmh_mm_r: number | null
          rmh_ncht: number | null
          rmh_od: number | null
          rmh_pm: number | null
          rmh_t_ac: number | null
          rmh_t_et: number | null
          rmh_t_oc: number | null
          rmh_w: number | null
          supplier_id: string | null
          t_ac: number | null
          t_cht: number | null
          t_eu: number | null
          t_f_et: number | null
          t_g: number | null
          t_nc_ac: number | null
          t_oc: number | null
          t_od: number | null
          t_pm: number | null
        }
        Insert: {
          cml_ac?: number | null
          cml_ad?: number | null
          cml_ad_ff?: number | null
          cml_eu?: number | null
          cml_f_et?: number | null
          cml_g?: number | null
          cml_h_et?: number | null
          cml_m_et?: number | null
          cml_oc?: number | null
          cml_od?: number | null
          cml_t_et?: number | null
          created_at?: string | null
          ef_ac?: number | null
          ef_ad?: number | null
          ef_ad_ff?: number | null
          ef_b_g?: number | null
          ef_cht?: number | null
          ef_ciht?: number | null
          ef_coht?: number | null
          ef_f_et?: number | null
          ef_f_eu?: number | null
          ef_f_i_et?: number | null
          ef_f_o_et?: number | null
          ef_ff_g?: number | null
          ef_g?: number | null
          ef_hh_oc?: number | null
          ef_ir?: number | null
          ef_l?: number | null
          ef_l_g?: number | null
          ef_m_eu?: number | null
          ef_ncht?: number | null
          ef_nciht?: number | null
          ef_ncoht?: number | null
          ef_od?: number | null
          ef_pm?: number | null
          ef_t_eu?: number | null
          ef_w?: number | null
          factor_id?: string
          retake_part_id?: string | null
          rmh_cht?: number | null
          rmh_er?: number | null
          rmh_f_et?: number | null
          rmh_f_eu?: number | null
          rmh_g?: number | null
          rmh_hh_oc?: number | null
          rmh_ir?: number | null
          rmh_l?: number | null
          rmh_m_et?: number | null
          rmh_m_eu?: number | null
          rmh_mm_r?: number | null
          rmh_ncht?: number | null
          rmh_od?: number | null
          rmh_pm?: number | null
          rmh_t_ac?: number | null
          rmh_t_et?: number | null
          rmh_t_oc?: number | null
          rmh_w?: number | null
          supplier_id?: string | null
          t_ac?: number | null
          t_cht?: number | null
          t_eu?: number | null
          t_f_et?: number | null
          t_g?: number | null
          t_nc_ac?: number | null
          t_oc?: number | null
          t_od?: number | null
          t_pm?: number | null
        }
        Update: {
          cml_ac?: number | null
          cml_ad?: number | null
          cml_ad_ff?: number | null
          cml_eu?: number | null
          cml_f_et?: number | null
          cml_g?: number | null
          cml_h_et?: number | null
          cml_m_et?: number | null
          cml_oc?: number | null
          cml_od?: number | null
          cml_t_et?: number | null
          created_at?: string | null
          ef_ac?: number | null
          ef_ad?: number | null
          ef_ad_ff?: number | null
          ef_b_g?: number | null
          ef_cht?: number | null
          ef_ciht?: number | null
          ef_coht?: number | null
          ef_f_et?: number | null
          ef_f_eu?: number | null
          ef_f_i_et?: number | null
          ef_f_o_et?: number | null
          ef_ff_g?: number | null
          ef_g?: number | null
          ef_hh_oc?: number | null
          ef_ir?: number | null
          ef_l?: number | null
          ef_l_g?: number | null
          ef_m_eu?: number | null
          ef_ncht?: number | null
          ef_nciht?: number | null
          ef_ncoht?: number | null
          ef_od?: number | null
          ef_pm?: number | null
          ef_t_eu?: number | null
          ef_w?: number | null
          factor_id?: string
          retake_part_id?: string | null
          rmh_cht?: number | null
          rmh_er?: number | null
          rmh_f_et?: number | null
          rmh_f_eu?: number | null
          rmh_g?: number | null
          rmh_hh_oc?: number | null
          rmh_ir?: number | null
          rmh_l?: number | null
          rmh_m_et?: number | null
          rmh_m_eu?: number | null
          rmh_mm_r?: number | null
          rmh_ncht?: number | null
          rmh_od?: number | null
          rmh_pm?: number | null
          rmh_t_ac?: number | null
          rmh_t_et?: number | null
          rmh_t_oc?: number | null
          rmh_w?: number | null
          supplier_id?: string | null
          t_ac?: number | null
          t_cht?: number | null
          t_eu?: number | null
          t_f_et?: number | null
          t_g?: number | null
          t_nc_ac?: number | null
          t_oc?: number | null
          t_od?: number | null
          t_pm?: number | null
        }
      }
      rmh_end_of_life_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
      }
      rmh_manufacturing_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
      }
      rmh_materials_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
      }
      rmh_total_results: {
        Row: {
          customer_part_id: string | null
          end_of_life_completed: boolean | null
          impact_source: string | null
          lca_id: string
          long_description: string | null
          manufacturing_completed: boolean | null
          material_composition_id: string | null
          materials_completed: boolean | null
          org_id: string | null
          part_description: string | null
          retake_part_id: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
          transportation_completed: boolean | null
          use_phase_completed: boolean | null
          weight_grams: number | null
        }
        Insert: {
          customer_part_id?: string | null
          end_of_life_completed?: boolean | null
          impact_source?: string | null
          lca_id: string
          long_description?: string | null
          manufacturing_completed?: boolean | null
          material_composition_id?: string | null
          materials_completed?: boolean | null
          org_id?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
          transportation_completed?: boolean | null
          use_phase_completed?: boolean | null
          weight_grams?: number | null
        }
        Update: {
          customer_part_id?: string | null
          end_of_life_completed?: boolean | null
          impact_source?: string | null
          lca_id?: string
          long_description?: string | null
          manufacturing_completed?: boolean | null
          material_composition_id?: string | null
          materials_completed?: boolean | null
          org_id?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
          transportation_completed?: boolean | null
          use_phase_completed?: boolean | null
          weight_grams?: number | null
        }
      }
      rmh_transportation_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
      }
      rmh_use_phase_results: {
        Row: {
          lca_id: string
          org_id: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
        }
        Insert: {
          lca_id: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
        Update: {
          lca_id?: string
          org_id?: string | null
          total_acidification?: number | null
          total_carcinogenic_human_toxicity?: number | null
          total_energy_resources?: number | null
          total_freshwater_ecotoxicity?: number | null
          total_freshwater_eutrophication?: number | null
          total_global_warming?: number | null
          total_human_health_photochemical_ozone_creation?: number | null
          total_ionizing_radiation?: number | null
          total_land_use?: number | null
          total_marine_ecotoxicity?: number | null
          total_marine_eutrophication?: number | null
          total_metals_material_resources?: number | null
          total_non_carcinogenic_human_toxicity?: number | null
          total_ozone_depletion?: number | null
          total_particulate_matter_formation?: number | null
          total_terrestrial_ecotoxicity?: number | null
          total_terrestrial_photochemical_ozone_creation?: number | null
          total_water_use?: number | null
        }
      }
      seed_companies: {
        Row: {
          "# Employees": number | null
          "Account Owner": string | null
          "Account Stage": string | null
          "Annual Revenue": number | null
          "Apollo Account Id": string | null
          Company: string | null
          "Company Address": string | null
          "Company City": string | null
          "Company Country": string | null
          "Company Linkedin Url": string | null
          "Company Name for Emails": string | null
          "Company Phone": string | null
          "Company Postal Code": string | null
          "Company State": string | null
          "Company Street": string | null
          "Facebook Url": string | null
          "Founded Year": number | null
          Industry: string | null
          Keywords: string | null
          "Last Raised At": string | null
          "Latest Funding": string | null
          "Latest Funding Amount": number | null
          Lists: string | null
          "Logo Url": string | null
          "Number of Retail Locations": string | null
          "SEO Description": string | null
          "Short Description": string | null
          "SIC Codes": string | null
          Technologies: string | null
          "Total Funding": number | null
          "Twitter Url": string | null
          Website: string | null
        }
        Insert: {
          "# Employees"?: number | null
          "Account Owner"?: string | null
          "Account Stage"?: string | null
          "Annual Revenue"?: number | null
          "Apollo Account Id"?: string | null
          Company?: string | null
          "Company Address"?: string | null
          "Company City"?: string | null
          "Company Country"?: string | null
          "Company Linkedin Url"?: string | null
          "Company Name for Emails"?: string | null
          "Company Phone"?: string | null
          "Company Postal Code"?: string | null
          "Company State"?: string | null
          "Company Street"?: string | null
          "Facebook Url"?: string | null
          "Founded Year"?: number | null
          Industry?: string | null
          Keywords?: string | null
          "Last Raised At"?: string | null
          "Latest Funding"?: string | null
          "Latest Funding Amount"?: number | null
          Lists?: string | null
          "Logo Url"?: string | null
          "Number of Retail Locations"?: string | null
          "SEO Description"?: string | null
          "Short Description"?: string | null
          "SIC Codes"?: string | null
          Technologies?: string | null
          "Total Funding"?: number | null
          "Twitter Url"?: string | null
          Website?: string | null
        }
        Update: {
          "# Employees"?: number | null
          "Account Owner"?: string | null
          "Account Stage"?: string | null
          "Annual Revenue"?: number | null
          "Apollo Account Id"?: string | null
          Company?: string | null
          "Company Address"?: string | null
          "Company City"?: string | null
          "Company Country"?: string | null
          "Company Linkedin Url"?: string | null
          "Company Name for Emails"?: string | null
          "Company Phone"?: string | null
          "Company Postal Code"?: string | null
          "Company State"?: string | null
          "Company Street"?: string | null
          "Facebook Url"?: string | null
          "Founded Year"?: number | null
          Industry?: string | null
          Keywords?: string | null
          "Last Raised At"?: string | null
          "Latest Funding"?: string | null
          "Latest Funding Amount"?: number | null
          Lists?: string | null
          "Logo Url"?: string | null
          "Number of Retail Locations"?: string | null
          "SEO Description"?: string | null
          "Short Description"?: string | null
          "SIC Codes"?: string | null
          Technologies?: string | null
          "Total Funding"?: number | null
          "Twitter Url"?: string | null
          Website?: string | null
        }
      }
      service_life: {
        Row: {
          created_at: string | null
          has_use_phase: boolean | null
          id: string
          lca_id: string
          org_id: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          has_use_phase?: boolean | null
          id?: string
          lca_id: string
          org_id?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          has_use_phase?: boolean | null
          id?: string
          lca_id?: string
          org_id?: string | null
          quantity?: number | null
          unit?: string | null
        }
      }
      stationary_fuel: {
        Row: {
          description: string | null
          facility_id: string | null
          factor_id: string | null
          id: string
          org_id: string | null
          quantity_mj: number | null
          year: number | null
        }
        Insert: {
          description?: string | null
          facility_id?: string | null
          factor_id?: string | null
          id?: string
          org_id?: string | null
          quantity_mj?: number | null
          year?: number | null
        }
        Update: {
          description?: string | null
          facility_id?: string | null
          factor_id?: string | null
          id?: string
          org_id?: string | null
          quantity_mj?: number | null
          year?: number | null
        }
      }
      supplier_product_engagement: {
        Row: {
          created_at: string | null
          fully_completed: boolean | null
          id: string
          manufacturing_completed: boolean | null
          materials_completed: boolean | null
          org_id: string | null
          organization_name: string | null
          part_description: string | null
          retake_part_id: string | null
          supplier_id: string | null
          welcome_completed: boolean | null
        }
        Insert: {
          created_at?: string | null
          fully_completed?: boolean | null
          id: string
          manufacturing_completed?: boolean | null
          materials_completed?: boolean | null
          org_id?: string | null
          organization_name?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          supplier_id?: string | null
          welcome_completed?: boolean | null
        }
        Update: {
          created_at?: string | null
          fully_completed?: boolean | null
          id?: string
          manufacturing_completed?: boolean | null
          materials_completed?: boolean | null
          org_id?: string | null
          organization_name?: string | null
          part_description?: string | null
          retake_part_id?: string | null
          supplier_id?: string | null
          welcome_completed?: boolean | null
        }
      }
      suppliers: {
        Row: {
          contacts: string[] | null
          created_at: string | null
          id: string
          most_recent_disclosure: string | null
          name: string | null
          org_id: string | null
          website: string | null
        }
        Insert: {
          contacts?: string[] | null
          created_at?: string | null
          id: string
          most_recent_disclosure?: string | null
          name?: string | null
          org_id?: string | null
          website?: string | null
        }
        Update: {
          contacts?: string[] | null
          created_at?: string | null
          id?: string
          most_recent_disclosure?: string | null
          name?: string | null
          org_id?: string | null
          website?: string | null
        }
      }
      supported_utilities: {
        Row: {
          country: string | null
          hasMFA: boolean | null
          providerId: string | null
          providerName: string | null
          RTCV: boolean | null
          serviceType: string | null
        }
        Insert: {
          country?: string | null
          hasMFA?: boolean | null
          providerId?: string | null
          providerName?: string | null
          RTCV?: boolean | null
          serviceType?: string | null
        }
        Update: {
          country?: string | null
          hasMFA?: boolean | null
          providerId?: string | null
          providerName?: string | null
          RTCV?: boolean | null
          serviceType?: string | null
        }
      }
      third_party_factors: {
        Row: {
          activity_name: string | null
          activity_type: string | null
          cml_ac: number | null
          cml_ad: number | null
          cml_ad_ff: number | null
          cml_eu: number | null
          cml_f_et: number | null
          cml_g: number | null
          cml_h_et: number | null
          cml_m_et: number | null
          cml_oc: number | null
          cml_od: number | null
          cml_t_et: number | null
          database_name: string | null
          ef_ac: number | null
          ef_ad: number | null
          ef_ad_ff: number | null
          ef_b_g: number | null
          ef_cht: number | null
          ef_ciht: number | null
          ef_coht: number | null
          ef_f_et: number | null
          ef_f_eu: number | null
          ef_f_i_et: number | null
          ef_f_o_et: number | null
          ef_ff_g: number | null
          ef_g: number | null
          ef_hh_oc: number | null
          ef_ir: number | null
          ef_l: number | null
          ef_l_g: number | null
          ef_m_eu: number | null
          ef_ncht: number | null
          ef_nciht: number | null
          ef_ncoht: number | null
          ef_od: number | null
          ef_pm: number | null
          ef_t_eu: number | null
          ef_w: number | null
          factor_id: string
          location: string | null
          reference_product_name: string | null
          reference_unit: string | null
          rmh_cht: number | null
          rmh_er: number | null
          rmh_f_et: number | null
          rmh_f_eu: number | null
          rmh_g: number | null
          rmh_hh_oc: number | null
          rmh_ir: number | null
          rmh_l: number | null
          rmh_m_et: number | null
          rmh_m_eu: number | null
          rmh_mm_r: number | null
          rmh_ncht: number | null
          rmh_od: number | null
          rmh_pm: number | null
          rmh_t_ac: number | null
          rmh_t_et: number | null
          rmh_t_oc: number | null
          rmh_w: number | null
          sector: string | null
          t_ac: number | null
          t_cht: number | null
          t_eu: number | null
          t_f_et: number | null
          t_g: number | null
          t_nc_ac: number | null
          t_oc: number | null
          t_od: number | null
          t_pm: number | null
        }
        Insert: {
          activity_name?: string | null
          activity_type?: string | null
          cml_ac?: number | null
          cml_ad?: number | null
          cml_ad_ff?: number | null
          cml_eu?: number | null
          cml_f_et?: number | null
          cml_g?: number | null
          cml_h_et?: number | null
          cml_m_et?: number | null
          cml_oc?: number | null
          cml_od?: number | null
          cml_t_et?: number | null
          database_name?: string | null
          ef_ac?: number | null
          ef_ad?: number | null
          ef_ad_ff?: number | null
          ef_b_g?: number | null
          ef_cht?: number | null
          ef_ciht?: number | null
          ef_coht?: number | null
          ef_f_et?: number | null
          ef_f_eu?: number | null
          ef_f_i_et?: number | null
          ef_f_o_et?: number | null
          ef_ff_g?: number | null
          ef_g?: number | null
          ef_hh_oc?: number | null
          ef_ir?: number | null
          ef_l?: number | null
          ef_l_g?: number | null
          ef_m_eu?: number | null
          ef_ncht?: number | null
          ef_nciht?: number | null
          ef_ncoht?: number | null
          ef_od?: number | null
          ef_pm?: number | null
          ef_t_eu?: number | null
          ef_w?: number | null
          factor_id: string
          location?: string | null
          reference_product_name?: string | null
          reference_unit?: string | null
          rmh_cht?: number | null
          rmh_er?: number | null
          rmh_f_et?: number | null
          rmh_f_eu?: number | null
          rmh_g?: number | null
          rmh_hh_oc?: number | null
          rmh_ir?: number | null
          rmh_l?: number | null
          rmh_m_et?: number | null
          rmh_m_eu?: number | null
          rmh_mm_r?: number | null
          rmh_ncht?: number | null
          rmh_od?: number | null
          rmh_pm?: number | null
          rmh_t_ac?: number | null
          rmh_t_et?: number | null
          rmh_t_oc?: number | null
          rmh_w?: number | null
          sector?: string | null
          t_ac?: number | null
          t_cht?: number | null
          t_eu?: number | null
          t_f_et?: number | null
          t_g?: number | null
          t_nc_ac?: number | null
          t_oc?: number | null
          t_od?: number | null
          t_pm?: number | null
        }
        Update: {
          activity_name?: string | null
          activity_type?: string | null
          cml_ac?: number | null
          cml_ad?: number | null
          cml_ad_ff?: number | null
          cml_eu?: number | null
          cml_f_et?: number | null
          cml_g?: number | null
          cml_h_et?: number | null
          cml_m_et?: number | null
          cml_oc?: number | null
          cml_od?: number | null
          cml_t_et?: number | null
          database_name?: string | null
          ef_ac?: number | null
          ef_ad?: number | null
          ef_ad_ff?: number | null
          ef_b_g?: number | null
          ef_cht?: number | null
          ef_ciht?: number | null
          ef_coht?: number | null
          ef_f_et?: number | null
          ef_f_eu?: number | null
          ef_f_i_et?: number | null
          ef_f_o_et?: number | null
          ef_ff_g?: number | null
          ef_g?: number | null
          ef_hh_oc?: number | null
          ef_ir?: number | null
          ef_l?: number | null
          ef_l_g?: number | null
          ef_m_eu?: number | null
          ef_ncht?: number | null
          ef_nciht?: number | null
          ef_ncoht?: number | null
          ef_od?: number | null
          ef_pm?: number | null
          ef_t_eu?: number | null
          ef_w?: number | null
          factor_id?: string
          location?: string | null
          reference_product_name?: string | null
          reference_unit?: string | null
          rmh_cht?: number | null
          rmh_er?: number | null
          rmh_f_et?: number | null
          rmh_f_eu?: number | null
          rmh_g?: number | null
          rmh_hh_oc?: number | null
          rmh_ir?: number | null
          rmh_l?: number | null
          rmh_m_et?: number | null
          rmh_m_eu?: number | null
          rmh_mm_r?: number | null
          rmh_ncht?: number | null
          rmh_od?: number | null
          rmh_pm?: number | null
          rmh_t_ac?: number | null
          rmh_t_et?: number | null
          rmh_t_oc?: number | null
          rmh_w?: number | null
          sector?: string | null
          t_ac?: number | null
          t_cht?: number | null
          t_eu?: number | null
          t_f_et?: number | null
          t_g?: number | null
          t_nc_ac?: number | null
          t_oc?: number | null
          t_od?: number | null
          t_pm?: number | null
        }
      }
      transportation: {
        Row: {
          created_at: string | null
          destination: string | null
          distance_km: number | null
          factor_id: string | null
          id: string
          lca_id: string | null
          material_composition_id: string
          org_id: string | null
          origin: string | null
          transportation_type: string | null
        }
        Insert: {
          created_at?: string | null
          destination?: string | null
          distance_km?: number | null
          factor_id?: string | null
          id?: string
          lca_id?: string | null
          material_composition_id: string
          org_id?: string | null
          origin?: string | null
          transportation_type?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string | null
          distance_km?: number | null
          factor_id?: string | null
          id?: string
          lca_id?: string | null
          material_composition_id?: string
          org_id?: string | null
          origin?: string | null
          transportation_type?: string | null
        }
      }
      units: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
      }
      use_phase: {
        Row: {
          factor_id: string | null
          id: string
          lca_id: string | null
          location: string | null
          org_id: string | null
          percent_at_location: number | null
          quantity: number | null
          use_type: Database["public"]["Enums"]["use_type_enum"] | null
        }
        Insert: {
          factor_id?: string | null
          id?: string
          lca_id?: string | null
          location?: string | null
          org_id?: string | null
          percent_at_location?: number | null
          quantity?: number | null
          use_type?: Database["public"]["Enums"]["use_type_enum"] | null
        }
        Update: {
          factor_id?: string | null
          id?: string
          lca_id?: string | null
          location?: string | null
          org_id?: string | null
          percent_at_location?: number | null
          quantity?: number | null
          use_type?: Database["public"]["Enums"]["use_type_enum"] | null
        }
      }
      users: {
        Row: {
          created_at: string | null
          custom_email_verified: boolean | null
          email: string | null
          email_verified: boolean | null
          family_name: string | null
          given_name: string | null
          id: string
          locale: string | null
          name: string | null
          nickname: string | null
          org_id: string | null
          picture: string | null
          sender_signature: string | null
          sid: string | null
          sub: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_email_verified?: boolean | null
          email?: string | null
          email_verified?: boolean | null
          family_name?: string | null
          given_name?: string | null
          id: string
          locale?: string | null
          name?: string | null
          nickname?: string | null
          org_id?: string | null
          picture?: string | null
          sender_signature?: string | null
          sid?: string | null
          sub?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_email_verified?: boolean | null
          email?: string | null
          email_verified?: boolean | null
          family_name?: string | null
          given_name?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          nickname?: string | null
          org_id?: string | null
          picture?: string | null
          sender_signature?: string | null
          sid?: string | null
          sub?: string | null
          updated_at?: string | null
        }
      }
      vendors: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          website?: string | null
        }
      }
    }
    Views: {
      cml_facility_energy_with_impacts: {
        Row: {
          created_at: string | null
          id: string | null
          location: string | null
          name: string | null
          org_id: string | null
          percent_renewable: number | null
          quantity_kwh: number | null
          quantity_mj: number | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
        }
      }
      cml_parts_with_impacts: {
        Row: {
          abiotic_depletion: number | null
          abiotic_depletion_fossil_fuels: number | null
          acidification: number | null
          activity_name: string | null
          created_at: string | null
          customer_part_id: string | null
          database_name: string | null
          eutrophication: number | null
          factor_id: string | null
          freshwater_ecotoxicity: number | null
          global_warming: number | null
          human_toxicity: number | null
          impact_source: string | null
          is_base_material: boolean | null
          manufacturing_process: string | null
          marine_ecotoxicity: number | null
          org_id: string | null
          origin: string | null
          ozone_depletion: number | null
          part_description: string | null
          photochemical_ozone_creation: number | null
          primary_material: string | null
          reference_product_name: string | null
          retake_part_id: string | null
          supplier_contacts: string[] | null
          supplier_engagement: string | null
          supplier_id: string | null
          supplier_name: string | null
          terrestrial_ecotoxicity: number | null
        }
      }
      cml_purchased_energy_with_impacts: {
        Row: {
          activity_name: string | null
          created_at: string | null
          database_name: string | null
          description: string | null
          facility_id: string | null
          id: string | null
          org_id: string | null
          percent_renewable: number | null
          quantity_kwh: number | null
          reference_product_name: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
          year: number | null
        }
      }
      cml_stationary_fuel_with_impacts: {
        Row: {
          activity_name: string | null
          database_name: string | null
          description: string | null
          facility_id: string | null
          id: string | null
          org_id: string | null
          quantity_mj: number | null
          reference_product_name: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_eutrophication: number | null
          total_freshwater_ecotoxicity: number | null
          total_global_warming: number | null
          total_human_toxicity: number | null
          total_marine_ecotoxicity: number | null
          total_ozone_depletion: number | null
          total_photochemical_ozone_creation: number | null
          total_terrestrial_ecotoxicity: number | null
          year: number | null
        }
      }
      ef_facility_energy_with_impacts: {
        Row: {
          created_at: string | null
          id: string | null
          location: string | null
          name: string | null
          org_id: string | null
          percent_renewable: number | null
          quantity_kwh: number | null
          quantity_mj: number | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_ef_human_health_photochemical_ozone_creation: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
        }
      }
      ef_purchased_energy_with_impacts: {
        Row: {
          activity_name: string | null
          created_at: string | null
          database_name: string | null
          description: string | null
          facility_id: string | null
          id: string | null
          org_id: string | null
          percent_renewable: number | null
          quantity_kwh: number | null
          reference_product_name: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_ef_human_health_photochemical_ozone_creation: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
          year: number | null
        }
      }
      ef_stationary_fuel_with_impacts: {
        Row: {
          activity_name: string | null
          database_name: string | null
          description: string | null
          facility_id: string | null
          id: string | null
          org_id: string | null
          quantity_mj: number | null
          reference_product_name: string | null
          total_abiotic_depletion: number | null
          total_abiotic_depletion_fossil_fuels: number | null
          total_acidification: number | null
          total_biogenic_global_warming: number | null
          total_carcinogenic_human_toxicity: number | null
          total_carcinogenic_inorganics_human_toxicity: number | null
          total_carcinogenic_organics_human_toxicity: number | null
          total_ef_human_health_photochemical_ozone_creation: number | null
          total_fossil_fuel_global_warming: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_freshwater_inorganics_ecotoxicity: number | null
          total_freshwater_organics_ecotoxicity: number | null
          total_global_warming: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_land_use_global_warming: number | null
          total_marine_eutrophication: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_non_carcinogenic_inorganics_human_toxicity: number | null
          total_non_carcinogenic_organics_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_eutrophication: number | null
          total_water_use: number | null
          year: number | null
        }
      }
      material_composition_with_descriptions: {
        Row: {
          created_at: string | null
          id: string | null
          lca_id: string | null
          level: number | null
          org_id: string | null
          parent_id: string | null
          part_description: string | null
          primary_material: string | null
          retake_part_id: string | null
          supplier_id: string | null
          supplier_name: string | null
          weight_grams: number | null
        }
      }
      parts_by_supplier: {
        Row: {
          created_at: string | null
          customer_part_id: string | null
          is_base_material: boolean | null
          manufacturing_process: string | null
          org_id: string | null
          origin: string | null
          part_description: string | null
          primary_material: string | null
          retake_part_id: string | null
          supplier_id: string | null
        }
      }
      parts_by_supplier_with_factors: {
        Row: {
          created_at: string | null
          customer_part_id: string | null
          factor_id: string | null
          is_base_material: boolean | null
          manufacturing_process: string | null
          org_id: string | null
          origin: string | null
          part_description: string | null
          primary_material: string | null
          retake_part_id: string | null
          supplier_id: string | null
        }
      }
      parts_engagement_status: {
        Row: {
          awaiting_response: number | null
          data_received: number | null
          not_engaged: number | null
          org_id: string | null
        }
      }
      parts_with_factors: {
        Row: {
          created_at: string | null
          customer_part_id: string | null
          factor_id: string | null
          is_base_material: boolean | null
          manufacturing_process: string | null
          org_id: string | null
          origin: string | null
          part_description: string | null
          primary_material: string | null
          retake_part_id: string | null
          supplier_ids: string[] | null
        }
      }
      rmh_facility_energy_with_impacts: {
        Row: {
          created_at: string | null
          id: string | null
          location: string | null
          name: string | null
          org_id: string | null
          percent_renewable: number | null
          quantity_kwh: number | null
          quantity_mj: number | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
        }
      }
      rmh_purchased_energy_with_impacts: {
        Row: {
          activity_name: string | null
          created_at: string | null
          database_name: string | null
          description: string | null
          facility_id: string | null
          id: string | null
          org_id: string | null
          percent_renewable: number | null
          quantity_kwh: number | null
          reference_product_name: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
          year: number | null
        }
      }
      rmh_stationary_fuel_with_impacts: {
        Row: {
          activity_name: string | null
          database_name: string | null
          description: string | null
          facility_id: string | null
          id: string | null
          org_id: string | null
          quantity_mj: number | null
          reference_product_name: string | null
          total_acidification: number | null
          total_carcinogenic_human_toxicity: number | null
          total_energy_resources: number | null
          total_freshwater_ecotoxicity: number | null
          total_freshwater_eutrophication: number | null
          total_global_warming: number | null
          total_human_health_photochemical_ozone_creation: number | null
          total_ionizing_radiation: number | null
          total_land_use: number | null
          total_marine_ecotoxicity: number | null
          total_marine_eutrophication: number | null
          total_metals_material_resources: number | null
          total_non_carcinogenic_human_toxicity: number | null
          total_ozone_depletion: number | null
          total_particulate_matter_formation: number | null
          total_terrestrial_ecotoxicity: number | null
          total_terrestrial_photochemical_ozone_creation: number | null
          total_water_use: number | null
          year: number | null
        }
      }
    }
    Functions: {
      cml_end_of_life_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          org_id: string
          lca_id: string
          description: string
          weight_grams: number
          location: string
          factor_id: string
          reference_product_name: string
          activity_name: string
          database_name: string
          total_acidification: number
          total_global_warming: number
          total_freshwater_ecotoxicity: number
          total_marine_ecotoxicity: number
          total_terrestrial_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_eutrophication: number
          total_human_toxicity: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_photochemical_ozone_creation: number
        }[]
      }
      cml_manufacturing_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          facility_id: string
          percent_revenue: number
          quantity_produced: number
          lca_id: string
          org_id: string
          name: string
          location: string
          percent_renewable: number
          quantity_mj: number
          quantity_kwh: number
          total_acidification: number
          total_global_warming: number
          total_freshwater_ecotoxicity: number
          total_marine_ecotoxicity: number
          total_terrestrial_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_eutrophication: number
          total_human_toxicity: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_photochemical_ozone_creation: number
        }[]
      }
      cml_material_composition_with_factors: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          weight_grams: number
          org_id: string
          lca_id: string
          level: number
          parent_id: string
          retake_part_id: string
          supplier_id: string
          customer_part_id: string
          part_description: string
          origin: string
          manufacturing_process: string
          primary_material: string
          supplier_ids: string[]
          factor_id: string
          reference_product_name: string
          activity_name: string
          database_name: string
          acidification: number
          global_warming: number
          freshwater_ecotoxicity: number
          marine_ecotoxicity: number
          terrestrial_ecotoxicity: number
          abiotic_depletion_fossil_fuels: number
          eutrophication: number
          human_toxicity: number
          abiotic_depletion: number
          ozone_depletion: number
          photochemical_ozone_creation: number
          is_supplier_specific: boolean
        }[]
      }
      cml_transportation_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          origin: string
          destination: string
          distance_km: number
          transportation_type: string
          org_id: string
          lca_id: string
          factor_id: string
          material_composition_id: string
          weight_grams: number
          customer_part_id: string
          part_description: string
          reference_product_name: string
          activity_name: string
          database_name: string
          total_acidification: number
          total_global_warming: number
          total_freshwater_ecotoxicity: number
          total_marine_ecotoxicity: number
          total_terrestrial_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_eutrophication: number
          total_human_toxicity: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_photochemical_ozone_creation: number
        }[]
      }
      cml_use_phase_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          org_id: string
          lca_id: string
          quantity: number
          location: string
          percent_at_location: number
          factor_id: string
          use_type: Database["public"]["Enums"]["use_type_enum"]
          has_use_phase: boolean
          reference_product_name: string
          database_name: string
          activity_name: string
          total_acidification: number
          total_global_warming: number
          total_freshwater_ecotoxicity: number
          total_marine_ecotoxicity: number
          total_terrestrial_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_eutrophication: number
          total_human_toxicity: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_photochemical_ozone_creation: number
        }[]
      }
      ef_end_of_life_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          org_id: string
          lca_id: string
          description: string
          weight_grams: number
          location: string
          factor_id: string
          reference_product_name: string
          activity_name: string
          database_name: string
          total_acidification: number
          total_global_warming: number
          total_biogenic_global_warming: number
          total_fossil_fuel_global_warming: number
          total_land_use_global_warming: number
          total_freshwater_ecotoxicity: number
          total_freshwater_inorganics_ecotoxicity: number
          total_freshwater_organics_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_freshwater_eutrophication: number
          total_marine_eutrophication: number
          total_terrestrial_eutrophication: number
          total_carcinogenic_human_toxicity: number
          total_carcinogenic_inorganics_human_toxicity: number
          total_carcinogenic_organics_human_toxicity: number
          total_non_carcinogenic_human_toxicity: number
          total_non_carcinogenic_inorganics_human_toxicity: number
          total_non_carcinogenic_organics_human_toxicity: number
          total_ionizing_radiation: number
          total_land_use: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_particulate_matter_formation: number
          total_human_health_photochemical_ozone_creation: number
          total_water_use: number
        }[]
      }
      ef_manufacturing_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          facility_id: string
          percent_revenue: number
          quantity_produced: number
          lca_id: string
          org_id: string
          name: string
          location: string
          percent_renewable: number
          quantity_mj: number
          quantity_kwh: number
          total_acidification: number
          total_global_warming: number
          total_biogenic_global_warming: number
          total_fossil_fuel_global_warming: number
          total_land_use_global_warming: number
          total_freshwater_ecotoxicity: number
          total_freshwater_inorganics_ecotoxicity: number
          total_freshwater_organics_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_freshwater_eutrophication: number
          total_marine_eutrophication: number
          total_terrestrial_eutrophication: number
          total_carcinogenic_human_toxicity: number
          total_carcinogenic_inorganics_human_toxicity: number
          total_carcinogenic_organics_human_toxicity: number
          total_non_carcinogenic_human_toxicity: number
          total_non_carcinogenic_inorganics_human_toxicity: number
          total_non_carcinogenic_organics_human_toxicity: number
          total_ionizing_radiation: number
          total_land_use: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_particulate_matter_formation: number
          total_human_health_photochemical_ozone_creation: number
          total_water_use: number
        }[]
      }
      ef_material_composition_with_factors: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          weight_grams: number
          org_id: string
          lca_id: string
          level: number
          parent_id: string
          retake_part_id: string
          supplier_id: string
          customer_part_id: string
          part_description: string
          origin: string
          manufacturing_process: string
          primary_material: string
          supplier_ids: string[]
          factor_id: string
          reference_product_name: string
          activity_name: string
          database_name: string
          acidification: number
          global_warming: number
          biogenic_global_warming: number
          fossil_fuel_global_warming: number
          land_use_global_warming: number
          freshwater_ecotoxicity: number
          freshwater_inorganics_ecotoxicity: number
          freshwater_organics_ecotoxicity: number
          abiotic_depletion_fossil_fuels: number
          freshwater_eutrophication: number
          marine_eutrophication: number
          terrestrial_eutrophication: number
          carcinogenic_human_toxicity: number
          carcinogenic_inorganics_human_toxicity: number
          carcinogenic_organics_human_toxicity: number
          non_carcinogenic_human_toxicity: number
          non_carcinogenic_inorganics_human_toxicity: number
          non_carcinogenic_organics_human_toxicity: number
          ionizing_radiation: number
          land_use: number
          abiotic_depletion: number
          ozone_depletion: number
          particulate_matter_formation: number
          human_health_photochemical_ozone_creation: number
          water_use: number
          is_supplier_specific: boolean
        }[]
      }
      ef_transportation_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          origin: string
          destination: string
          distance_km: number
          transportation_type: string
          org_id: string
          lca_id: string
          factor_id: string
          material_composition_id: string
          weight_grams: number
          customer_part_id: string
          part_description: string
          reference_product_name: string
          activity_name: string
          database_name: string
          total_acidification: number
          total_global_warming: number
          total_biogenic_global_warming: number
          total_fossil_fuel_global_warming: number
          total_land_use_global_warming: number
          total_freshwater_ecotoxicity: number
          total_freshwater_inorganics_ecotoxicity: number
          total_freshwater_organics_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_freshwater_eutrophication: number
          total_marine_eutrophication: number
          total_terrestrial_eutrophication: number
          total_carcinogenic_human_toxicity: number
          total_carcinogenic_inorganics_human_toxicity: number
          total_carcinogenic_organics_human_toxicity: number
          total_non_carcinogenic_human_toxicity: number
          total_non_carcinogenic_inorganics_human_toxicity: number
          total_non_carcinogenic_organics_human_toxicity: number
          total_ionizing_radiation: number
          total_land_use: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_particulate_matter_formation: number
          total_human_health_photochemical_ozone_creation: number
          total_water_use: number
        }[]
      }
      ef_use_phase_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          org_id: string
          lca_id: string
          quantity: number
          location: string
          percent_at_location: number
          factor_id: string
          use_type: string
          has_use_phase: Database["public"]["Enums"]["use_type_enum"]
          reference_product_name: string
          database_name: string
          activity_name: string
          total_acidification: number
          total_global_warming: number
          total_biogenic_global_warming: number
          total_fossil_fuel_global_warming: number
          total_land_use_global_warming: number
          total_freshwater_ecotoxicity: number
          total_freshwater_inorganics_ecotoxicity: number
          total_freshwater_organics_ecotoxicity: number
          total_abiotic_depletion_fossil_fuels: number
          total_freshwater_eutrophication: number
          total_marine_eutrophication: number
          total_terrestrial_eutrophication: number
          total_carcinogenic_human_toxicity: number
          total_carcinogenic_inorganics_human_toxicity: number
          total_carcinogenic_organics_human_toxicity: number
          total_non_carcinogenic_human_toxicity: number
          total_non_carcinogenic_inorganics_human_toxicity: number
          total_non_carcinogenic_organics_human_toxicity: number
          total_ionizing_radiation: number
          total_land_use: number
          total_abiotic_depletion: number
          total_ozone_depletion: number
          total_particulate_matter_formation: number
          total_human_health_photochemical_ozone_creation: number
          total_water_use: number
        }[]
      }
      emissions_factors: {
        Args: {
          categ: string
          units: string
        }
        Returns: string
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      rmh_end_of_life_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          org_id: string
          lca_id: string
          description: string
          weight_grams: number
          location: string
          factor_id: string
          reference_product_name: string
          activity_name: string
          database_name: string
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
        }[]
      }
      rmh_manufacturing_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          facility_id: string
          percent_revenue: number
          quantity_produced: number
          lca_id: string
          org_id: string
          name: string
          location: string
          percent_renewable: number
          quantity_mj: number
          quantity_kwh: number
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
        }[]
      }
      rmh_material_composition_with_factors: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          weight_grams: number
          org_id: string
          lca_id: string
          level: number
          parent_id: string
          retake_part_id: string
          supplier_id: string
          customer_part_id: string
          part_description: string
          origin: string
          manufacturing_process: string
          primary_material: string
          supplier_ids: string[]
          factor_id: string
          reference_product_name: string
          activity_name: string
          database_name: string
          acidification: number
          global_warming: number
          freshwater_ecotoxicity: number
          marine_ecotoxicity: number
          terrestrial_ecotoxicity: number
          energy_resources: number
          freshwater_eutrophication: number
          marine_eutrophication: number
          carcinogenic_human_toxicity: number
          non_carcinogenic_human_toxicity: number
          ionizing_radiation: number
          land_use: number
          metals_material_resources: number
          ozone_depletion: number
          particulate_matter_formation: number
          human_health_photochemical_ozone_creation: number
          terrestrial_photochemical_ozone_creation: number
          water_use: number
          is_supplier_specific: boolean
        }[]
      }
      rmh_transportation_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          created_at: string
          origin: string
          destination: string
          distance_km: number
          transportation_type: string
          org_id: string
          lca_id: string
          factor_id: string
          material_composition_id: string
          weight_grams: number
          customer_part_id: string
          part_description: string
          reference_product_name: string
          activity_name: string
          database_name: string
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
        }[]
      }
      rmh_use_phase_with_impacts: {
        Args: {
          selected_lca_id: string
        }
        Returns: {
          id: string
          org_id: string
          lca_id: string
          quantity: number
          location: string
          percent_at_location: number
          factor_id: string
          use_type: Database["public"]["Enums"]["use_type_enum"]
          has_use_phase: boolean
          reference_product_name: string
          database_name: string
          activity_name: string
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
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      validate_organization_name: {
        Args: {
          org_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      use_type_enum: "WATER" | "NATURAL_GAS" | "PETROL" | "ELECTRICITY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
