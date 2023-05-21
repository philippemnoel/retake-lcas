set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.ef_material_composition_with_factors(selected_lca_id uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, weight_grams numeric, org_id text, lca_id uuid, level numeric, parent_id uuid, retake_part_id text, supplier_id text, customer_part_id text, part_description text, origin text, manufacturing_process text, primary_material text, factor_id uuid, reference_product_name text, activity_name text, database_name text, acidification double precision, global_warming double precision, biogenic_global_warming double precision, fossil_fuel_global_warming double precision, land_use_global_warming double precision, freshwater_ecotoxicity double precision, freshwater_inorganics_ecotoxicity double precision, freshwater_organics_ecotoxicity double precision, abiotic_depletion_fossil_fuels double precision, freshwater_eutrophication double precision, marine_eutrophication double precision, terrestrial_eutrophication double precision, carcinogenic_human_toxicity double precision, carcinogenic_inorganics_human_toxicity double precision, carcinogenic_organics_human_toxicity double precision, non_carcinogenic_human_toxicity double precision, non_carcinogenic_inorganics_human_toxicity double precision, non_carcinogenic_organics_human_toxicity double precision, ionizing_radiation double precision, land_use double precision, abiotic_depletion double precision, ozone_depletion double precision, particulate_matter_formation double precision, human_health_photochemical_ozone_creation double precision, water_use double precision, is_supplier_specific boolean)
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


