drop function if exists "public"."cml_material_composition_with_factors"(selected_lca_id uuid);

drop function if exists "public"."ef_material_composition_with_factors"(selected_lca_id uuid);

drop view if exists "public"."parts_with_factors";

drop function if exists "public"."rmh_material_composition_with_factors"(selected_lca_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cml_material_composition_with_factors(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, weight_grams numeric, org_id text, lca_id uuid, level numeric, parent_id uuid, retake_part_id text, supplier_id text, customer_part_id text, part_description text, origin text, manufacturing_process text, primary_material text, supplier_ids text[], factor_id uuid, reference_product_name text, activity_name text, database_name text, acidification double precision, global_warming double precision, freshwater_ecotoxicity double precision, marine_ecotoxicity double precision, terrestrial_ecotoxicity double precision, abiotic_depletion_fossil_fuels double precision, eutrophication double precision, human_toxicity double precision, abiotic_depletion double precision, ozone_depletion double precision, photochemical_ozone_creation double precision, is_supplier_specific boolean)
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
    parts.supplier_ids,
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

CREATE OR REPLACE FUNCTION public.ef_material_composition_with_factors(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, weight_grams numeric, org_id text, lca_id uuid, level numeric, parent_id uuid, retake_part_id text, supplier_id text, customer_part_id text, part_description text, origin text, manufacturing_process text, primary_material text, supplier_ids text[], factor_id uuid, reference_product_name text, activity_name text, database_name text, acidification double precision, global_warming double precision, biogenic_global_warming double precision, fossil_fuel_global_warming double precision, land_use_global_warming double precision, freshwater_ecotoxicity double precision, freshwater_inorganics_ecotoxicity double precision, freshwater_organics_ecotoxicity double precision, abiotic_depletion_fossil_fuels double precision, freshwater_eutrophication double precision, marine_eutrophication double precision, terrestrial_eutrophication double precision, carcinogenic_human_toxicity double precision, carcinogenic_inorganics_human_toxicity double precision, carcinogenic_organics_human_toxicity double precision, non_carcinogenic_human_toxicity double precision, non_carcinogenic_inorganics_human_toxicity double precision, non_carcinogenic_organics_human_toxicity double precision, ionizing_radiation double precision, land_use double precision, abiotic_depletion double precision, ozone_depletion double precision, particulate_matter_formation double precision, human_health_photochemical_ozone_creation double precision, water_use double precision, is_supplier_specific boolean)
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
    parts.supplier_ids,
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

create or replace view "public"."parts_with_factors" as  SELECT p.customer_part_id,
    p.created_at,
    p.part_description,
    p.origin,
    p.org_id,
    p.retake_part_id,
    p.manufacturing_process,
    p.primary_material,
    p.is_base_material,
    p.supplier_ids,
    f.factor_id
   FROM (parts p
     LEFT JOIN parts_third_party_factors f ON ((p.retake_part_id = f.retake_part_id)));


CREATE OR REPLACE FUNCTION public.rmh_material_composition_with_factors(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, weight_grams numeric, org_id text, lca_id uuid, level numeric, parent_id uuid, retake_part_id text, supplier_id text, customer_part_id text, part_description text, origin text, manufacturing_process text, primary_material text, supplier_ids text[], factor_id uuid, reference_product_name text, activity_name text, database_name text, acidification double precision, global_warming double precision, freshwater_ecotoxicity double precision, marine_ecotoxicity double precision, terrestrial_ecotoxicity double precision, energy_resources double precision, freshwater_eutrophication double precision, marine_eutrophication double precision, carcinogenic_human_toxicity double precision, non_carcinogenic_human_toxicity double precision, ionizing_radiation double precision, land_use double precision, metals_material_resources double precision, ozone_depletion double precision, particulate_matter_formation double precision, human_health_photochemical_ozone_creation double precision, terrestrial_photochemical_ozone_creation double precision, water_use double precision, is_supplier_specific boolean)
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
    parts.supplier_ids,
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


