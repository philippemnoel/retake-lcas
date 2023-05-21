set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.ef_manufacturing_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, facility_id uuid, percent_revenue numeric, quantity_produced numeric, lca_id uuid, org_id text, name text, location text, percent_renewable numeric, quantity_mj numeric, quantity_kwh numeric, total_acidification numeric, total_global_warming numeric, total_biogenic_global_warming numeric, total_fossil_fuel_global_warming numeric, total_land_use_global_warming numeric, total_freshwater_ecotoxicity numeric, total_freshwater_inorganics_ecotoxicity numeric, total_freshwater_organics_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_terrestrial_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_carcinogenic_inorganics_human_toxicity numeric, total_carcinogenic_organics_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_non_carcinogenic_inorganics_human_toxicity numeric, total_non_carcinogenic_organics_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    fa.id,
    fa.created_at,
    fa.facility_id,
    fa.percent_revenue,
    fa.quantity_produced,
    fa.lca_id,
    fa.org_id,
    f.name,
    f.location,
    f.percent_renewable,
    f.quantity_mj * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS quantity_mj,
    f.quantity_kwh * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS quantity_kwh,
    f.total_acidification * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_acidification,
    f.total_global_warming * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_global_warming,
    f.total_biogenic_global_warming * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_biogenic_global_warming,
    f.total_fossil_fuel_global_warming * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_fossil_fuel_global_warming,
    f.total_land_use_global_warming * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_land_use_global_warming,
    f.total_freshwater_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_freshwater_ecotoxicity,
    f.total_freshwater_inorganics_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_freshwater_inorganics_ecotoxicity,
    f.total_freshwater_organics_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_freshwater_organics_ecotoxicity,
    f.total_abiotic_depletion_fossil_fuels * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_abiotic_depletion_fossil_fuels,
    f.total_freshwater_eutrophication * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_freshwater_eutrophication,
    f.total_marine_eutrophication * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_marine_eutrophication,
    f.total_terrestrial_eutrophication * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_terrestrial_eutrophication,
    f.total_carcinogenic_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_carcinogenic_human_toxicity,
    f.total_carcinogenic_inorganics_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_carcinogenic_inorganics_human_toxicity,
    f.total_carcinogenic_organics_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_carcinogenic_organics_human_toxicity,
    f.total_non_carcinogenic_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_non_carcinogenic_human_toxicity,
    f.total_non_carcinogenic_inorganics_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_non_carcinogenic_inorganics_human_toxicity,
    f.total_non_carcinogenic_organics_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_non_carcinogenic_organics_human_toxicity,
    f.total_ionizing_radiation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_ionizing_radiation,
    f.total_land_use * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_land_use,
    f.total_abiotic_depletion * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_abiotic_depletion,
    f.total_ozone_depletion * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_ozone_depletion,
    f.total_particulate_matter_formation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_particulate_matter_formation,
    f.total_ef_human_health_photochemical_ozone_creation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_ef_human_health_photochemical_ozone_creation,
    f.total_water_use * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_water_use
FROM
    facility_allocation fa
    LEFT JOIN ef_facility_energy_with_impacts f ON fa.facility_id = f.id
WHERE
    fa.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.rmh_manufacturing_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, facility_id uuid, percent_revenue numeric, quantity_produced numeric, lca_id uuid, org_id text, name text, location text, percent_renewable numeric, quantity_mj numeric, quantity_kwh numeric, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_energy_resources numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_metals_material_resources numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_terrestrial_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    fa.id,
    fa.created_at,
    fa.facility_id,
    fa.percent_revenue,
    fa.quantity_produced,
    fa.lca_id,
    fa.org_id,
    f.name,
    f.location,
    f.percent_renewable,
    f.quantity_mj * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS quantity_mj,
    f.quantity_kwh * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS quantity_kwh,
    f.total_acidification * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_acidification,
    f.total_global_warming * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_global_warming,
    f.total_freshwater_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_freshwater_ecotoxicity,
    f.total_marine_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_marine_ecotoxicity,
    f.total_terrestrial_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_terrestrial_ecotoxicity,
    f.total_energy_resources * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_energy_resources,
    f.total_freshwater_eutrophication * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_freshwater_eutrophication,
    f.total_marine_eutrophication * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_marine_eutrophication,
    f.total_carcinogenic_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_carcinogenic_human_toxicity,
    f.total_non_carcinogenic_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_non_carcinogenic_human_toxicity,
    f.total_ionizing_radiation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_ionizing_radiation,
    f.total_land_use * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_land_use,
    f.total_metals_material_resources * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_metals_material_resources,
    f.total_ozone_depletion * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_ozone_depletion,
    f.total_particulate_matter_formation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_particulate_matter_formation,
    f.total_human_health_photochemical_ozone_creation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_human_health_photochemical_ozone_creation,
    f.total_terrestrial_photochemical_ozone_creation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_terrestrial_photochemical_ozone_creation,
    f.total_water_use * fa.percent_revenue / 100 :: numeric / fa.quantity_produced as total_water_use
FROM
    facility_allocation fa
    LEFT JOIN rmh_facility_energy_with_impacts f ON fa.facility_id = f.id
WHERE
    fa.lca_id = selected_lca_id;

RETURN;

end $function$
;


