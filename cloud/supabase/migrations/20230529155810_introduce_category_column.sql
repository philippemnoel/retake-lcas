alter table "public"."parts" drop constraint "unique_org_part";

drop view if exists "public"."parts_engagement_status";

drop view if exists "public"."cml_parts_with_impacts";

drop view if exists "public"."parts_by_supplier_with_factors";

drop view if exists "public"."parts_by_supplier";

drop index if exists "public"."unique_org_part";

alter table "public"."parts" add column "category" text;

alter table "public"."third_party_factors" add column "category" text;

create or replace view "public"."parts_by_supplier" as  SELECT p.retake_part_id,
    p.customer_part_id,
    p.created_at,
    p.part_description,
    p.origin,
    p.org_id,
    p.manufacturing_process,
    p.category,
    p.primary_material,
    p.is_base_material,
    supplier_id_arr.supplier_id
   FROM (parts p
     LEFT JOIN LATERAL unnest(p.supplier_ids) WITH ORDINALITY supplier_id_arr(supplier_id, ordinality) ON (true));


create or replace view "public"."parts_by_supplier_with_factors" as  SELECT p.customer_part_id,
    p.created_at,
    p.part_description,
    p.origin,
    p.org_id,
    p.retake_part_id,
    p.manufacturing_process,
    p.category,
    p.primary_material,
    p.is_base_material,
    p.supplier_id,
    f.factor_id
   FROM (parts_by_supplier p
     LEFT JOIN parts_third_party_factors f ON ((p.retake_part_id = f.retake_part_id)));


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
    p.category,
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


create or replace view "public"."parts_engagement_status" as  SELECT cml_parts_with_impacts.org_id,
    count(*) FILTER (WHERE (cml_parts_with_impacts.supplier_engagement = 'not_engaged'::text)) AS not_engaged,
    count(*) FILTER (WHERE (cml_parts_with_impacts.supplier_engagement = 'awaiting_response'::text)) AS awaiting_response,
    count(*) FILTER (WHERE (cml_parts_with_impacts.impact_source = 'supplier'::text)) AS data_received
   FROM cml_parts_with_impacts
  WHERE (cml_parts_with_impacts.is_base_material = false)
  GROUP BY cml_parts_with_impacts.org_id;



