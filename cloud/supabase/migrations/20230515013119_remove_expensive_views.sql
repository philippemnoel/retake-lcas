drop view if exists "public"."cml_end_of_life_with_impacts";

drop view if exists "public"."cml_facility_allocation_with_impacts";

drop view if exists "public"."cml_material_composition_with_impacts";

drop view if exists "public"."cml_transportation_with_impacts";

drop view if exists "public"."cml_use_phase_with_impacts";

drop view if exists "public"."ef_end_of_life_with_impacts";

drop view if exists "public"."ef_facility_allocation_with_impacts";

drop view if exists "public"."ef_material_composition_with_impacts";

drop view if exists "public"."ef_transportation_with_impacts";

drop view if exists "public"."ef_use_phase_with_impacts";

drop function if exists "public"."get_campaigns"(org_id text);

drop function if exists "public"."get_categories"(input_org_id text);

drop function if exists "public"."get_documents"(input_org_id text, file_type text);

drop function if exists "public"."get_sorted_years"(input_org_id text);

drop function if exists "public"."get_total_kg_co2e"(ghg_category text, input_org_id text, year numeric);

drop function if exists "public"."get_total_kg_co2e"(ghg_category text, year numeric);

drop function if exists "public"."get_vendors_by_year"(org_id text, year numeric);

drop view if exists "public"."rmh_end_of_life_with_impacts";

drop view if exists "public"."rmh_facility_allocation_with_impacts";

drop view if exists "public"."rmh_material_composition_with_impacts";

drop view if exists "public"."rmh_transportation_with_impacts";

drop view if exists "public"."rmh_use_phase_with_impacts";

drop view if exists "public"."material_composition_with_descriptions";

drop view if exists "public"."parts_engagement_status";

drop view if exists "public"."cml_material_composition_with_factors";

drop view if exists "public"."ef_material_composition_with_factors";

drop view if exists "public"."rmh_material_composition_with_factors";

drop view if exists "public"."cml_parts_with_impacts";

alter table "public"."material_composition" drop column "leaf";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cml_end_of_life_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, org_id text, lca_id uuid, description text, weight_grams numeric, location text, factor_id uuid, reference_product_name text, activity_name text, database_name text, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_eutrophication numeric, total_human_toxicity numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_photochemical_ozone_creation numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
  SELECT
    eol.id,
    eol.created_at,
    eol.org_id,
    eol.lca_id,
    eol.description,
    eol.weight_grams,
    eol.location,
    eol.factor_id,
    f.reference_product_name,
    f.activity_name,
    f.database_name,
    f.cml_ac * eol.weight_grams / 1000::numeric AS total_acidification,
    f.cml_g * eol.weight_grams / 1000::numeric AS total_global_warming,
    f.cml_f_et * eol.weight_grams / 1000::numeric AS total_freshwater_ecotoxicity,
    f.cml_m_et * eol.weight_grams / 1000::numeric AS total_marine_ecotoxicity,
    f.cml_t_et * eol.weight_grams / 1000::numeric AS total_terrestrial_ecotoxicity,
    f.cml_ad_ff * eol.weight_grams / 1000::numeric AS total_abiotic_depletion_fossil_fuels,
    f.cml_eu * eol.weight_grams / 1000::numeric AS total_eutrophication,
    f.cml_h_et * eol.weight_grams / 1000::numeric AS total_human_toxicity,
    f.cml_ad * eol.weight_grams / 1000::numeric AS total_abiotic_depletion,
    f.cml_od * eol.weight_grams / 1000::numeric AS total_ozone_depletion,
    f.cml_oc * eol.weight_grams / 1000::numeric AS total_photochemical_ozone_creation
  FROM
    end_of_life eol
    LEFT JOIN third_party_factors f ON eol.factor_id = f.factor_id
  WHERE
    eol.lca_id = selected_lca_id;
RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.cml_manufacturing_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, facility_id uuid, percent_revenue numeric, quantity_produced numeric, lca_id uuid, org_id text, name text, location text, percent_renewable numeric, quantity_mj numeric, quantity_kwh numeric, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_eutrophication numeric, total_human_toxicity numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_photochemical_ozone_creation numeric)
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
    f.total_acidification * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_acidification,
    f.total_global_warming * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_global_warming,
    f.total_freshwater_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_freshwater_ecotoxicity,
    f.total_marine_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_marine_ecotoxicity,
    f.total_terrestrial_ecotoxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_terrestrial_ecotoxicity,
    f.total_abiotic_depletion_fossil_fuels * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_abiotic_depletion_fossil_fuels,
    f.total_eutrophication * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_eutrophication,
    f.total_human_toxicity * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_human_toxicity,
    f.total_abiotic_depletion * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_abiotic_depletion,
    f.total_ozone_depletion * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_ozone_depletion,
    f.total_photochemical_ozone_creation * fa.percent_revenue / 100 :: numeric / fa.quantity_produced AS total_photochemical_ozone_creation
FROM
    facility_allocation fa
    LEFT JOIN cml_facility_energy_with_impacts f ON fa.facility_id = f.id
WHERE
    fa.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.cml_material_composition_with_factors(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, weight_grams numeric, org_id text, lca_id uuid, level numeric, parent_id uuid, retake_part_id text, supplier_id text, customer_part_id text, part_description text, origin text, manufacturing_process text, primary_material text, factor_id uuid, reference_product_name text, activity_name text, database_name text, acidification double precision, global_warming double precision, freshwater_ecotoxicity double precision, marine_ecotoxicity double precision, terrestrial_ecotoxicity double precision, abiotic_depletion_fossil_fuels double precision, eutrophication double precision, human_toxicity double precision, abiotic_depletion double precision, ozone_depletion double precision, photochemical_ozone_creation double precision, is_supplier_specific boolean)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    material_composition.id,
    material_composition.created_at,
    material_composition.weight_grams,
    material_composition.org_id,
    material_composition.lca_id,
    material_composition.level,
    material_composition.parent_id,
    material_composition.retake_part_id,
    material_composition.supplier_id,
    parts.customer_part_id,
    parts.part_description,
    parts.origin,
    parts.manufacturing_process,
    parts.primary_material,
    factors.factor_id,
    factors.reference_product_name,
    factors.activity_name,
    factors.database_name,
    COALESCE(
        retake_factors.cml_ac :: DOUBLE PRECISION,
        factors.cml_ac :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS acidification,
    COALESCE(
        retake_factors.cml_g :: DOUBLE PRECISION,
        factors.cml_g :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS global_warming,
    COALESCE(
        retake_factors.cml_f_et :: DOUBLE PRECISION,
        factors.cml_f_et :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS freshwater_ecotoxicity,
    COALESCE(
        retake_factors.cml_m_et :: DOUBLE PRECISION,
        factors.cml_m_et :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS marine_ecotoxicity,
    COALESCE(
        retake_factors.cml_t_et :: DOUBLE PRECISION,
        factors.cml_t_et :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS terrestrial_ecotoxicity,
    COALESCE(
        retake_factors.cml_ad_ff :: DOUBLE PRECISION,
        factors.cml_ad_ff :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS abiotic_depletion_fossil_fuels,
    COALESCE(
        retake_factors.cml_eu :: DOUBLE PRECISION,
        factors.cml_eu :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS eutrophication,
    COALESCE(
        retake_factors.cml_h_et :: DOUBLE PRECISION,
        factors.cml_h_et :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS human_toxicity,
    COALESCE(
        retake_factors.cml_ad :: DOUBLE PRECISION,
        factors.cml_ad :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS abiotic_depletion,
    COALESCE(
        retake_factors.cml_od :: DOUBLE PRECISION,
        factors.cml_od :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS ozone_depletion,
    COALESCE(
        retake_factors.cml_oc :: DOUBLE PRECISION,
        factors.cml_oc :: DOUBLE PRECISION,
        0 :: DOUBLE PRECISION
    ) AS photochemical_ozone_creation,
    CASE
        WHEN retake_factors.retake_part_id IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS is_supplier_specific
FROM
    material_composition
    LEFT JOIN parts_with_factors parts ON material_composition.retake_part_id = parts.retake_part_id
    LEFT JOIN third_party_factors factors ON parts.factor_id = factors.factor_id
    LEFT JOIN retake_factors ON material_composition.retake_part_id = retake_factors.retake_part_id
    AND material_composition.supplier_id = retake_factors.supplier_id
WHERE
    material_composition.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.cml_transportation_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, origin text, destination text, distance_km numeric, transportation_type text, org_id text, lca_id uuid, factor_id uuid, material_composition_id uuid, weight_grams numeric, customer_part_id text, part_description text, reference_product_name text, activity_name text, database_name text, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_eutrophication numeric, total_human_toxicity numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_photochemical_ozone_creation numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    t.id,
    t.created_at,
    t.origin,
    t.destination,
    t.distance_km,
    t.transportation_type,
    t.org_id,
    t.lca_id,
    t.factor_id,
    t.material_composition_id,
    m.weight_grams,
    p.customer_part_id,
    p.part_description,
    f.reference_product_name,
    f.activity_name,
    f.database_name,
    f.cml_ac * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_acidification,
    f.cml_g * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_global_warming,
    f.cml_f_et * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_freshwater_ecotoxicity,
    f.cml_m_et * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_marine_ecotoxicity,
    f.cml_t_et * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_terrestrial_ecotoxicity,
    f.cml_ad_ff * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_abiotic_depletion_fossil_fuels,
    f.cml_eu * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_eutrophication,
    f.cml_h_et * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_human_toxicity,
    f.cml_ad * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_abiotic_depletion,
    f.cml_od * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_ozone_depletion,
    f.cml_oc * m.weight_grams * t.distance_km / 1000000 :: numeric AS total_photochemical_ozone_creation
FROM
    transportation t
    LEFT JOIN material_composition m ON t.material_composition_id = m.id
    LEFT JOIN parts p ON m.retake_part_id = p.retake_part_id
    LEFT JOIN third_party_factors f ON t.factor_id = f.factor_id
WHERE
    t.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.cml_use_phase_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, org_id text, lca_id uuid, quantity numeric, location text, percent_at_location numeric, factor_id uuid, use_type use_type_enum, has_use_phase boolean, reference_product_name text, database_name text, activity_name text, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_eutrophication numeric, total_human_toxicity numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_photochemical_ozone_creation numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    up.id,
    up.org_id,
    up.lca_id,
    up.quantity,
    up.location,
    up.percent_at_location,
    up.factor_id,
    up.use_type,
    s.has_use_phase,
    f.reference_product_name,
    f.database_name,
    f.activity_name,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_ac * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_acidification,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_g * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_global_warming,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_f_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_freshwater_ecotoxicity,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_m_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_marine_ecotoxicity,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_t_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_terrestrial_ecotoxicity,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_ad_ff * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_abiotic_depletion_fossil_fuels,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_eu * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_eutrophication,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_h_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_human_toxicity,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_ad * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_abiotic_depletion,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_od * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_ozone_depletion,
    CASE
        WHEN s.has_use_phase = false THEN 0 :: numeric
        ELSE f.cml_oc * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    END AS total_photochemical_ozone_creation
FROM
    use_phase up
    JOIN third_party_factors f ON f.factor_id = up.factor_id
    JOIN service_life s ON s.lca_id = up.lca_id
WHERE
    up.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.ef_end_of_life_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, org_id text, lca_id uuid, description text, weight_grams numeric, location text, factor_id uuid, reference_product_name text, activity_name text, database_name text, total_acidification numeric, total_global_warming numeric, total_biogenic_global_warming numeric, total_fossil_fuel_global_warming numeric, total_land_use_global_warming numeric, total_freshwater_ecotoxicity numeric, total_freshwater_inorganics_ecotoxicity numeric, total_freshwater_organics_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_terrestrial_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_carcinogenic_inorganics_human_toxicity numeric, total_carcinogenic_organics_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_non_carcinogenic_inorganics_human_toxicity numeric, total_non_carcinogenic_organics_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    eol.id,
    eol.created_at,
    eol.org_id,
    eol.lca_id,
    eol.description,
    eol.weight_grams,
    eol.location,
    eol.factor_id,
    f.reference_product_name,
    f.activity_name,
    f.database_name,
    f.ef_ac * eol.weight_grams / 1000 :: numeric as total_acidification,
    f.ef_g * eol.weight_grams / 1000 :: numeric as total_global_warming,
    f.ef_b_g * eol.weight_grams / 1000 :: numeric as total_biogenic_global_warming,
    f.ef_ff_g * eol.weight_grams / 1000 :: numeric as total_fossil_fuel_global_warming,
    f.ef_l_g * eol.weight_grams / 1000 :: numeric as total_land_use_global_warming,
    f.ef_f_et * eol.weight_grams / 1000 :: numeric as total_freshwater_ecotoxicity,
    f.ef_f_i_et * eol.weight_grams / 1000 :: numeric as total_freshwater_inorganics_ecotoxicity,
    f.ef_f_o_et * eol.weight_grams / 1000 :: numeric as total_freshwater_organics_ecotoxicity,
    f.ef_ad_ff * eol.weight_grams / 1000 :: numeric as total_abiotic_depletion_fossil_fuels,
    f.ef_f_eu * eol.weight_grams / 1000 :: numeric as total_freshwater_eutrophication,
    f.ef_m_eu * eol.weight_grams / 1000 :: numeric as total_marine_eutrophication,
    f.ef_t_eu * eol.weight_grams / 1000 :: numeric as total_terrestrial_eutrophication,
    f.ef_cht * eol.weight_grams / 1000 :: numeric as total_carcinogenic_human_toxicity,
    f.ef_ciht * eol.weight_grams / 1000 :: numeric as total_carcinogenic_inorganics_human_toxicity,
    f.ef_coht * eol.weight_grams / 1000 :: numeric as total_carcinogenic_organics_human_toxicity,
    f.ef_ncht * eol.weight_grams / 1000 :: numeric as total_non_carcinogenic_human_toxicity,
    f.ef_nciht * eol.weight_grams / 1000 :: numeric as total_non_carcinogenic_inorganics_human_toxicity,
    f.ef_ncoht * eol.weight_grams / 1000 :: numeric as total_non_carcinogenic_organics_human_toxicity,
    f.ef_ir * eol.weight_grams / 1000 :: numeric as total_ionizing_radiation,
    f.ef_l * eol.weight_grams / 1000 :: numeric as total_land_use,
    f.ef_ad * eol.weight_grams / 1000 :: numeric as total_abiotic_depletion,
    f.ef_od * eol.weight_grams / 1000 :: numeric as total_ozone_depletion,
    f.ef_pm * eol.weight_grams / 1000 :: numeric as total_particulate_matter_formation,
    f.ef_hh_oc * eol.weight_grams / 1000 :: numeric as total_ef_human_health_photochemical_ozone_creation,
    f.ef_w * eol.weight_grams / 1000 :: numeric as total_water_use
FROM
    end_of_life eol
    LEFT JOIN third_party_factors f ON eol.factor_id = f.factor_id
WHERE
    eol.lca_id = selected_lca_id;

RETURN;

end $function$
;

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
    LEFT JOIN cml_facility_energy_with_impacts f ON fa.facility_id = f.id
WHERE
    fa.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.ef_material_composition_with_factors(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, weight_grams numeric, org_id text, lca_id uuid, level numeric, parent_id uuid, retake_part_id text, supplier_id text, customer_part_id text, part_description text, origin text, manufacturing_process text, primary_material text, factor_id uuid, reference_product_name text, activity_name text, database_name text, acidification double precision, global_warming double precision, biogenic_global_warming double precision, fossil_fuel_global_warming double precision, land_use_global_warming double precision, freshwater_ecotoxicity double precision, freshwater_inorganics_ecotoxicity double precision, freshwater_organics_ecotoxicity double precision, abiotic_depletion_fossil_fuels double precision, freshwater_eutrophication double precision, marine_eutrophication double precision, terrestrial_eutrophication double precision, carcinogenic_human_toxicity double precision, carcinogenic_inorganics_human_toxicity double precision, carcinogenic_organics_human_toxicity double precision, non_carcinogenic_human_toxicity double precision, non_carcinogenic_inorganics_human_toxicity double precision, non_carcinogenic_organics_human_toxicity double precision, ionizing_radiation double precision, land_use double precision, abiotic_depletion double precision, ozone_depletion double precision, particulate_matter_formation double precision, human_health_photochemical_ozone_creation double precision, water_use double precision, is_supplier_specific boolean)
 LANGUAGE plpgsql
AS $function$ begin 
RETURN QUERY SELECT
material_composition.id,
material_composition.created_at,
material_composition.weight_grams,
material_composition.org_id,
material_composition.lca_id,
material_composition.level,
material_composition.parent_id,
material_composition.leaf,
material_composition.retake_part_id,
material_composition.supplier_id,
parts.customer_part_id,
parts.part_description,
parts.origin,
parts.manufacturing_process,
parts.primary_material,
factors.factor_id,
factors.reference_product_name,
factors.activity_name,
factors.database_name,
coalesce(
    retake_factors.ef_ac :: double precision,
    factors.ef_ac :: double precision,
    0 :: double precision
) as acidification,
coalesce(
    retake_factors.ef_g :: double precision,
    factors.ef_g :: double precision,
    0 :: double precision
) as global_warming,
coalesce(
    retake_factors.ef_b_g :: double precision,
    factors.ef_b_g :: double precision,
    0 :: double precision
) as biogenic_global_warming,
coalesce(
    retake_factors.ef_ff_g :: double precision,
    factors.ef_ff_g :: double precision,
    0 :: double precision
) as fossil_fuel_global_warming,
coalesce(
    retake_factors.ef_l_g :: double precision,
    factors.ef_l_g :: double precision,
    0 :: double precision
) as land_use_global_warming,
coalesce(
    retake_factors.ef_f_et :: double precision,
    factors.ef_f_et :: double precision,
    0 :: double precision
) as freshwater_ecotoxicity,
coalesce(
    retake_factors.ef_f_i_et :: double precision,
    factors.ef_f_i_et :: double precision,
    0 :: double precision
) as freshwater_inorganics_ecotoxicity,
coalesce(
    retake_factors.ef_f_o_et :: double precision,
    factors.ef_f_o_et :: double precision,
    0 :: double precision
) as freshwater_organics_ecotoxicity,
coalesce(
    retake_factors.ef_ad_ff :: double precision,
    factors.ef_ad_ff :: double precision,
    0 :: double precision
) as abiotic_depletion_fossil_fuels,
coalesce(
    retake_factors.ef_f_eu :: double precision,
    factors.ef_f_eu :: double precision,
    0 :: double precision
) as freshwater_eutrophication,
coalesce(
    retake_factors.ef_m_eu :: double precision,
    factors.ef_m_eu :: double precision,
    0 :: double precision
) as marine_eutrophication,
coalesce(
    retake_factors.ef_t_eu :: double precision,
    factors.ef_t_eu :: double precision,
    0 :: double precision
) as terrestrial_eutrophication,
coalesce(
    retake_factors.ef_cht :: double precision,
    factors.ef_cht :: double precision,
    0 :: double precision
) as carcinogenic_human_toxicity,
coalesce(
    retake_factors.ef_ciht :: double precision,
    factors.ef_ciht :: double precision,
    0 :: double precision
) as carcinogenic_inorganics_human_toxicity,
coalesce(
    retake_factors.ef_coht :: double precision,
    factors.ef_coht :: double precision,
    0 :: double precision
) as carcinogenic_organics_human_toxicity,
coalesce(
    retake_factors.ef_ncht :: double precision,
    factors.ef_ncht :: double precision,
    0 :: double precision
) as non_carcinogenic_human_toxicity,
coalesce(
    retake_factors.ef_nciht :: double precision,
    factors.ef_nciht :: double precision,
    0 :: double precision
) as non_carcinogenic_inorganics_human_toxicity,
coalesce(
    retake_factors.ef_ncoht :: double precision,
    factors.ef_ncoht :: double precision,
    0 :: double precision
) as non_carcinogenic_organics_human_toxicity,
coalesce(
    retake_factors.ef_ir :: double precision,
    factors.ef_ir :: double precision,
    0 :: double precision
) as ionizing_radiation,
coalesce(
    retake_factors.ef_l :: double precision,
    factors.ef_l :: double precision,
    0 :: double precision
) as land_use,
coalesce(
    retake_factors.ef_ad :: double precision,
    factors.ef_ad :: double precision,
    0 :: double precision
) as abiotic_depletion,
coalesce(
    retake_factors.ef_od :: double precision,
    factors.ef_od :: double precision,
    0 :: double precision
) as ozone_depletion,
coalesce(
    retake_factors.ef_pm :: double precision,
    factors.ef_pm :: double precision,
    0 :: double precision
) as particulate_matter_formation,
coalesce(
    retake_factors.ef_hh_oc :: double precision,
    factors.ef_hh_oc :: double precision,
    0 :: double precision
) as human_health_photochemical_ozone_creation,
coalesce(
    retake_factors.ef_w :: double precision,
    factors.ef_w :: double precision,
    0 :: double precision
) as water_use,
case
    when retake_factors.retake_part_id is not null then true
    else false
end as is_supplier_specific
FROM
    material_composition
    LEFT JOIN parts_with_factors parts ON material_composition.retake_part_id = parts.retake_part_id
    LEFT JOIN third_party_factors factors ON parts.factor_id = factors.factor_id
    LEFT JOIN retake_factors ON material_composition.retake_part_id = retake_factors.retake_part_id
    AND material_composition.supplier_id = retake_factors.supplier_id
WHERE
    material_composition.lca_id = selected_lca_id;
RETURN;
end $function$
;

CREATE OR REPLACE FUNCTION public.ef_transportation_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, origin text, destination text, distance_km numeric, transportation_type text, org_id text, lca_id uuid, factor_id uuid, material_composition_id uuid, weight_grams numeric, customer_part_id text, part_description text, reference_product_name text, activity_name text, database_name text, total_acidification numeric, total_global_warming numeric, total_biogenic_global_warming numeric, total_fossil_fuel_global_warming numeric, total_land_use_global_warming numeric, total_freshwater_ecotoxicity numeric, total_freshwater_inorganics_ecotoxicity numeric, total_freshwater_organics_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_terrestrial_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_carcinogenic_inorganics_human_toxicity numeric, total_carcinogenic_organics_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_non_carcinogenic_inorganics_human_toxicity numeric, total_non_carcinogenic_organics_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    t.id,
    t.created_at,
    t.origin,
    t.destination,
    t.distance_km,
    t.transportation_type,
    t.org_id,
    t.lca_id,
    t.factor_id,
    t.material_composition_id,
    m.weight_grams,
    p.customer_part_id,
    p.part_description,
    f.reference_product_name,
    f.activity_name,
    f.database_name,
    f.ef_ac * m.weight_grams * t.distance_km / 1000000 :: numeric as total_acidification,
    f.ef_g * m.weight_grams * t.distance_km / 1000000 :: numeric as total_global_warming,
    f.ef_b_g * m.weight_grams * t.distance_km / 1000000 :: numeric as total_biogenic_global_warming,
    f.ef_ff_g * m.weight_grams * t.distance_km / 1000000 :: numeric as total_fossil_fuel_global_warming,
    f.ef_l_g * m.weight_grams * t.distance_km / 1000000 :: numeric as total_land_use_global_warming,
    f.ef_f_et * m.weight_grams * t.distance_km / 1000000 :: numeric as total_freshwater_ecotoxicity,
    f.ef_f_i_et * m.weight_grams * t.distance_km / 1000000 :: numeric as total_freshwater_inorganics_ecotoxicity,
    f.ef_f_o_et * m.weight_grams * t.distance_km / 1000000 :: numeric as total_freshwater_organics_ecotoxicity,
    f.ef_ad_ff * m.weight_grams * t.distance_km / 1000000 :: numeric as total_abiotic_depletion_fossil_fuels,
    f.ef_f_eu * m.weight_grams * t.distance_km / 1000000 :: numeric as total_freshwater_eutrophication,
    f.ef_m_eu * m.weight_grams * t.distance_km / 1000000 :: numeric as total_marine_eutrophication,
    f.ef_t_eu * m.weight_grams * t.distance_km / 1000000 :: numeric as total_terrestrial_eutrophication,
    f.ef_cht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_carcinogenic_human_toxicity,
    f.ef_ciht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_carcinogenic_inorganics_human_toxicity,
    f.ef_coht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_carcinogenic_organics_human_toxicity,
    f.ef_ncht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_non_carcinogenic_human_toxicity,
    f.ef_nciht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_non_carcinogenic_inorganics_human_toxicity,
    f.ef_ncoht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_non_carcinogenic_organics_human_toxicity,
    f.ef_ir * m.weight_grams * t.distance_km / 1000000 :: numeric as total_ionizing_radiation,
    f.ef_l * m.weight_grams * t.distance_km / 1000000 :: numeric as total_land_use,
    f.ef_ad * m.weight_grams * t.distance_km / 1000000 :: numeric as total_abiotic_depletion,
    f.ef_od * m.weight_grams * t.distance_km / 1000000 :: numeric as total_ozone_depletion,
    f.ef_pm * m.weight_grams * t.distance_km / 1000000 :: numeric as total_particulate_matter_formation,
    f.ef_hh_oc * m.weight_grams * t.distance_km / 1000000 :: numeric as total_ef_human_health_photochemical_ozone_creation,
    f.ef_w * m.weight_grams * t.distance_km / 1000000 :: numeric as total_water_use
FROM
    transportation t
    LEFT JOIN material_composition m ON t.material_composition_id = m.id
    LEFT JOIN parts p ON m.retake_part_id = p.retake_part_id
    LEFT JOIN third_party_factors f ON t.factor_id = f.factor_id
WHERE
    t.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.ef_use_phase_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, org_id text, lca_id uuid, quantity numeric, location text, percent_at_location numeric, factor_id uuid, use_type text, has_use_phase use_type_enum, reference_product_name text, database_name text, activity_name text, total_acidification numeric, total_global_warming numeric, total_biogenic_global_warming numeric, total_fossil_fuel_global_warming numeric, total_land_use_global_warming numeric, total_freshwater_ecotoxicity numeric, total_freshwater_inorganics_ecotoxicity numeric, total_freshwater_organics_ecotoxicity numeric, total_abiotic_depletion_fossil_fuels numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_terrestrial_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_carcinogenic_inorganics_human_toxicity numeric, total_carcinogenic_organics_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_non_carcinogenic_inorganics_human_toxicity numeric, total_non_carcinogenic_organics_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_abiotic_depletion numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    up.id,
    up.org_id,
    up.lca_id,
    up.quantity,
    up.location,
    up.percent_at_location,
    up.factor_id,
    up.use_type,
    s.has_use_phase,
    f.reference_product_name,
    f.database_name,
    f.activity_name,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ac * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_acidification,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_g * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_global_warming,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_b_g * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_biogenic_global_warming,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ff_g * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_fossil_fuel_global_warming,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_l_g * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_land_use_global_warming,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_f_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_freshwater_ecotoxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_f_i_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_freshwater_inorganics_ecotoxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_f_o_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_freshwater_organics_ecotoxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ad_ff * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_abiotic_depletion_fossil_fuels,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_f_eu * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_freshwater_eutrophication,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_m_eu * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_marine_eutrophication,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_t_eu * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_terrestrial_eutrophication,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_cht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_carcinogenic_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ciht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_carcinogenic_inorganics_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_coht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_carcinogenic_organics_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ncht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_non_carcinogenic_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_nciht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_non_carcinogenic_inorganics_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ncoht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_non_carcinogenic_organics_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ir * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_ionizing_radiation,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_l * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_land_use,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_ad * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_abiotic_depletion,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_od * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_ozone_depletion,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_pm * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_particulate_matter_formation,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_hh_oc * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_ef_human_health_photochemical_ozone_creation,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.ef_w * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_water_use
FROM
    use_phase up
    JOIN third_party_factors f ON f.factor_id = up.factor_id
    JOIN service_life s ON s.lca_id = up.lca_id
WHERE
    up.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.rmh_end_of_life_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, org_id text, lca_id uuid, description text, weight_grams numeric, location text, factor_id uuid, reference_product_name text, activity_name text, database_name text, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_energy_resources numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_metals_material_resources numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_terrestrial_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    eol.id,
    eol.created_at,
    eol.org_id,
    eol.lca_id,
    eol.description,
    eol.weight_grams,
    eol.location,
    eol.factor_id,
    f.reference_product_name,
    f.activity_name,
    f.database_name,
    f.rmh_t_ac * eol.weight_grams / 1000 :: numeric as total_acidification,
    f.rmh_g * eol.weight_grams / 1000 :: numeric as total_global_warming,
    f.rmh_f_et * eol.weight_grams / 1000 :: numeric as total_freshwater_ecotoxicity,
    f.rmh_m_et * eol.weight_grams / 1000 :: numeric as total_marine_ecotoxicity,
    f.rmh_t_et * eol.weight_grams / 1000 :: numeric as total_terrestrial_ecotoxicity,
    f.rmh_er * eol.weight_grams / 1000 :: numeric as total_energy_resources,
    f.rmh_f_eu * eol.weight_grams / 1000 :: numeric as total_freshwater_eutrophication,
    f.rmh_m_eu * eol.weight_grams / 1000 :: numeric as total_marine_eutrophication,
    f.rmh_cht * eol.weight_grams / 1000 :: numeric as total_carcinogenic_human_toxicity,
    f.rmh_ncht * eol.weight_grams / 1000 :: numeric as total_non_carcinogenic_human_toxicity,
    f.rmh_ir * eol.weight_grams / 1000 :: numeric as total_ionizing_radiation,
    f.rmh_l * eol.weight_grams / 1000 :: numeric as total_land_use,
    f.rmh_mm_r * eol.weight_grams / 1000 :: numeric as total_metals_material_resources,
    f.rmh_od * eol.weight_grams / 1000 :: numeric as total_ozone_depletion,
    f.rmh_pm * eol.weight_grams / 1000 :: numeric as total_particulate_matter_formation,
    f.rmh_hh_oc * eol.weight_grams / 1000 :: numeric as total_human_health_photochemical_ozone_creation,
    f.rmh_t_oc * eol.weight_grams / 1000 :: numeric as total_terrestrial_photochemical_ozone_creation,
    f.rmh_w * eol.weight_grams / 1000 :: numeric as total_water_use
FROM
    end_of_life eol
    LEFT JOIN third_party_factors f ON eol.factor_id = f.factor_id
WHERE
    eol.lca_id = selected_lca_id;

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
    LEFT JOIN cml_facility_energy_with_impacts f ON fa.facility_id = f.id
WHERE
    fa.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.rmh_material_composition_with_factors(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, weight_grams numeric, org_id text, lca_id uuid, level numeric, parent_id uuid, retake_part_id text, supplier_id text, customer_part_id text, part_description text, origin text, manufacturing_process text, primary_material text, factor_id uuid, reference_product_name text, activity_name text, database_name text, acidification double precision, global_warming double precision, freshwater_ecotoxicity double precision, marine_ecotoxicity double precision, terrestrial_ecotoxicity double precision, energy_resources double precision, freshwater_eutrophication double precision, marine_eutrophication double precision, carcinogenic_human_toxicity double precision, non_carcinogenic_human_toxicity double precision, ionizing_radiation double precision, land_use double precision, metals_material_resources double precision, ozone_depletion double precision, particulate_matter_formation double precision, human_health_photochemical_ozone_creation double precision, terrestrial_photochemical_ozone_creation double precision, water_use double precision, is_supplier_specific boolean)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    material_composition.id,
    material_composition.created_at,
    material_composition.weight_grams,
    material_composition.org_id,
    material_composition.lca_id,
    material_composition.level,
    material_composition.parent_id,
    material_composition.leaf,
    material_composition.retake_part_id,
    material_composition.supplier_id,
    parts.customer_part_id,
    parts.part_description,
    parts.origin,
    parts.manufacturing_process,
    parts.primary_material,
    factors.factor_id,
    factors.reference_product_name,
    factors.activity_name,
    factors.database_name,
    coalesce(
        retake_factors.rmh_t_ac :: double precision,
        factors.rmh_t_ac :: double precision,
        0 :: double precision
    ) as acidification,
    coalesce(
        retake_factors.rmh_g :: double precision,
        factors.rmh_g :: double precision,
        0 :: double precision
    ) as global_warming,
    coalesce(
        retake_factors.rmh_f_et :: double precision,
        factors.rmh_f_et :: double precision,
        0 :: double precision
    ) as freshwater_ecotoxicity,
    coalesce(
        retake_factors.rmh_m_et :: double precision,
        factors.rmh_m_et :: double precision,
        0 :: double precision
    ) as marine_ecotoxicity,
    coalesce(
        retake_factors.rmh_t_et :: double precision,
        factors.rmh_t_et :: double precision,
        0 :: double precision
    ) as terrestrial_ecotoxicity,
    coalesce(
        retake_factors.rmh_er :: double precision,
        factors.rmh_er :: double precision,
        0 :: double precision
    ) as energy_resources,
    coalesce(
        retake_factors.rmh_f_eu :: double precision,
        factors.rmh_f_eu :: double precision,
        0 :: double precision
    ) as freshwater_eutrophication,
    coalesce(
        retake_factors.rmh_m_eu :: double precision,
        factors.rmh_m_eu :: double precision,
        0 :: double precision
    ) as marine_eutrophication,
    coalesce(
        retake_factors.rmh_cht :: double precision,
        factors.rmh_cht :: double precision,
        0 :: double precision
    ) as carcinogenic_human_toxicity,
    coalesce(
        retake_factors.rmh_ncht :: double precision,
        factors.rmh_ncht :: double precision,
        0 :: double precision
    ) as non_carcinogenic_human_toxicity,
    coalesce(
        retake_factors.rmh_ir :: double precision,
        factors.rmh_ir :: double precision,
        0 :: double precision
    ) as ionizing_radiation,
    coalesce(
        retake_factors.rmh_l :: double precision,
        factors.rmh_l :: double precision,
        0 :: double precision
    ) as land_use,
    coalesce(
        retake_factors.rmh_mm_r :: double precision,
        factors.rmh_mm_r :: double precision,
        0 :: double precision
    ) as metals_material_resources,
    coalesce(
        retake_factors.rmh_od :: double precision,
        factors.rmh_od :: double precision,
        0 :: double precision
    ) as ozone_depletion,
    coalesce(
        retake_factors.rmh_pm :: double precision,
        factors.rmh_pm :: double precision,
        0 :: double precision
    ) as particulate_matter_formation,
    coalesce(
        retake_factors.rmh_hh_oc :: double precision,
        factors.rmh_hh_oc :: double precision,
        0 :: double precision
    ) as human_health_photochemical_ozone_creation,
    coalesce(
        retake_factors.rmh_t_oc :: double precision,
        factors.rmh_t_oc :: double precision,
        0 :: double precision
    ) as terrestrial_photochemical_ozone_creation,
    coalesce(
        retake_factors.rmh_w :: double precision,
        factors.rmh_w :: double precision,
        0 :: double precision
    ) as water_use,
    case
        when retake_factors.retake_part_id is not null then true
        else false
    end as is_supplier_specific
FROM
    material_composition
    LEFT JOIN parts_with_factors parts ON material_composition.retake_part_id = parts.retake_part_id
    LEFT JOIN third_party_factors factors ON parts.factor_id = factors.factor_id
    LEFT JOIN retake_factors ON material_composition.retake_part_id = retake_factors.retake_part_id
    AND material_composition.supplier_id = retake_factors.supplier_id
WHERE
    material_composition.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.rmh_transportation_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, origin text, destination text, distance_km numeric, transportation_type text, org_id text, lca_id uuid, factor_id uuid, material_composition_id uuid, weight_grams numeric, customer_part_id text, part_description text, reference_product_name text, activity_name text, database_name text, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_energy_resources numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_metals_material_resources numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_terrestrial_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    t.id,
    t.created_at,
    t.origin,
    t.destination,
    t.distance_km,
    t.transportation_type,
    t.org_id,
    t.lca_id,
    t.factor_id,
    t.material_composition_id,
    m.weight_grams,
    p.customer_part_id,
    p.part_description,
    f.reference_product_name,
    f.activity_name,
    f.database_name,
    f.rmh_t_ac * m.weight_grams * t.distance_km / 1000000 :: numeric as total_acidification,
    f.rmh_g * m.weight_grams * t.distance_km / 1000000 :: numeric as total_global_warming,
    f.rmh_f_et * m.weight_grams * t.distance_km / 1000000 :: numeric as total_freshwater_ecotoxicity,
    f.rmh_m_et * m.weight_grams * t.distance_km / 1000000 :: numeric as total_marine_ecotoxicity,
    f.rmh_t_et * m.weight_grams * t.distance_km / 1000000 :: numeric as total_terrestrial_ecotoxicity,
    f.rmh_er * m.weight_grams * t.distance_km / 1000000 :: numeric as total_energy_resources,
    f.rmh_f_eu * m.weight_grams * t.distance_km / 1000000 :: numeric as total_freshwater_eutrophication,
    f.rmh_m_eu * m.weight_grams * t.distance_km / 1000000 :: numeric as total_marine_eutrophication,
    f.rmh_cht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_carcinogenic_human_toxicity,
    f.rmh_ncht * m.weight_grams * t.distance_km / 1000000 :: numeric as total_non_carcinogenic_human_toxicity,
    f.rmh_ir * m.weight_grams * t.distance_km / 1000000 :: numeric as total_ionizing_radiation,
    f.rmh_l * m.weight_grams * t.distance_km / 1000000 :: numeric as total_land_use,
    f.rmh_mm_r * m.weight_grams * t.distance_km / 1000000 :: numeric as total_metals_material_resources,
    f.rmh_od * m.weight_grams * t.distance_km / 1000000 :: numeric as total_ozone_depletion,
    f.rmh_pm * m.weight_grams * t.distance_km / 1000000 :: numeric as total_particulate_matter_formation,
    f.rmh_hh_oc * m.weight_grams * t.distance_km / 1000000 :: numeric as total_human_health_photochemical_ozone_creation,
    f.rmh_t_oc * m.weight_grams * t.distance_km / 1000000 :: numeric as total_terrestrial_photochemical_ozone_creation,
    f.rmh_w * m.weight_grams * t.distance_km / 1000000 :: numeric as total_water_use
FROM
    transportation t
    LEFT JOIN material_composition m ON t.material_composition_id = m.id
    LEFT JOIN parts p ON m.retake_part_id = p.retake_part_id
    LEFT JOIN third_party_factors f ON t.factor_id = f.factor_id
WHERE
    t.lca_id = selected_lca_id;

RETURN;

end $function$
;

CREATE OR REPLACE FUNCTION public.rmh_use_phase_with_impacts(selected_lca_id uuid)
 RETURNS TABLE(id uuid, org_id text, lca_id uuid, quantity numeric, location text, percent_at_location numeric, factor_id uuid, use_type use_type_enum, has_use_phase boolean, reference_product_name text, database_name text, activity_name text, total_acidification numeric, total_global_warming numeric, total_freshwater_ecotoxicity numeric, total_marine_ecotoxicity numeric, total_terrestrial_ecotoxicity numeric, total_energy_resources numeric, total_freshwater_eutrophication numeric, total_marine_eutrophication numeric, total_carcinogenic_human_toxicity numeric, total_non_carcinogenic_human_toxicity numeric, total_ionizing_radiation numeric, total_land_use numeric, total_metals_material_resources numeric, total_ozone_depletion numeric, total_particulate_matter_formation numeric, total_human_health_photochemical_ozone_creation numeric, total_terrestrial_photochemical_ozone_creation numeric, total_water_use numeric)
 LANGUAGE plpgsql
AS $function$ begin RETURN QUERY
SELECT
    up.id,
    up.org_id,
    up.lca_id,
    up.quantity,
    up.location,
    up.percent_at_location,
    up.factor_id,
    up.use_type,
    s.has_use_phase,
    f.reference_product_name,
    f.database_name,
    f.activity_name,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_t_ac * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_acidification,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_g * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_global_warming,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_f_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_freshwater_ecotoxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_m_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_marine_ecotoxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_t_et * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_terrestrial_ecotoxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_er * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_energy_resources,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_f_eu * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_freshwater_eutrophication,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_m_eu * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_marine_eutrophication,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_cht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_carcinogenic_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_ncht * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_non_carcinogenic_human_toxicity,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_ir * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_ionizing_radiation,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_l * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_land_use,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_mm_r * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_metals_material_resources,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_od * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_ozone_depletion,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_pm * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_particulate_matter_formation,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_hh_oc * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_human_health_photochemical_ozone_creation,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_t_oc * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_terrestrial_photochemical_ozone_creation,
    case
        when s.has_use_phase = false then 0 :: numeric
        else f.rmh_w * up.quantity * s.quantity * up.percent_at_location / 100 :: numeric
    end as total_water_use
FROM
    use_phase up
    JOIN third_party_factors f ON f.factor_id = up.factor_id
    JOIN service_life s ON s.lca_id = up.lca_id
WHERE
    up.lca_id = selected_lca_id;

RETURN;

end $function$
;

create or replace view "public"."cml_parts_with_impacts" as  WITH parts_suppliers AS (
         SELECT p_1.retake_part_id,
            s.id AS supplier_id,
            s.name AS supplier_name,
            COALESCE(( SELECT suppliers.contacts
                   FROM suppliers
                  WHERE ((suppliers.id = s.id) AND (suppliers.contacts IS NOT NULL))), ARRAY[]::text[]) AS supplier_contacts
           FROM (parts_by_supplier p_1
             LEFT JOIN suppliers s ON ((s.id = p_1.supplier_id)))
          GROUP BY p_1.retake_part_id, s.id, s.name
        ), unique_product_supplier_engagement AS (
         SELECT DISTINCT supplier_product_engagement.retake_part_id,
            supplier_product_engagement.supplier_id
           FROM supplier_product_engagement
        ), excluded_material_composition AS (
         SELECT material_composition.retake_part_id
           FROM material_composition
          WHERE (material_composition.level = (1)::numeric)
        )
 SELECT p.customer_part_id,
    p.created_at,
    p.part_description,
    p.origin,
    p.org_id,
    p.supplier_id,
    p.retake_part_id,
    p.manufacturing_process,
    p.factor_id,
    p.primary_material,
    p.is_base_material,
    ps.supplier_name,
    ps.supplier_contacts,
        CASE
            WHEN ((rf.retake_part_id IS NOT NULL) AND (rf.supplier_id IS NOT NULL)) THEN 'supplier'::text
            ELSE 'database'::text
        END AS impact_source,
    COALESCE(
        CASE
            WHEN ((rf.retake_part_id IS NOT NULL) AND (rf.supplier_id IS NOT NULL)) THEN 'data_received'::text
            WHEN ((upse.retake_part_id IS NOT NULL) AND (upse.supplier_id = p.supplier_id)) THEN 'awaiting_response'::text
            ELSE 'not_engaged'::text
        END, 'not_engaged'::text) AS supplier_engagement,
    COALESCE(rf.cml_ac, f.cml_ac, (0)::numeric) AS acidification,
    COALESCE(rf.cml_g, f.cml_g, (0)::numeric) AS global_warming,
    COALESCE(rf.cml_f_et, f.cml_f_et, (0)::numeric) AS freshwater_ecotoxicity,
    COALESCE(rf.cml_m_et, f.cml_m_et, (0)::numeric) AS marine_ecotoxicity,
    COALESCE(rf.cml_t_et, f.cml_t_et, (0)::numeric) AS terrestrial_ecotoxicity,
    COALESCE(rf.cml_ad_ff, f.cml_ad_ff, (0)::numeric) AS abiotic_depletion_fossil_fuels,
    COALESCE(rf.cml_ad, f.cml_ad, (0)::numeric) AS abiotic_depletion,
    COALESCE(rf.cml_eu, f.cml_eu, (0)::numeric) AS eutrophication,
    COALESCE(rf.cml_h_et, f.cml_h_et, (0)::numeric) AS human_toxicity,
    COALESCE(rf.cml_od, f.cml_od, (0)::numeric) AS ozone_depletion,
    COALESCE(rf.cml_oc, f.cml_oc, (0)::numeric) AS photochemical_ozone_creation,
    f.reference_product_name,
    f.activity_name,
    f.database_name
   FROM ((((parts_by_supplier_with_factors p
     LEFT JOIN parts_suppliers ps ON (((p.retake_part_id = ps.retake_part_id) AND (p.supplier_id = ps.supplier_id))))
     LEFT JOIN third_party_factors f ON ((p.factor_id = f.factor_id)))
     LEFT JOIN retake_factors rf ON (((p.retake_part_id = rf.retake_part_id) AND (p.supplier_id = rf.supplier_id))))
     LEFT JOIN unique_product_supplier_engagement upse ON (((p.retake_part_id = upse.retake_part_id) AND (p.supplier_id = upse.supplier_id))))
  WHERE (NOT (p.retake_part_id IN ( SELECT excluded_material_composition.retake_part_id
           FROM excluded_material_composition)));


create or replace view "public"."material_composition_with_descriptions" as  SELECT mc.id,
    mc.created_at,
    mc.weight_grams,
    mc.org_id,
    mc.lca_id,
    mc.level,
    mc.parent_id,
    mc.retake_part_id,
    mc.supplier_id,
    p.part_description,
    p.primary_material,
    s.name AS supplier_name
   FROM ((material_composition mc
     LEFT JOIN parts p ON ((mc.retake_part_id = p.retake_part_id)))
     LEFT JOIN suppliers s ON ((mc.supplier_id = s.id)));


create or replace view "public"."parts_engagement_status" as  SELECT cml_parts_with_impacts.org_id,
    count(*) FILTER (WHERE (cml_parts_with_impacts.supplier_engagement = 'not_engaged'::text)) AS not_engaged,
    count(*) FILTER (WHERE (cml_parts_with_impacts.supplier_engagement = 'awaiting_response'::text)) AS awaiting_response,
    count(*) FILTER (WHERE (cml_parts_with_impacts.impact_source = 'supplier'::text)) AS data_received
   FROM cml_parts_with_impacts
  WHERE (cml_parts_with_impacts.is_base_material = false)
  GROUP BY cml_parts_with_impacts.org_id;



