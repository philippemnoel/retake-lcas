--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1 (Debian 15.1-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: use_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."use_type_enum" AS ENUM (
    'WATER',
    'NATURAL_GAS',
    'PETROL',
    'ELECTRICITY'
);


ALTER TYPE "public"."use_type_enum" OWNER TO "postgres";

--
-- Name: emissions_factors("text", "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."emissions_factors"("categ" "text", "units" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  factor_row "Emissions Factors"%ROWTYPE;
begin
  select * into factor_row from "Emissions Factors" where category = categ
  and unit_type = units;

  if not found then
    raise exception 'emissions factor for category % and unit type % not found', categ, units;
  end if;
end;
$$;


ALTER FUNCTION "public"."emissions_factors"("categ" "text", "units" "text") OWNER TO "postgres";

--
-- Name: get_campaigns("text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_campaigns"("org_id" "text") RETURNS TABLE("name" "text", "id" "uuid", "email" "text", "number_awaiting" numeric, "number_incomplete" numeric, "number_synced" numeric)
    LANGUAGE "sql"
    AS $_$
SELECT campaigns.name, campaigns.id, campaigns.email,
       SUM(CASE WHEN campaign_outreach.status = 'waiting' THEN 1 ELSE 0 END) AS number_awaiting,
       SUM(CASE WHEN campaign_outreach.status = 'incomplete' THEN 1 ELSE 0 END) AS number_incomplete,
       SUM(CASE WHEN campaign_outreach.status = 'synced' THEN 1 ELSE 0 END) AS number_synced
FROM campaigns
LEFT JOIN campaign_outreach ON campaigns.id = campaign_outreach.campaign_id
WHERE campaigns.org_id = $1
GROUP BY campaigns.name, campaigns.id, campaigns.email;
$_$;


ALTER FUNCTION "public"."get_campaigns"("org_id" "text") OWNER TO "postgres";

--
-- Name: get_categories("text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_categories"("input_org_id" "text") RETURNS SETOF "text"
    LANGUAGE "sql"
    AS $_$
    SELECT DISTINCT ghg_category
    FROM activities
    WHERE org_id = $1
    ORDER BY ghg_category ASC;
$_$;


ALTER FUNCTION "public"."get_categories"("input_org_id" "text") OWNER TO "postgres";

--
-- Name: get_documents("text", "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_documents"("input_org_id" "text", "file_type" "text") RETURNS TABLE("document_path" "text", "document_bucket" "text", "last_updated" timestamp with time zone, "scope_1" boolean, "scope_2" boolean, "scope_3" boolean, "approved" boolean)
    LANGUAGE "sql"
    AS $_$
SELECT 
    document_path, 
    document_bucket, 
    MAX(last_updated) AS last_updated,
    bool_or(ghg_category LIKE '%Scope 1%') AS scope_1,
    bool_or(ghg_category LIKE '%Scope 2%') AS scope_2,
    bool_or(ghg_category LIKE '%Scope 3%') AS scope_3,
    bool_and(user_approved) AS approved
FROM activities
WHERE org_id = $1 AND document_path LIKE '%' || $2
GROUP BY document_path, document_bucket;
$_$;


ALTER FUNCTION "public"."get_documents"("input_org_id" "text", "file_type" "text") OWNER TO "postgres";

--
-- Name: get_sorted_years("text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_sorted_years"("input_org_id" "text") RETURNS SETOF integer
    LANGUAGE "sql"
    AS $_$
    SELECT DISTINCT year
    FROM activities
    WHERE org_id = $1
    ORDER BY year ASC;
$_$;


ALTER FUNCTION "public"."get_sorted_years"("input_org_id" "text") OWNER TO "postgres";

--
-- Name: get_total_kg_co2e("text", numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "year" numeric) RETURNS numeric
    LANGUAGE "sql"
    AS $$
    SELECT CAST(
        SUM(
            CASE
                WHEN activities.total_kg_co2e IS NOT NULL THEN coalesce(activities.total_kg_co2e, 0)
                ELSE coalesce(activities.quantity * activities.factor, 0)
            END
        ) AS numeric
    )
    FROM activities
    WHERE activities.ghg_category LIKE '%' || ghg_category || '%'
        AND activities.year = year;
$$;


ALTER FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "year" numeric) OWNER TO "postgres";

--
-- Name: get_total_kg_co2e("text", "text", numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "input_org_id" "text", "year" numeric) RETURNS numeric
    LANGUAGE "sql"
    AS $_$
    SELECT CAST(
        SUM(
            CASE
                WHEN activities.total_kg_co2e IS NOT NULL THEN coalesce(activities.total_kg_co2e, 0)
                ELSE coalesce(activities.quantity * activities.factor, 0)
            END
        ) AS numeric
    )
    FROM activities
    WHERE activities.ghg_category LIKE '%' || $1 || '%'
        AND activities.year = $3
        AND activities.org_id = $2;
$_$;


ALTER FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "input_org_id" "text", "year" numeric) OWNER TO "postgres";

--
-- Name: get_vendors_by_year("text", numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_vendors_by_year"("org_id" "text", "year" numeric) RETURNS "record"
    LANGUAGE "sql"
    AS $_$SELECT
    vendors.*,
    CAST(
        SUM(
            activities.quantity * activities.factor
        ) AS NUMERIC
    ) AS footprint,
    CAST(
        SUM(activities.quantity) AS NUMERIC
    ) AS total_spend
FROM
    activities
JOIN vendors ON activities.vendor_id = vendors.id
WHERE
    activities.org_id = $1 AND activities.year = $2
GROUP BY
    vendors.id;$_$;


ALTER FUNCTION "public"."get_vendors_by_year"("org_id" "text", "year" numeric) OWNER TO "postgres";

--
-- Name: notify_parts_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."notify_parts_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  retake_part_ids text[];
  payload text;
BEGIN
  SELECT ARRAY(SELECT new_table.retake_part_id FROM new_table) INTO retake_part_ids;
  payload := array_to_string(retake_part_ids, ',');
  PERFORM pg_notify('parts_change', payload);
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."notify_parts_change"() OWNER TO "postgres";

--
-- Name: validate_organization_name("text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."validate_organization_name"("org_name" "text") RETURNS boolean
    LANGUAGE "sql"
    AS $_$select exists(select 1 from organizations where name=$1) as "exists";$_$;


ALTER FUNCTION "public"."validate_organization_name"("org_name" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."activities" (
    "vendor" "text",
    "description" "text",
    "year" bigint,
    "region" "text",
    "units" "text",
    "quantity" numeric,
    "org_id" "text" NOT NULL,
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid",
    "document_path" "text",
    "document_bucket" "text",
    "ghg_category" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "additional_data" "text",
    "additional_details" "text",
    "date" timestamp with time zone,
    "factor" numeric,
    "factor_source" "text",
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "retake_approved" boolean,
    "total_kg_co2e" numeric,
    "user_approved" boolean,
    "factor_explanation" "text"
);


ALTER TABLE "public"."activities" OWNER TO "postgres";

--
-- Name: cml_end_of_life_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."cml_end_of_life_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_eutrophication" numeric,
    "total_ozone_depletion" numeric,
    "total_human_toxicity" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_abiotic_depletion" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_photochemical_ozone_creation" numeric
);


ALTER TABLE "public"."cml_end_of_life_results" OWNER TO "postgres";

--
-- Name: end_of_life; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."end_of_life" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "org_id" "text",
    "lca_id" "uuid",
    "description" "text",
    "weight_grams" numeric,
    "location" "text",
    "factor_id" "uuid"
);


ALTER TABLE "public"."end_of_life" OWNER TO "postgres";

--
-- Name: third_party_factors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."third_party_factors" (
    "factor_id" "uuid" NOT NULL,
    "activity_name" "text",
    "reference_product_name" "text",
    "reference_unit" "text",
    "sector" "text",
    "location" "text",
    "database_name" "text",
    "cml_ac" numeric,
    "cml_ad" numeric,
    "cml_ad_ff" numeric,
    "cml_eu" numeric,
    "cml_f_et" numeric,
    "cml_g" numeric,
    "cml_h_et" numeric,
    "cml_m_et" numeric,
    "cml_oc" numeric,
    "cml_od" numeric,
    "cml_t_et" numeric,
    "ef_ac" numeric,
    "ef_ad" numeric,
    "ef_ad_ff" numeric,
    "ef_b_g" numeric,
    "ef_cht" numeric,
    "ef_ciht" numeric,
    "ef_coht" numeric,
    "ef_f_et" numeric,
    "ef_f_eu" numeric,
    "ef_f_i_et" numeric,
    "ef_f_o_et" numeric,
    "ef_ff_g" numeric,
    "ef_g" numeric,
    "ef_hh_oc" numeric,
    "ef_ir" numeric,
    "ef_l" numeric,
    "ef_l_g" numeric,
    "ef_m_eu" numeric,
    "ef_ncht" numeric,
    "ef_nciht" numeric,
    "ef_ncoht" numeric,
    "ef_od" numeric,
    "ef_pm" numeric,
    "ef_t_eu" numeric,
    "ef_w" numeric,
    "rmh_cht" numeric,
    "rmh_er" numeric,
    "rmh_f_et" numeric,
    "rmh_f_eu" numeric,
    "rmh_g" numeric,
    "rmh_hh_oc" numeric,
    "rmh_ir" numeric,
    "rmh_l" numeric,
    "rmh_m_et" numeric,
    "rmh_m_eu" numeric,
    "rmh_mm_r" numeric,
    "rmh_ncht" numeric,
    "rmh_od" numeric,
    "rmh_pm" numeric,
    "rmh_t_ac" numeric,
    "rmh_t_et" numeric,
    "rmh_t_oc" numeric,
    "rmh_w" numeric,
    "t_ac" numeric,
    "t_cht" numeric,
    "t_eu" numeric,
    "t_f_et" numeric,
    "t_g" numeric,
    "t_nc_ac" numeric,
    "t_oc" numeric,
    "t_od" numeric,
    "t_pm" numeric
);


ALTER TABLE "public"."third_party_factors" OWNER TO "postgres";

--
-- Name: cml_end_of_life_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_end_of_life_with_impacts" AS
 SELECT "eol"."id",
    "eol"."created_at",
    "eol"."org_id",
    "eol"."lca_id",
    "eol"."description",
    "eol"."weight_grams",
    "eol"."location",
    "eol"."factor_id",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    (("f"."cml_ac" * "eol"."weight_grams") / (1000)::numeric) AS "total_acidification",
    (("f"."cml_g" * "eol"."weight_grams") / (1000)::numeric) AS "total_global_warming",
    (("f"."cml_f_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_freshwater_ecotoxicity",
    (("f"."cml_m_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_marine_ecotoxicity",
    (("f"."cml_t_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_terrestrial_ecotoxicity",
    (("f"."cml_ad_ff" * "eol"."weight_grams") / (1000)::numeric) AS "total_abiotic_depletion_fossil_fuels",
    (("f"."cml_eu" * "eol"."weight_grams") / (1000)::numeric) AS "total_eutrophication",
    (("f"."cml_h_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_human_toxicity",
    (("f"."cml_ad" * "eol"."weight_grams") / (1000)::numeric) AS "total_abiotic_depletion",
    (("f"."cml_od" * "eol"."weight_grams") / (1000)::numeric) AS "total_ozone_depletion",
    (("f"."cml_oc" * "eol"."weight_grams") / (1000)::numeric) AS "total_photochemical_ozone_creation"
   FROM ("public"."end_of_life" "eol"
     LEFT JOIN "public"."third_party_factors" "f" ON (("eol"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."cml_end_of_life_with_impacts" OWNER TO "postgres";

--
-- Name: purchased_energy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."purchased_energy" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "quantity_kwh" numeric DEFAULT '0'::numeric,
    "facility_id" "uuid",
    "org_id" "text",
    "percent_renewable" numeric DEFAULT '0'::numeric,
    "year" numeric,
    "factor_id" "uuid"
);


ALTER TABLE "public"."purchased_energy" OWNER TO "postgres";

--
-- Name: cml_purchased_energy_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_purchased_energy_with_impacts" AS
 SELECT "pe"."id",
    "pe"."created_at",
    "pe"."description",
    "pe"."quantity_kwh",
    "pe"."facility_id",
    "pe"."org_id",
    "pe"."percent_renewable",
    "pe"."year",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ("f"."cml_ac" * "pe"."quantity_kwh") AS "total_acidification",
    ("f"."cml_g" * "pe"."quantity_kwh") AS "total_global_warming",
    ("f"."cml_f_et" * "pe"."quantity_kwh") AS "total_freshwater_ecotoxicity",
    ("f"."cml_m_et" * "pe"."quantity_kwh") AS "total_marine_ecotoxicity",
    ("f"."cml_t_et" * "pe"."quantity_kwh") AS "total_terrestrial_ecotoxicity",
    ("f"."cml_ad_ff" * "pe"."quantity_kwh") AS "total_abiotic_depletion_fossil_fuels",
    ("f"."cml_eu" * "pe"."quantity_kwh") AS "total_eutrophication",
    ("f"."cml_h_et" * "pe"."quantity_kwh") AS "total_human_toxicity",
    ("f"."cml_ad" * "pe"."quantity_kwh") AS "total_abiotic_depletion",
    ("f"."cml_od" * "pe"."quantity_kwh") AS "total_ozone_depletion",
    ("f"."cml_oc" * "pe"."quantity_kwh") AS "total_photochemical_ozone_creation"
   FROM ("public"."purchased_energy" "pe"
     LEFT JOIN "public"."third_party_factors" "f" ON (("pe"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."cml_purchased_energy_with_impacts" OWNER TO "postgres";

--
-- Name: stationary_fuel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."stationary_fuel" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "facility_id" "uuid",
    "year" numeric,
    "description" "text",
    "quantity_mj" numeric DEFAULT '0'::numeric,
    "org_id" "text",
    "factor_id" "uuid"
);


ALTER TABLE "public"."stationary_fuel" OWNER TO "postgres";

--
-- Name: cml_stationary_fuel_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_stationary_fuel_with_impacts" AS
 SELECT "sf"."id",
    "sf"."facility_id",
    "sf"."year",
    "sf"."description",
    "sf"."quantity_mj",
    "sf"."org_id",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ("f"."cml_ac" * "sf"."quantity_mj") AS "total_acidification",
    ("f"."cml_g" * "sf"."quantity_mj") AS "total_global_warming",
    ("f"."cml_f_et" * "sf"."quantity_mj") AS "total_freshwater_ecotoxicity",
    ("f"."cml_m_et" * "sf"."quantity_mj") AS "total_marine_ecotoxicity",
    ("f"."cml_t_et" * "sf"."quantity_mj") AS "total_terrestrial_ecotoxicity",
    ("f"."cml_ad_ff" * "sf"."quantity_mj") AS "total_abiotic_depletion_fossil_fuels",
    ("f"."cml_eu" * "sf"."quantity_mj") AS "total_eutrophication",
    ("f"."cml_h_et" * "sf"."quantity_mj") AS "total_human_toxicity",
    ("f"."cml_ad" * "sf"."quantity_mj") AS "total_abiotic_depletion",
    ("f"."cml_od" * "sf"."quantity_mj") AS "total_ozone_depletion",
    ("f"."cml_oc" * "sf"."quantity_mj") AS "total_photochemical_ozone_creation"
   FROM ("public"."stationary_fuel" "sf"
     LEFT JOIN "public"."third_party_factors" "f" ON (("sf"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."cml_stationary_fuel_with_impacts" OWNER TO "postgres";

--
-- Name: facilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."facilities" (
    "org_id" "text",
    "name" "text",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "id" "uuid" NOT NULL
);


ALTER TABLE "public"."facilities" OWNER TO "postgres";

--
-- Name: cml_facility_energy_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_facility_energy_with_impacts" AS
 SELECT "f"."org_id",
    "f"."name",
    "f"."location",
    "f"."created_at",
    "f"."id",
    "pe"."quantity_kwh",
    "pe"."percent_renewable",
    "sf"."quantity_mj",
    ("pe"."total_acidification" + "sf"."total_acidification") AS "total_acidification",
    ("pe"."total_global_warming" + "sf"."total_global_warming") AS "total_global_warming",
    ("pe"."total_freshwater_ecotoxicity" + "sf"."total_freshwater_ecotoxicity") AS "total_freshwater_ecotoxicity",
    ("pe"."total_marine_ecotoxicity" + "sf"."total_marine_ecotoxicity") AS "total_marine_ecotoxicity",
    ("pe"."total_terrestrial_ecotoxicity" + "sf"."total_terrestrial_ecotoxicity") AS "total_terrestrial_ecotoxicity",
    ("pe"."total_abiotic_depletion_fossil_fuels" + "sf"."total_abiotic_depletion_fossil_fuels") AS "total_abiotic_depletion_fossil_fuels",
    ("pe"."total_eutrophication" + "sf"."total_eutrophication") AS "total_eutrophication",
    ("pe"."total_human_toxicity" + "sf"."total_human_toxicity") AS "total_human_toxicity",
    ("pe"."total_abiotic_depletion" + "sf"."total_abiotic_depletion") AS "total_abiotic_depletion",
    ("pe"."total_ozone_depletion" + "sf"."total_ozone_depletion") AS "total_ozone_depletion",
    ("pe"."total_photochemical_ozone_creation" + "sf"."total_photochemical_ozone_creation") AS "total_photochemical_ozone_creation"
   FROM (("public"."facilities" "f"
     LEFT JOIN "public"."cml_purchased_energy_with_impacts" "pe" ON ((("f"."id" = "pe"."facility_id") AND ("pe"."year" = (EXTRACT(year FROM CURRENT_DATE) - (1)::numeric)))))
     LEFT JOIN "public"."cml_stationary_fuel_with_impacts" "sf" ON ((("f"."id" = "sf"."facility_id") AND ("sf"."year" = (EXTRACT(year FROM CURRENT_DATE) - (1)::numeric)))));


ALTER TABLE "public"."cml_facility_energy_with_impacts" OWNER TO "postgres";

--
-- Name: facility_allocation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."facility_allocation" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "facility_id" "uuid" NOT NULL,
    "percent_revenue" numeric DEFAULT '0'::numeric,
    "quantity_produced" numeric DEFAULT '0'::numeric,
    "lca_id" "uuid",
    "org_id" "text"
);


ALTER TABLE "public"."facility_allocation" OWNER TO "postgres";

--
-- Name: cml_facility_allocation_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_facility_allocation_with_impacts" AS
 SELECT "fa"."id",
    "fa"."created_at",
    "fa"."facility_id",
    "fa"."percent_revenue",
    "fa"."quantity_produced",
    "fa"."lca_id",
    "fa"."org_id",
    "f"."name",
    "f"."location",
    "f"."percent_renewable",
    ((("f"."quantity_mj" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "quantity_mj",
    ((("f"."quantity_kwh" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "quantity_kwh",
    ((("f"."total_acidification" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_acidification",
    ((("f"."total_global_warming" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_global_warming",
    ((("f"."total_freshwater_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_freshwater_ecotoxicity",
    ((("f"."total_marine_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_marine_ecotoxicity",
    ((("f"."total_terrestrial_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_terrestrial_ecotoxicity",
    ((("f"."total_abiotic_depletion_fossil_fuels" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_abiotic_depletion_fossil_fuels",
    ((("f"."total_eutrophication" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_eutrophication",
    ((("f"."total_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_human_toxicity",
    ((("f"."total_abiotic_depletion" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_abiotic_depletion",
    ((("f"."total_ozone_depletion" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_ozone_depletion",
    ((("f"."total_photochemical_ozone_creation" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_photochemical_ozone_creation"
   FROM ("public"."cml_facility_energy_with_impacts" "f"
     JOIN "public"."facility_allocation" "fa" ON (("f"."id" = "fa"."facility_id")));


ALTER TABLE "public"."cml_facility_allocation_with_impacts" OWNER TO "postgres";

--
-- Name: cml_manufacturing_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."cml_manufacturing_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_eutrophication" numeric,
    "total_ozone_depletion" numeric,
    "total_human_toxicity" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_abiotic_depletion" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_photochemical_ozone_creation" numeric
);


ALTER TABLE "public"."cml_manufacturing_results" OWNER TO "postgres";

--
-- Name: material_composition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."material_composition" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "weight_grams" numeric DEFAULT '0'::numeric,
    "org_id" "text",
    "lca_id" "uuid",
    "level" numeric,
    "parent_id" "uuid",
    "leaf" boolean,
    "retake_part_id" "text",
    "supplier_id" "text"
);


ALTER TABLE "public"."material_composition" OWNER TO "postgres";

--
-- Name: parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."parts" (
    "customer_part_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "part_description" "text",
    "origin" "text",
    "org_id" "text",
    "retake_part_id" "text" NOT NULL,
    "manufacturing_process" "text",
    "primary_material" "text",
    "is_base_material" boolean DEFAULT false NOT NULL,
    "supplier_ids" "text"[] DEFAULT '{}'::"text"[],
    "long_description" "text"
);


ALTER TABLE "public"."parts" OWNER TO "postgres";

--
-- Name: parts_third_party_factors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."parts_third_party_factors" (
    "retake_part_id" "text" NOT NULL,
    "factor_id" "uuid" NOT NULL
);


ALTER TABLE "public"."parts_third_party_factors" OWNER TO "postgres";

--
-- Name: parts_with_factors; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."parts_with_factors" AS
 SELECT "p"."customer_part_id",
    "p"."created_at",
    "p"."part_description",
    "p"."origin",
    "p"."org_id",
    "p"."retake_part_id",
    "p"."manufacturing_process",
    "p"."primary_material",
    "p"."is_base_material",
    "f"."factor_id"
   FROM ("public"."parts" "p"
     LEFT JOIN "public"."parts_third_party_factors" "f" ON (("p"."retake_part_id" = "f"."retake_part_id")));


ALTER TABLE "public"."parts_with_factors" OWNER TO "postgres";

--
-- Name: retake_factors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."retake_factors" (
    "factor_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "retake_part_id" "text",
    "supplier_id" "text",
    "created_at" timestamp with time zone,
    "cml_ac" numeric,
    "cml_ad" numeric,
    "cml_ad_ff" numeric,
    "cml_eu" numeric,
    "cml_f_et" numeric,
    "cml_g" numeric,
    "cml_h_et" numeric,
    "cml_m_et" numeric,
    "cml_oc" numeric,
    "cml_od" numeric,
    "cml_t_et" numeric,
    "ef_ac" numeric,
    "ef_ad" numeric,
    "ef_ad_ff" numeric,
    "ef_b_g" numeric,
    "ef_cht" numeric,
    "ef_ciht" numeric,
    "ef_coht" numeric,
    "ef_f_et" numeric,
    "ef_f_eu" numeric,
    "ef_f_i_et" numeric,
    "ef_f_o_et" numeric,
    "ef_ff_g" numeric,
    "ef_g" numeric,
    "ef_hh_oc" numeric,
    "ef_ir" numeric,
    "ef_l" numeric,
    "ef_l_g" numeric,
    "ef_m_eu" numeric,
    "ef_ncht" numeric,
    "ef_nciht" numeric,
    "ef_ncoht" numeric,
    "ef_od" numeric,
    "ef_pm" numeric,
    "ef_t_eu" numeric,
    "ef_w" numeric,
    "rmh_cht" numeric,
    "rmh_er" numeric,
    "rmh_f_et" numeric,
    "rmh_f_eu" numeric,
    "rmh_g" numeric,
    "rmh_hh_oc" numeric,
    "rmh_ir" numeric,
    "rmh_l" numeric,
    "rmh_m_et" numeric,
    "rmh_m_eu" numeric,
    "rmh_mm_r" numeric,
    "rmh_ncht" numeric,
    "rmh_od" numeric,
    "rmh_pm" numeric,
    "rmh_t_ac" numeric,
    "rmh_t_et" numeric,
    "rmh_t_oc" numeric,
    "rmh_w" numeric,
    "t_ac" numeric,
    "t_cht" numeric,
    "t_eu" numeric,
    "t_f_et" numeric,
    "t_g" numeric,
    "t_nc_ac" numeric,
    "t_oc" numeric,
    "t_od" numeric,
    "t_pm" numeric
);


ALTER TABLE "public"."retake_factors" OWNER TO "postgres";

--
-- Name: cml_material_composition_with_factors; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_material_composition_with_factors" AS
 SELECT "material_composition"."id",
    "material_composition"."created_at",
    "material_composition"."weight_grams",
    "material_composition"."org_id",
    "material_composition"."lca_id",
    "material_composition"."level",
    "material_composition"."parent_id",
    "material_composition"."leaf",
    "material_composition"."retake_part_id",
    "material_composition"."supplier_id",
    "parts"."customer_part_id",
    "parts"."part_description",
    "parts"."origin",
    "parts"."manufacturing_process",
    "parts"."primary_material",
    "factors"."factor_id",
    "factors"."reference_product_name",
    "factors"."activity_name",
    "factors"."database_name",
    COALESCE(("retake_factors"."cml_ac")::double precision, ("factors"."cml_ac")::double precision, (0)::double precision) AS "acidification",
    COALESCE(("retake_factors"."cml_g")::double precision, ("factors"."cml_g")::double precision, (0)::double precision) AS "global_warming",
    COALESCE(("retake_factors"."cml_f_et")::double precision, ("factors"."cml_f_et")::double precision, (0)::double precision) AS "freshwater_ecotoxicity",
    COALESCE(("retake_factors"."cml_m_et")::double precision, ("factors"."cml_m_et")::double precision, (0)::double precision) AS "marine_ecotoxicity",
    COALESCE(("retake_factors"."cml_t_et")::double precision, ("factors"."cml_t_et")::double precision, (0)::double precision) AS "terrestrial_ecotoxicity",
    COALESCE(("retake_factors"."cml_ad_ff")::double precision, ("factors"."cml_ad_ff")::double precision, (0)::double precision) AS "abiotic_depletion_fossil_fuels",
    COALESCE(("retake_factors"."cml_eu")::double precision, ("factors"."cml_eu")::double precision, (0)::double precision) AS "eutrophication",
    COALESCE(("retake_factors"."cml_h_et")::double precision, ("factors"."cml_h_et")::double precision, (0)::double precision) AS "human_toxicity",
    COALESCE(("retake_factors"."cml_ad")::double precision, ("factors"."cml_ad")::double precision, (0)::double precision) AS "abiotic_depletion",
    COALESCE(("retake_factors"."cml_od")::double precision, ("factors"."cml_od")::double precision, (0)::double precision) AS "ozone_depletion",
    COALESCE(("retake_factors"."cml_oc")::double precision, ("factors"."cml_oc")::double precision, (0)::double precision) AS "photochemical_ozone_creation",
        CASE
            WHEN ("retake_factors"."retake_part_id" IS NOT NULL) THEN true
            ELSE false
        END AS "is_supplier_specific"
   FROM ((("public"."material_composition"
     LEFT JOIN "public"."parts_with_factors" "parts" ON (("material_composition"."retake_part_id" = "parts"."retake_part_id")))
     LEFT JOIN "public"."third_party_factors" "factors" ON (("parts"."factor_id" = "factors"."factor_id")))
     LEFT JOIN "public"."retake_factors" ON ((("material_composition"."retake_part_id" = "retake_factors"."retake_part_id") AND ("material_composition"."supplier_id" = "retake_factors"."supplier_id"))));


ALTER TABLE "public"."cml_material_composition_with_factors" OWNER TO "postgres";

--
-- Name: cml_material_composition_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_material_composition_with_impacts" AS
 WITH RECURSIVE "tree_traversal" AS (
         SELECT "mcwf_1"."id",
            "mcwf_1"."parent_id",
            "mcwf_1"."acidification",
            "mcwf_1"."global_warming",
            "mcwf_1"."freshwater_ecotoxicity",
            "mcwf_1"."marine_ecotoxicity",
            "mcwf_1"."terrestrial_ecotoxicity",
            "mcwf_1"."abiotic_depletion_fossil_fuels",
            "mcwf_1"."eutrophication",
            "mcwf_1"."human_toxicity",
            "mcwf_1"."abiotic_depletion",
            "mcwf_1"."ozone_depletion",
            "mcwf_1"."photochemical_ozone_creation",
            "mcwf_1"."weight_grams",
            "mcwf_1"."is_supplier_specific",
            "row_number"() OVER (PARTITION BY "mcwf_1"."parent_id", "mcwf_1"."is_supplier_specific" ORDER BY "mcwf_1"."id") AS "rn",
            (("mcwf_1"."acidification" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_acidification",
            (("mcwf_1"."global_warming" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_global_warming",
            (("mcwf_1"."freshwater_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_freshwater_ecotoxicity",
            (("mcwf_1"."marine_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_marine_ecotoxicity",
            (("mcwf_1"."terrestrial_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_terrestrial_ecotoxicity",
            (("mcwf_1"."abiotic_depletion_fossil_fuels" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_abiotic_depletion_fossil_fuels",
            (("mcwf_1"."eutrophication" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_eutrophication",
            (("mcwf_1"."human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_human_toxicity",
            (("mcwf_1"."abiotic_depletion" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_abiotic_depletion",
            (("mcwf_1"."ozone_depletion" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_ozone_depletion",
            (("mcwf_1"."photochemical_ozone_creation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_photochemical_ozone_creation",
            1 AS "is_leaf",
                CASE
                    WHEN "mcwf_1"."is_supplier_specific" THEN 'supplier'::"text"
                    ELSE 'database'::"text"
                END AS "impact_source"
           FROM "public"."cml_material_composition_with_factors" "mcwf_1"
          WHERE (NOT ("mcwf_1"."id" IN ( SELECT DISTINCT "cml_material_composition_with_factors_1"."parent_id"
                   FROM "public"."cml_material_composition_with_factors" "cml_material_composition_with_factors_1"
                  WHERE ("cml_material_composition_with_factors_1"."parent_id" IS NOT NULL))))
        UNION ALL
         SELECT "mcwf_1"."id",
            "mcwf_1"."parent_id",
            "mcwf_1"."acidification",
            "mcwf_1"."global_warming",
            "mcwf_1"."freshwater_ecotoxicity",
            "mcwf_1"."marine_ecotoxicity",
            "mcwf_1"."terrestrial_ecotoxicity",
            "mcwf_1"."abiotic_depletion_fossil_fuels",
            "mcwf_1"."eutrophication",
            "mcwf_1"."human_toxicity",
            "mcwf_1"."abiotic_depletion",
            "mcwf_1"."ozone_depletion",
            "mcwf_1"."photochemical_ozone_creation",
            "mcwf_1"."weight_grams",
            "mcwf_1"."is_supplier_specific",
            "tt"."rn",
            "tt"."total_acidification",
            "tt"."total_global_warming",
            "tt"."total_freshwater_ecotoxicity",
            "tt"."total_marine_ecotoxicity",
            "tt"."total_terrestrial_ecotoxicity",
            "tt"."total_abiotic_depletion_fossil_fuels",
            "tt"."total_eutrophication",
            "tt"."total_human_toxicity",
            "tt"."total_abiotic_depletion",
            "tt"."total_ozone_depletion",
            "tt"."total_photochemical_ozone_creation",
            0 AS "is_leaf",
                CASE
                    WHEN "mcwf_1"."is_supplier_specific" THEN 'supplier'::"text"
                    WHEN (("tt"."impact_source" = 'mixed'::"text") OR ("tt"."impact_source" = 'supplier'::"text")) THEN 'mixed'::"text"
                    WHEN ("tt"."impact_source" IS NULL) THEN "tt"."impact_source"
                    ELSE 'database'::"text"
                END AS "impact_source"
           FROM ("public"."cml_material_composition_with_factors" "mcwf_1"
             JOIN "tree_traversal" "tt" ON (("mcwf_1"."id" = "tt"."parent_id")))
        ), "aggregated_results" AS (
         SELECT "tt"."id",
            "tt"."parent_id",
            "tt"."acidification",
            "tt"."global_warming",
            "tt"."freshwater_ecotoxicity",
            "tt"."marine_ecotoxicity",
            "tt"."terrestrial_ecotoxicity",
            "tt"."abiotic_depletion_fossil_fuels",
            "tt"."eutrophication",
            "tt"."human_toxicity",
            "tt"."abiotic_depletion",
            "tt"."ozone_depletion",
            "tt"."photochemical_ozone_creation",
            "tt"."weight_grams",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."acidification") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_acidification"
                END) AS "total_acidification",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."global_warming") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_global_warming"
                END) AS "total_global_warming",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."freshwater_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_freshwater_ecotoxicity"
                END) AS "total_freshwater_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."marine_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_marine_ecotoxicity"
                END) AS "total_marine_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."terrestrial_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_terrestrial_ecotoxicity"
                END) AS "total_terrestrial_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."abiotic_depletion_fossil_fuels") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_abiotic_depletion_fossil_fuels"
                END) AS "total_abiotic_depletion_fossil_fuels",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."eutrophication") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_eutrophication"
                END) AS "total_eutrophication",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_human_toxicity"
                END) AS "total_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."abiotic_depletion") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_abiotic_depletion"
                END) AS "total_abiotic_depletion",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."ozone_depletion") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_ozone_depletion"
                END) AS "total_ozone_depletion",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."photochemical_ozone_creation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_photochemical_ozone_creation"
                END) AS "total_photochemical_ozone_creation",
            "tt"."is_leaf",
            "tt"."impact_source"
           FROM "tree_traversal" "tt"
          WHERE ("tt"."is_leaf" = 0)
          GROUP BY "tt"."id", "tt"."parent_id", "tt"."acidification", "tt"."global_warming", "tt"."freshwater_ecotoxicity", "tt"."marine_ecotoxicity", "tt"."terrestrial_ecotoxicity", "tt"."abiotic_depletion_fossil_fuels", "tt"."eutrophication", "tt"."human_toxicity", "tt"."abiotic_depletion", "tt"."ozone_depletion", "tt"."photochemical_ozone_creation", "tt"."weight_grams", "tt"."is_leaf", "tt"."is_supplier_specific", "tt"."impact_source"
        ), "combined_results" AS (
         SELECT "tree_traversal"."id",
            "tree_traversal"."parent_id",
            "tree_traversal"."weight_grams",
            "tree_traversal"."total_acidification",
            "tree_traversal"."total_global_warming",
            "tree_traversal"."total_freshwater_ecotoxicity",
            "tree_traversal"."total_marine_ecotoxicity",
            "tree_traversal"."total_terrestrial_ecotoxicity",
            "tree_traversal"."total_abiotic_depletion_fossil_fuels",
            "tree_traversal"."total_eutrophication",
            "tree_traversal"."total_human_toxicity",
            "tree_traversal"."total_abiotic_depletion",
            "tree_traversal"."total_ozone_depletion",
            "tree_traversal"."total_photochemical_ozone_creation",
            "tree_traversal"."is_leaf",
            "tree_traversal"."impact_source"
           FROM "tree_traversal"
          WHERE ("tree_traversal"."is_leaf" = 1)
        UNION ALL
         SELECT "aggregated_results"."id",
            "aggregated_results"."parent_id",
            "aggregated_results"."weight_grams",
            "aggregated_results"."total_acidification",
            "aggregated_results"."total_global_warming",
            "aggregated_results"."total_freshwater_ecotoxicity",
            "aggregated_results"."total_marine_ecotoxicity",
            "aggregated_results"."total_terrestrial_ecotoxicity",
            "aggregated_results"."total_abiotic_depletion_fossil_fuels",
            "aggregated_results"."total_eutrophication",
            "aggregated_results"."total_human_toxicity",
            "aggregated_results"."total_abiotic_depletion",
            "aggregated_results"."total_ozone_depletion",
            "aggregated_results"."total_photochemical_ozone_creation",
            "aggregated_results"."is_leaf",
            "aggregated_results"."impact_source"
           FROM "aggregated_results"
        ), "combined_results_with_priority" AS (
         SELECT "combined_results"."id",
            "combined_results"."parent_id",
            "combined_results"."weight_grams",
            "combined_results"."total_acidification",
            "combined_results"."total_global_warming",
            "combined_results"."total_freshwater_ecotoxicity",
            "combined_results"."total_marine_ecotoxicity",
            "combined_results"."total_terrestrial_ecotoxicity",
            "combined_results"."total_abiotic_depletion_fossil_fuels",
            "combined_results"."total_eutrophication",
            "combined_results"."total_human_toxicity",
            "combined_results"."total_abiotic_depletion",
            "combined_results"."total_ozone_depletion",
            "combined_results"."total_photochemical_ozone_creation",
            "combined_results"."is_leaf",
            "combined_results"."impact_source",
            "row_number"() OVER (PARTITION BY "combined_results"."id" ORDER BY
                CASE "combined_results"."impact_source"
                    WHEN 'supplier'::"text" THEN 1
                    WHEN 'mixed'::"text" THEN 2
                    ELSE 3
                END) AS "priority"
           FROM "combined_results"
        ), "filtered_combined_results" AS (
         SELECT "combined_results_with_priority"."id",
            "combined_results_with_priority"."parent_id",
            "combined_results_with_priority"."weight_grams",
            "combined_results_with_priority"."total_acidification",
            "combined_results_with_priority"."total_global_warming",
            "combined_results_with_priority"."total_freshwater_ecotoxicity",
            "combined_results_with_priority"."total_marine_ecotoxicity",
            "combined_results_with_priority"."total_terrestrial_ecotoxicity",
            "combined_results_with_priority"."total_abiotic_depletion_fossil_fuels",
            "combined_results_with_priority"."total_eutrophication",
            "combined_results_with_priority"."total_human_toxicity",
            "combined_results_with_priority"."total_abiotic_depletion",
            "combined_results_with_priority"."total_ozone_depletion",
            "combined_results_with_priority"."total_photochemical_ozone_creation",
            "combined_results_with_priority"."is_leaf",
            "combined_results_with_priority"."impact_source",
            "combined_results_with_priority"."priority"
           FROM "combined_results_with_priority"
          WHERE ("combined_results_with_priority"."priority" = 1)
        )
 SELECT "mcwf"."id",
    "mcwf"."created_at",
    "mcwf"."weight_grams",
    "mcwf"."org_id",
    "mcwf"."lca_id",
    "mcwf"."level",
    "mcwf"."parent_id",
    "mcwf"."leaf",
    "mcwf"."retake_part_id",
    "mcwf"."customer_part_id",
    "mcwf"."part_description",
    "mcwf"."origin",
    "mcwf"."manufacturing_process",
    "mcwf"."primary_material",
    "mcwf"."is_supplier_specific",
    "mcwf"."supplier_id",
    "mcwf"."factor_id",
    "mcwf"."reference_product_name",
    "mcwf"."activity_name",
    "mcwf"."database_name",
    "fcr"."total_acidification",
    "fcr"."total_global_warming",
    "fcr"."total_freshwater_ecotoxicity",
    "fcr"."total_marine_ecotoxicity",
    "fcr"."total_terrestrial_ecotoxicity",
    "fcr"."total_abiotic_depletion_fossil_fuels",
    "fcr"."total_eutrophication",
    "fcr"."total_human_toxicity",
    "fcr"."total_abiotic_depletion",
    "fcr"."total_ozone_depletion",
    "fcr"."total_photochemical_ozone_creation",
    "fcr"."is_leaf",
    "fcr"."impact_source"
   FROM ("public"."cml_material_composition_with_factors" "mcwf"
     LEFT JOIN "filtered_combined_results" "fcr" ON (("mcwf"."id" = "fcr"."id")));


ALTER TABLE "public"."cml_material_composition_with_impacts" OWNER TO "postgres";

--
-- Name: cml_materials_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."cml_materials_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_eutrophication" numeric,
    "total_ozone_depletion" numeric,
    "total_human_toxicity" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_abiotic_depletion" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_photochemical_ozone_creation" numeric
);


ALTER TABLE "public"."cml_materials_results" OWNER TO "postgres";

--
-- Name: parts_by_supplier; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."parts_by_supplier" AS
 SELECT "p"."retake_part_id",
    "p"."customer_part_id",
    "p"."created_at",
    "p"."part_description",
    "p"."origin",
    "p"."org_id",
    "p"."manufacturing_process",
    "p"."primary_material",
    "p"."is_base_material",
    "supplier_id_arr"."supplier_id"
   FROM ("public"."parts" "p"
     LEFT JOIN LATERAL "unnest"("p"."supplier_ids") WITH ORDINALITY "supplier_id_arr"("supplier_id", "ordinality") ON (true));


ALTER TABLE "public"."parts_by_supplier" OWNER TO "postgres";

--
-- Name: parts_by_supplier_with_factors; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."parts_by_supplier_with_factors" AS
 SELECT "p"."customer_part_id",
    "p"."created_at",
    "p"."part_description",
    "p"."origin",
    "p"."org_id",
    "p"."retake_part_id",
    "p"."manufacturing_process",
    "p"."primary_material",
    "p"."is_base_material",
    "p"."supplier_id",
    "f"."factor_id"
   FROM ("public"."parts_by_supplier" "p"
     LEFT JOIN "public"."parts_third_party_factors" "f" ON (("p"."retake_part_id" = "f"."retake_part_id")));


ALTER TABLE "public"."parts_by_supplier_with_factors" OWNER TO "postgres";

--
-- Name: supplier_product_engagement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."supplier_product_engagement" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "supplier_id" "text",
    "retake_part_id" "text",
    "org_id" "text",
    "fully_completed" boolean DEFAULT false,
    "welcome_completed" boolean DEFAULT false,
    "materials_completed" boolean DEFAULT false,
    "manufacturing_completed" boolean DEFAULT false,
    "organization_name" "text",
    "part_description" "text"
);


ALTER TABLE "public"."supplier_product_engagement" OWNER TO "postgres";

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."suppliers" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text",
    "contacts" "text"[],
    "most_recent_disclosure" timestamp with time zone,
    "org_id" "text",
    "website" "text"
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";

--
-- Name: cml_parts_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_parts_with_impacts" AS
 WITH "parts_suppliers" AS (
         SELECT "p_1"."retake_part_id",
            "s"."id" AS "supplier_id",
            "s"."name" AS "supplier_name",
            COALESCE(( SELECT "suppliers"."contacts"
                   FROM "public"."suppliers"
                  WHERE (("suppliers"."id" = "s"."id") AND ("suppliers"."contacts" IS NOT NULL))), ARRAY[]::"text"[]) AS "supplier_contacts"
           FROM ("public"."parts_by_supplier" "p_1"
             LEFT JOIN "public"."suppliers" "s" ON (("s"."id" = "p_1"."supplier_id")))
          GROUP BY "p_1"."retake_part_id", "s"."id", "s"."name"
        ), "unique_product_supplier_engagement" AS (
         SELECT DISTINCT "supplier_product_engagement"."retake_part_id",
            "supplier_product_engagement"."supplier_id"
           FROM "public"."supplier_product_engagement"
        ), "excluded_material_composition" AS (
         SELECT "material_composition"."retake_part_id"
           FROM "public"."material_composition"
          WHERE ("material_composition"."level" = (1)::numeric)
        )
 SELECT "p"."customer_part_id",
    "p"."created_at",
    "p"."part_description",
    "p"."origin",
    "p"."org_id",
    "p"."supplier_id",
    "p"."retake_part_id",
    "p"."manufacturing_process",
    "p"."factor_id",
    "p"."primary_material",
    "p"."is_base_material",
    "ps"."supplier_name",
    "ps"."supplier_contacts",
        CASE
            WHEN (("rf"."retake_part_id" IS NOT NULL) AND ("rf"."supplier_id" IS NOT NULL)) THEN 'supplier'::"text"
            ELSE 'database'::"text"
        END AS "impact_source",
    COALESCE(
        CASE
            WHEN (("rf"."retake_part_id" IS NOT NULL) AND ("rf"."supplier_id" IS NOT NULL)) THEN 'data_received'::"text"
            WHEN (("upse"."retake_part_id" IS NOT NULL) AND ("upse"."supplier_id" = "p"."supplier_id")) THEN 'awaiting_response'::"text"
            ELSE 'not_engaged'::"text"
        END, 'not_engaged'::"text") AS "supplier_engagement",
    COALESCE("rf"."cml_ac", "f"."cml_ac", (0)::numeric) AS "acidification",
    COALESCE("rf"."cml_g", "f"."cml_g", (0)::numeric) AS "global_warming",
    COALESCE("rf"."cml_f_et", "f"."cml_f_et", (0)::numeric) AS "freshwater_ecotoxicity",
    COALESCE("rf"."cml_m_et", "f"."cml_m_et", (0)::numeric) AS "marine_ecotoxicity",
    COALESCE("rf"."cml_t_et", "f"."cml_t_et", (0)::numeric) AS "terrestrial_ecotoxicity",
    COALESCE("rf"."cml_ad_ff", "f"."cml_ad_ff", (0)::numeric) AS "abiotic_depletion_fossil_fuels",
    COALESCE("rf"."cml_ad", "f"."cml_ad", (0)::numeric) AS "abiotic_depletion",
    COALESCE("rf"."cml_eu", "f"."cml_eu", (0)::numeric) AS "eutrophication",
    COALESCE("rf"."cml_h_et", "f"."cml_h_et", (0)::numeric) AS "human_toxicity",
    COALESCE("rf"."cml_od", "f"."cml_od", (0)::numeric) AS "ozone_depletion",
    COALESCE("rf"."cml_oc", "f"."cml_oc", (0)::numeric) AS "photochemical_ozone_creation",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name"
   FROM (((("public"."parts_by_supplier_with_factors" "p"
     LEFT JOIN "parts_suppliers" "ps" ON ((("p"."retake_part_id" = "ps"."retake_part_id") AND ("p"."supplier_id" = "ps"."supplier_id"))))
     LEFT JOIN "public"."third_party_factors" "f" ON (("p"."factor_id" = "f"."factor_id")))
     LEFT JOIN "public"."retake_factors" "rf" ON ((("p"."retake_part_id" = "rf"."retake_part_id") AND ("p"."supplier_id" = "rf"."supplier_id"))))
     LEFT JOIN "unique_product_supplier_engagement" "upse" ON ((("p"."retake_part_id" = "upse"."retake_part_id") AND ("p"."supplier_id" = "upse"."supplier_id"))))
  WHERE (NOT ("p"."retake_part_id" IN ( SELECT "excluded_material_composition"."retake_part_id"
           FROM "excluded_material_composition")));


ALTER TABLE "public"."cml_parts_with_impacts" OWNER TO "postgres";

--
-- Name: cml_total_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."cml_total_results" (
    "retake_part_id" "text",
    "customer_part_id" "text",
    "part_description" "text",
    "impact_source" "text",
    "materials_completed" boolean,
    "transportation_completed" boolean,
    "manufacturing_completed" boolean,
    "use_phase_completed" boolean,
    "end_of_life_completed" boolean,
    "org_id" "text",
    "weight_grams" numeric,
    "long_description" "text",
    "material_composition_id" "text",
    "lca_id" "uuid" NOT NULL,
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_eutrophication" numeric,
    "total_ozone_depletion" numeric,
    "total_human_toxicity" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_abiotic_depletion" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_photochemical_ozone_creation" numeric
);


ALTER TABLE "public"."cml_total_results" OWNER TO "postgres";

--
-- Name: cml_transportation_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."cml_transportation_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_eutrophication" numeric,
    "total_ozone_depletion" numeric,
    "total_human_toxicity" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_abiotic_depletion" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_photochemical_ozone_creation" numeric
);


ALTER TABLE "public"."cml_transportation_results" OWNER TO "postgres";

--
-- Name: transportation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."transportation" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "origin" "text",
    "destination" "text",
    "distance_km" numeric,
    "transportation_type" "text",
    "org_id" "text",
    "lca_id" "uuid",
    "factor_id" "uuid",
    "material_composition_id" "uuid" NOT NULL
);


ALTER TABLE "public"."transportation" OWNER TO "postgres";

--
-- Name: cml_transportation_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_transportation_with_impacts" AS
 SELECT "t"."id",
    "t"."created_at",
    "t"."origin",
    "t"."destination",
    "t"."distance_km",
    "t"."transportation_type",
    "t"."org_id",
    "t"."lca_id",
    "t"."factor_id",
    "t"."material_composition_id",
    "m"."weight_grams",
    "p"."customer_part_id",
    "p"."part_description",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ((("f"."cml_ac" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_acidification",
    ((("f"."cml_g" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_global_warming",
    ((("f"."cml_f_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_freshwater_ecotoxicity",
    ((("f"."cml_m_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_marine_ecotoxicity",
    ((("f"."cml_t_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_terrestrial_ecotoxicity",
    ((("f"."cml_ad_ff" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_abiotic_depletion_fossil_fuels",
    ((("f"."cml_eu" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_eutrophication",
    ((("f"."cml_h_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_human_toxicity",
    ((("f"."cml_ad" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_abiotic_depletion",
    ((("f"."cml_od" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_ozone_depletion",
    ((("f"."cml_oc" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_photochemical_ozone_creation"
   FROM ((("public"."transportation" "t"
     LEFT JOIN "public"."material_composition" "m" ON (("t"."material_composition_id" = "m"."id")))
     LEFT JOIN "public"."parts" "p" ON (("m"."retake_part_id" = "p"."retake_part_id")))
     LEFT JOIN "public"."third_party_factors" "f" ON (("t"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."cml_transportation_with_impacts" OWNER TO "postgres";

--
-- Name: cml_use_phase_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."cml_use_phase_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_eutrophication" numeric,
    "total_ozone_depletion" numeric,
    "total_human_toxicity" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_abiotic_depletion" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_photochemical_ozone_creation" numeric
);


ALTER TABLE "public"."cml_use_phase_results" OWNER TO "postgres";

--
-- Name: service_life; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."service_life" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "quantity" numeric,
    "unit" "text",
    "has_use_phase" boolean
);


ALTER TABLE "public"."service_life" OWNER TO "postgres";

--
-- Name: use_phase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."use_phase" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "text",
    "lca_id" "uuid",
    "quantity" numeric,
    "location" "text" DEFAULT 'Global'::"text",
    "percent_at_location" numeric DEFAULT '100'::numeric,
    "factor_id" "uuid",
    "use_type" "public"."use_type_enum"
);


ALTER TABLE "public"."use_phase" OWNER TO "postgres";

--
-- Name: cml_use_phase_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."cml_use_phase_with_impacts" AS
 SELECT "up"."id",
    "up"."org_id",
    "up"."lca_id",
    "up"."quantity",
    "up"."location",
    "up"."percent_at_location",
    "up"."factor_id",
    "up"."use_type",
    "s"."has_use_phase",
    "f"."reference_product_name",
    "f"."database_name",
    "f"."activity_name",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_ac" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_acidification",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_g" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_global_warming",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_f_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_freshwater_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_m_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_marine_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_t_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_terrestrial_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_ad_ff" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_abiotic_depletion_fossil_fuels",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_eu" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_eutrophication",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_h_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_ad" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_abiotic_depletion",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_od" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_ozone_depletion",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."cml_oc" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_photochemical_ozone_creation"
   FROM (("public"."use_phase" "up"
     JOIN "public"."third_party_factors" "f" ON (("f"."factor_id" = "up"."factor_id")))
     JOIN "public"."service_life" "s" ON (("s"."lca_id" = "up"."lca_id")));


ALTER TABLE "public"."cml_use_phase_with_impacts" OWNER TO "postgres";

--
-- Name: ef_end_of_life_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."ef_end_of_life_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_acidification" numeric,
    "total_global_warming" numeric,
    "total_biogenic_global_warming" numeric,
    "total_fossil_fuel_global_warming" numeric,
    "total_land_use_global_warming" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_freshwater_inorganics_ecotoxicity" numeric,
    "total_freshwater_organics_ecotoxicity" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_terrestrial_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_carcinogenic_inorganics_human_toxicity" numeric,
    "total_carcinogenic_organics_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_inorganics_human_toxicity" numeric,
    "total_non_carcinogenic_organics_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_abiotic_depletion" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."ef_end_of_life_results" OWNER TO "postgres";

--
-- Name: ef_end_of_life_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_end_of_life_with_impacts" AS
 SELECT "eol"."id",
    "eol"."created_at",
    "eol"."org_id",
    "eol"."lca_id",
    "eol"."description",
    "eol"."weight_grams",
    "eol"."location",
    "eol"."factor_id",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    (("f"."ef_ac" * "eol"."weight_grams") / (1000)::numeric) AS "total_acidification",
    (("f"."ef_g" * "eol"."weight_grams") / (1000)::numeric) AS "total_global_warming",
    (("f"."ef_b_g" * "eol"."weight_grams") / (1000)::numeric) AS "total_biogenic_global_warming",
    (("f"."ef_ff_g" * "eol"."weight_grams") / (1000)::numeric) AS "total_fossil_fuel_global_warming",
    (("f"."ef_l_g" * "eol"."weight_grams") / (1000)::numeric) AS "total_land_use_global_warming",
    (("f"."ef_f_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_freshwater_ecotoxicity",
    (("f"."ef_f_i_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_freshwater_inorganics_ecotoxicity",
    (("f"."ef_f_o_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_freshwater_organics_ecotoxicity",
    (("f"."ef_ad_ff" * "eol"."weight_grams") / (1000)::numeric) AS "total_abiotic_depletion_fossil_fuels",
    (("f"."ef_f_eu" * "eol"."weight_grams") / (1000)::numeric) AS "total_freshwater_eutrophication",
    (("f"."ef_m_eu" * "eol"."weight_grams") / (1000)::numeric) AS "total_marine_eutrophication",
    (("f"."ef_t_eu" * "eol"."weight_grams") / (1000)::numeric) AS "total_terrestrial_eutrophication",
    (("f"."ef_cht" * "eol"."weight_grams") / (1000)::numeric) AS "total_carcinogenic_human_toxicity",
    (("f"."ef_ciht" * "eol"."weight_grams") / (1000)::numeric) AS "total_carcinogenic_inorganics_human_toxicity",
    (("f"."ef_coht" * "eol"."weight_grams") / (1000)::numeric) AS "total_carcinogenic_organics_human_toxicity",
    (("f"."ef_ncht" * "eol"."weight_grams") / (1000)::numeric) AS "total_non_carcinogenic_human_toxicity",
    (("f"."ef_nciht" * "eol"."weight_grams") / (1000)::numeric) AS "total_non_carcinogenic_inorganics_human_toxicity",
    (("f"."ef_ncoht" * "eol"."weight_grams") / (1000)::numeric) AS "total_non_carcinogenic_organics_human_toxicity",
    (("f"."ef_ir" * "eol"."weight_grams") / (1000)::numeric) AS "total_ionizing_radiation",
    (("f"."ef_l" * "eol"."weight_grams") / (1000)::numeric) AS "total_land_use",
    (("f"."ef_ad" * "eol"."weight_grams") / (1000)::numeric) AS "total_abiotic_depletion",
    (("f"."ef_od" * "eol"."weight_grams") / (1000)::numeric) AS "total_ozone_depletion",
    (("f"."ef_pm" * "eol"."weight_grams") / (1000)::numeric) AS "total_particulate_matter_formation",
    (("f"."ef_hh_oc" * "eol"."weight_grams") / (1000)::numeric) AS "total_ef_human_health_photochemical_ozone_creation",
    (("f"."ef_w" * "eol"."weight_grams") / (1000)::numeric) AS "total_water_use"
   FROM ("public"."end_of_life" "eol"
     LEFT JOIN "public"."third_party_factors" "f" ON (("eol"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."ef_end_of_life_with_impacts" OWNER TO "postgres";

--
-- Name: ef_purchased_energy_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_purchased_energy_with_impacts" AS
 SELECT "pe"."id",
    "pe"."created_at",
    "pe"."description",
    "pe"."quantity_kwh",
    "pe"."facility_id",
    "pe"."org_id",
    "pe"."percent_renewable",
    "pe"."year",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ("f"."ef_ac" * "pe"."quantity_kwh") AS "total_acidification",
    ("f"."ef_g" * "pe"."quantity_kwh") AS "total_global_warming",
    ("f"."ef_b_g" * "pe"."quantity_kwh") AS "total_biogenic_global_warming",
    ("f"."ef_ff_g" * "pe"."quantity_kwh") AS "total_fossil_fuel_global_warming",
    ("f"."ef_l_g" * "pe"."quantity_kwh") AS "total_land_use_global_warming",
    ("f"."ef_f_et" * "pe"."quantity_kwh") AS "total_freshwater_ecotoxicity",
    ("f"."ef_f_i_et" * "pe"."quantity_kwh") AS "total_freshwater_inorganics_ecotoxicity",
    ("f"."ef_f_o_et" * "pe"."quantity_kwh") AS "total_freshwater_organics_ecotoxicity",
    ("f"."ef_ad_ff" * "pe"."quantity_kwh") AS "total_abiotic_depletion_fossil_fuels",
    ("f"."ef_f_eu" * "pe"."quantity_kwh") AS "total_freshwater_eutrophication",
    ("f"."ef_m_eu" * "pe"."quantity_kwh") AS "total_marine_eutrophication",
    ("f"."ef_t_eu" * "pe"."quantity_kwh") AS "total_terrestrial_eutrophication",
    ("f"."ef_cht" * "pe"."quantity_kwh") AS "total_carcinogenic_human_toxicity",
    ("f"."ef_ciht" * "pe"."quantity_kwh") AS "total_carcinogenic_inorganics_human_toxicity",
    ("f"."ef_coht" * "pe"."quantity_kwh") AS "total_carcinogenic_organics_human_toxicity",
    ("f"."ef_ncht" * "pe"."quantity_kwh") AS "total_non_carcinogenic_human_toxicity",
    ("f"."ef_nciht" * "pe"."quantity_kwh") AS "total_non_carcinogenic_inorganics_human_toxicity",
    ("f"."ef_ncoht" * "pe"."quantity_kwh") AS "total_non_carcinogenic_organics_human_toxicity",
    ("f"."ef_ir" * "pe"."quantity_kwh") AS "total_ionizing_radiation",
    ("f"."ef_l" * "pe"."quantity_kwh") AS "total_land_use",
    ("f"."ef_ad" * "pe"."quantity_kwh") AS "total_abiotic_depletion",
    ("f"."ef_od" * "pe"."quantity_kwh") AS "total_ozone_depletion",
    ("f"."ef_pm" * "pe"."quantity_kwh") AS "total_particulate_matter_formation",
    ("f"."ef_hh_oc" * "pe"."quantity_kwh") AS "total_ef_human_health_photochemical_ozone_creation",
    ("f"."ef_w" * "pe"."quantity_kwh") AS "total_water_use"
   FROM ("public"."purchased_energy" "pe"
     LEFT JOIN "public"."third_party_factors" "f" ON (("pe"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."ef_purchased_energy_with_impacts" OWNER TO "postgres";

--
-- Name: ef_stationary_fuel_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_stationary_fuel_with_impacts" AS
 SELECT "sf"."id",
    "sf"."facility_id",
    "sf"."year",
    "sf"."description",
    "sf"."quantity_mj",
    "sf"."org_id",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ("f"."ef_ac" * "sf"."quantity_mj") AS "total_acidification",
    ("f"."ef_g" * "sf"."quantity_mj") AS "total_global_warming",
    ("f"."ef_b_g" * "sf"."quantity_mj") AS "total_biogenic_global_warming",
    ("f"."ef_ff_g" * "sf"."quantity_mj") AS "total_fossil_fuel_global_warming",
    ("f"."ef_l_g" * "sf"."quantity_mj") AS "total_land_use_global_warming",
    ("f"."ef_f_et" * "sf"."quantity_mj") AS "total_freshwater_ecotoxicity",
    ("f"."ef_f_i_et" * "sf"."quantity_mj") AS "total_freshwater_inorganics_ecotoxicity",
    ("f"."ef_f_o_et" * "sf"."quantity_mj") AS "total_freshwater_organics_ecotoxicity",
    ("f"."ef_ad_ff" * "sf"."quantity_mj") AS "total_abiotic_depletion_fossil_fuels",
    ("f"."ef_f_eu" * "sf"."quantity_mj") AS "total_freshwater_eutrophication",
    ("f"."ef_m_eu" * "sf"."quantity_mj") AS "total_marine_eutrophication",
    ("f"."ef_t_eu" * "sf"."quantity_mj") AS "total_terrestrial_eutrophication",
    ("f"."ef_cht" * "sf"."quantity_mj") AS "total_carcinogenic_human_toxicity",
    ("f"."ef_ciht" * "sf"."quantity_mj") AS "total_carcinogenic_inorganics_human_toxicity",
    ("f"."ef_coht" * "sf"."quantity_mj") AS "total_carcinogenic_organics_human_toxicity",
    ("f"."ef_ncht" * "sf"."quantity_mj") AS "total_non_carcinogenic_human_toxicity",
    ("f"."ef_nciht" * "sf"."quantity_mj") AS "total_non_carcinogenic_inorganics_human_toxicity",
    ("f"."ef_ncoht" * "sf"."quantity_mj") AS "total_non_carcinogenic_organics_human_toxicity",
    ("f"."ef_ir" * "sf"."quantity_mj") AS "total_ionizing_radiation",
    ("f"."ef_l" * "sf"."quantity_mj") AS "total_land_use",
    ("f"."ef_ad" * "sf"."quantity_mj") AS "total_abiotic_depletion",
    ("f"."ef_od" * "sf"."quantity_mj") AS "total_ozone_depletion",
    ("f"."ef_pm" * "sf"."quantity_mj") AS "total_particulate_matter_formation",
    ("f"."ef_hh_oc" * "sf"."quantity_mj") AS "total_ef_human_health_photochemical_ozone_creation",
    ("f"."ef_w" * "sf"."quantity_mj") AS "total_water_use"
   FROM ("public"."stationary_fuel" "sf"
     LEFT JOIN "public"."third_party_factors" "f" ON (("sf"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."ef_stationary_fuel_with_impacts" OWNER TO "postgres";

--
-- Name: ef_facility_energy_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_facility_energy_with_impacts" AS
 SELECT "f"."org_id",
    "f"."name",
    "f"."location",
    "f"."created_at",
    "f"."id",
    "pe"."quantity_kwh",
    "pe"."percent_renewable",
    "sf"."quantity_mj",
    ("pe"."total_acidification" + "sf"."total_acidification") AS "total_acidification",
    ("pe"."total_global_warming" + "sf"."total_global_warming") AS "total_global_warming",
    ("pe"."total_biogenic_global_warming" + "sf"."total_biogenic_global_warming") AS "total_biogenic_global_warming",
    ("pe"."total_fossil_fuel_global_warming" + "sf"."total_fossil_fuel_global_warming") AS "total_fossil_fuel_global_warming",
    ("pe"."total_land_use_global_warming" + "sf"."total_land_use_global_warming") AS "total_land_use_global_warming",
    ("pe"."total_freshwater_ecotoxicity" + "sf"."total_freshwater_ecotoxicity") AS "total_freshwater_ecotoxicity",
    ("pe"."total_freshwater_inorganics_ecotoxicity" + "sf"."total_freshwater_inorganics_ecotoxicity") AS "total_freshwater_inorganics_ecotoxicity",
    ("pe"."total_freshwater_organics_ecotoxicity" + "sf"."total_freshwater_organics_ecotoxicity") AS "total_freshwater_organics_ecotoxicity",
    ("pe"."total_abiotic_depletion_fossil_fuels" + "sf"."total_abiotic_depletion_fossil_fuels") AS "total_abiotic_depletion_fossil_fuels",
    ("pe"."total_freshwater_eutrophication" + "sf"."total_freshwater_eutrophication") AS "total_freshwater_eutrophication",
    ("pe"."total_marine_eutrophication" + "sf"."total_marine_eutrophication") AS "total_marine_eutrophication",
    ("pe"."total_terrestrial_eutrophication" + "sf"."total_terrestrial_eutrophication") AS "total_terrestrial_eutrophication",
    ("pe"."total_carcinogenic_human_toxicity" + "sf"."total_carcinogenic_human_toxicity") AS "total_carcinogenic_human_toxicity",
    ("pe"."total_carcinogenic_inorganics_human_toxicity" + "sf"."total_carcinogenic_inorganics_human_toxicity") AS "total_carcinogenic_inorganics_human_toxicity",
    ("pe"."total_carcinogenic_organics_human_toxicity" + "sf"."total_carcinogenic_organics_human_toxicity") AS "total_carcinogenic_organics_human_toxicity",
    ("pe"."total_non_carcinogenic_human_toxicity" + "sf"."total_non_carcinogenic_human_toxicity") AS "total_non_carcinogenic_human_toxicity",
    ("pe"."total_non_carcinogenic_inorganics_human_toxicity" + "sf"."total_non_carcinogenic_inorganics_human_toxicity") AS "total_non_carcinogenic_inorganics_human_toxicity",
    ("pe"."total_non_carcinogenic_organics_human_toxicity" + "sf"."total_non_carcinogenic_organics_human_toxicity") AS "total_non_carcinogenic_organics_human_toxicity",
    ("pe"."total_ionizing_radiation" + "sf"."total_ionizing_radiation") AS "total_ionizing_radiation",
    ("pe"."total_land_use" + "sf"."total_land_use") AS "total_land_use",
    ("pe"."total_abiotic_depletion" + "sf"."total_abiotic_depletion") AS "total_abiotic_depletion",
    ("pe"."total_ozone_depletion" + "sf"."total_ozone_depletion") AS "total_ozone_depletion",
    ("pe"."total_particulate_matter_formation" + "sf"."total_particulate_matter_formation") AS "total_particulate_matter_formation",
    ("pe"."total_ef_human_health_photochemical_ozone_creation" + "sf"."total_ef_human_health_photochemical_ozone_creation") AS "total_ef_human_health_photochemical_ozone_creation",
    ("pe"."total_water_use" + "sf"."total_water_use") AS "total_water_use"
   FROM (("public"."facilities" "f"
     LEFT JOIN "public"."ef_purchased_energy_with_impacts" "pe" ON ((("f"."id" = "pe"."facility_id") AND ("pe"."year" = (EXTRACT(year FROM CURRENT_DATE) - (1)::numeric)))))
     LEFT JOIN "public"."ef_stationary_fuel_with_impacts" "sf" ON ((("f"."id" = "sf"."facility_id") AND ("sf"."year" = (EXTRACT(year FROM CURRENT_DATE) - (1)::numeric)))));


ALTER TABLE "public"."ef_facility_energy_with_impacts" OWNER TO "postgres";

--
-- Name: ef_facility_allocation_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_facility_allocation_with_impacts" AS
 SELECT "fa"."id",
    "fa"."created_at",
    "fa"."facility_id",
    "fa"."percent_revenue",
    "fa"."quantity_produced",
    "fa"."lca_id",
    "fa"."org_id",
    "f"."name",
    "f"."location",
    "f"."percent_renewable",
    ((("f"."quantity_mj" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "quantity_mj",
    ((("f"."quantity_kwh" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "quantity_kwh",
    ((("f"."total_acidification" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_acidification",
    ((("f"."total_global_warming" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_global_warming",
    ((("f"."total_biogenic_global_warming" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_biogenic_global_warming",
    ((("f"."total_fossil_fuel_global_warming" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_fossil_fuel_global_warming",
    ((("f"."total_land_use_global_warming" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_land_use_global_warming",
    ((("f"."total_freshwater_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_freshwater_ecotoxicity",
    ((("f"."total_freshwater_inorganics_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_freshwater_inorganics_ecotoxicity",
    ((("f"."total_freshwater_organics_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_freshwater_organics_ecotoxicity",
    ((("f"."total_abiotic_depletion_fossil_fuels" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_abiotic_depletion_fossil_fuels",
    ((("f"."total_freshwater_eutrophication" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_freshwater_eutrophication",
    ((("f"."total_marine_eutrophication" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_marine_eutrophication",
    ((("f"."total_terrestrial_eutrophication" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_terrestrial_eutrophication",
    ((("f"."total_carcinogenic_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_carcinogenic_human_toxicity",
    ((("f"."total_carcinogenic_inorganics_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_carcinogenic_inorganics_human_toxicity",
    ((("f"."total_carcinogenic_organics_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_carcinogenic_organics_human_toxicity",
    ((("f"."total_non_carcinogenic_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_non_carcinogenic_human_toxicity",
    ((("f"."total_non_carcinogenic_inorganics_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_non_carcinogenic_inorganics_human_toxicity",
    ((("f"."total_non_carcinogenic_organics_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_non_carcinogenic_organics_human_toxicity",
    ((("f"."total_ionizing_radiation" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_ionizing_radiation",
    ((("f"."total_land_use" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_land_use",
    ((("f"."total_abiotic_depletion" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_abiotic_depletion",
    ((("f"."total_ozone_depletion" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_ozone_depletion",
    ((("f"."total_particulate_matter_formation" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_particulate_matter_formation",
    ((("f"."total_ef_human_health_photochemical_ozone_creation" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_ef_human_health_photochemical_ozone_creation",
    ((("f"."total_water_use" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_water_use"
   FROM ("public"."ef_facility_energy_with_impacts" "f"
     JOIN "public"."facility_allocation" "fa" ON (("f"."id" = "fa"."facility_id")));


ALTER TABLE "public"."ef_facility_allocation_with_impacts" OWNER TO "postgres";

--
-- Name: ef_manufacturing_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."ef_manufacturing_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_acidification" numeric,
    "total_global_warming" numeric,
    "total_biogenic_global_warming" numeric,
    "total_fossil_fuel_global_warming" numeric,
    "total_land_use_global_warming" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_freshwater_inorganics_ecotoxicity" numeric,
    "total_freshwater_organics_ecotoxicity" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_terrestrial_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_carcinogenic_inorganics_human_toxicity" numeric,
    "total_carcinogenic_organics_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_inorganics_human_toxicity" numeric,
    "total_non_carcinogenic_organics_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_abiotic_depletion" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."ef_manufacturing_results" OWNER TO "postgres";

--
-- Name: ef_material_composition_with_factors; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_material_composition_with_factors" AS
 SELECT "material_composition"."id",
    "material_composition"."created_at",
    "material_composition"."weight_grams",
    "material_composition"."org_id",
    "material_composition"."lca_id",
    "material_composition"."level",
    "material_composition"."parent_id",
    "material_composition"."leaf",
    "material_composition"."retake_part_id",
    "material_composition"."supplier_id",
    "parts"."customer_part_id",
    "parts"."part_description",
    "parts"."origin",
    "parts"."manufacturing_process",
    "parts"."primary_material",
    "factors"."factor_id",
    "factors"."reference_product_name",
    "factors"."activity_name",
    "factors"."database_name",
    COALESCE(("retake_factors"."ef_ac")::double precision, ("factors"."ef_ac")::double precision, (0)::double precision) AS "acidification",
    COALESCE(("retake_factors"."ef_g")::double precision, ("factors"."ef_g")::double precision, (0)::double precision) AS "global_warming",
    COALESCE(("retake_factors"."ef_b_g")::double precision, ("factors"."ef_b_g")::double precision, (0)::double precision) AS "biogenic_global_warming",
    COALESCE(("retake_factors"."ef_ff_g")::double precision, ("factors"."ef_ff_g")::double precision, (0)::double precision) AS "fossil_fuel_global_warming",
    COALESCE(("retake_factors"."ef_l_g")::double precision, ("factors"."ef_l_g")::double precision, (0)::double precision) AS "land_use_global_warming",
    COALESCE(("retake_factors"."ef_f_et")::double precision, ("factors"."ef_f_et")::double precision, (0)::double precision) AS "freshwater_ecotoxicity",
    COALESCE(("retake_factors"."ef_f_i_et")::double precision, ("factors"."ef_f_i_et")::double precision, (0)::double precision) AS "freshwater_inorganics_ecotoxicity",
    COALESCE(("retake_factors"."ef_f_o_et")::double precision, ("factors"."ef_f_o_et")::double precision, (0)::double precision) AS "freshwater_organics_ecotoxicity",
    COALESCE(("retake_factors"."ef_ad_ff")::double precision, ("factors"."ef_ad_ff")::double precision, (0)::double precision) AS "abiotic_depletion_fossil_fuels",
    COALESCE(("retake_factors"."ef_f_eu")::double precision, ("factors"."ef_f_eu")::double precision, (0)::double precision) AS "freshwater_eutrophication",
    COALESCE(("retake_factors"."ef_m_eu")::double precision, ("factors"."ef_m_eu")::double precision, (0)::double precision) AS "marine_eutrophication",
    COALESCE(("retake_factors"."ef_t_eu")::double precision, ("factors"."ef_t_eu")::double precision, (0)::double precision) AS "terrestrial_eutrophication",
    COALESCE(("retake_factors"."ef_cht")::double precision, ("factors"."ef_cht")::double precision, (0)::double precision) AS "carcinogenic_human_toxicity",
    COALESCE(("retake_factors"."ef_ciht")::double precision, ("factors"."ef_ciht")::double precision, (0)::double precision) AS "carcinogenic_inorganics_human_toxicity",
    COALESCE(("retake_factors"."ef_coht")::double precision, ("factors"."ef_coht")::double precision, (0)::double precision) AS "carcinogenic_organics_human_toxicity",
    COALESCE(("retake_factors"."ef_ncht")::double precision, ("factors"."ef_ncht")::double precision, (0)::double precision) AS "non_carcinogenic_human_toxicity",
    COALESCE(("retake_factors"."ef_nciht")::double precision, ("factors"."ef_nciht")::double precision, (0)::double precision) AS "non_carcinogenic_inorganics_human_toxicity",
    COALESCE(("retake_factors"."ef_ncoht")::double precision, ("factors"."ef_ncoht")::double precision, (0)::double precision) AS "non_carcinogenic_organics_human_toxicity",
    COALESCE(("retake_factors"."ef_ir")::double precision, ("factors"."ef_ir")::double precision, (0)::double precision) AS "ionizing_radiation",
    COALESCE(("retake_factors"."ef_l")::double precision, ("factors"."ef_l")::double precision, (0)::double precision) AS "land_use",
    COALESCE(("retake_factors"."ef_ad")::double precision, ("factors"."ef_ad")::double precision, (0)::double precision) AS "abiotic_depletion",
    COALESCE(("retake_factors"."ef_od")::double precision, ("factors"."ef_od")::double precision, (0)::double precision) AS "ozone_depletion",
    COALESCE(("retake_factors"."ef_pm")::double precision, ("factors"."ef_pm")::double precision, (0)::double precision) AS "particulate_matter_formation",
    COALESCE(("retake_factors"."ef_hh_oc")::double precision, ("factors"."ef_hh_oc")::double precision, (0)::double precision) AS "human_health_photochemical_ozone_creation",
    COALESCE(("retake_factors"."ef_w")::double precision, ("factors"."ef_w")::double precision, (0)::double precision) AS "water_use",
        CASE
            WHEN ("retake_factors"."retake_part_id" IS NOT NULL) THEN true
            ELSE false
        END AS "is_supplier_specific"
   FROM ((("public"."material_composition"
     LEFT JOIN "public"."parts_with_factors" "parts" ON (("material_composition"."retake_part_id" = "parts"."retake_part_id")))
     LEFT JOIN "public"."third_party_factors" "factors" ON (("parts"."factor_id" = "factors"."factor_id")))
     LEFT JOIN "public"."retake_factors" ON ((("material_composition"."retake_part_id" = "retake_factors"."retake_part_id") AND ("material_composition"."supplier_id" = "retake_factors"."supplier_id"))));


ALTER TABLE "public"."ef_material_composition_with_factors" OWNER TO "postgres";

--
-- Name: ef_material_composition_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_material_composition_with_impacts" AS
 WITH RECURSIVE "tree_traversal" AS (
         SELECT "mcwf_1"."id",
            "mcwf_1"."parent_id",
            "mcwf_1"."acidification",
            "mcwf_1"."global_warming",
            "mcwf_1"."biogenic_global_warming",
            "mcwf_1"."fossil_fuel_global_warming",
            "mcwf_1"."land_use_global_warming",
            "mcwf_1"."freshwater_ecotoxicity",
            "mcwf_1"."freshwater_inorganics_ecotoxicity",
            "mcwf_1"."freshwater_organics_ecotoxicity",
            "mcwf_1"."abiotic_depletion_fossil_fuels",
            "mcwf_1"."freshwater_eutrophication",
            "mcwf_1"."marine_eutrophication",
            "mcwf_1"."terrestrial_eutrophication",
            "mcwf_1"."carcinogenic_human_toxicity",
            "mcwf_1"."carcinogenic_inorganics_human_toxicity",
            "mcwf_1"."carcinogenic_organics_human_toxicity",
            "mcwf_1"."non_carcinogenic_human_toxicity",
            "mcwf_1"."non_carcinogenic_inorganics_human_toxicity",
            "mcwf_1"."non_carcinogenic_organics_human_toxicity",
            "mcwf_1"."ionizing_radiation",
            "mcwf_1"."land_use",
            "mcwf_1"."abiotic_depletion",
            "mcwf_1"."ozone_depletion",
            "mcwf_1"."particulate_matter_formation",
            "mcwf_1"."human_health_photochemical_ozone_creation",
            "mcwf_1"."water_use",
            "mcwf_1"."weight_grams",
            "mcwf_1"."is_supplier_specific",
            "row_number"() OVER (PARTITION BY "mcwf_1"."parent_id", "mcwf_1"."is_supplier_specific" ORDER BY "mcwf_1"."id") AS "rn",
            (("mcwf_1"."acidification" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_acidification",
            (("mcwf_1"."global_warming" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_global_warming",
            (("mcwf_1"."biogenic_global_warming" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_biogenic_global_warming",
            (("mcwf_1"."fossil_fuel_global_warming" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_fossil_fuel_global_warming",
            (("mcwf_1"."land_use_global_warming" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_land_use_global_warming",
            (("mcwf_1"."freshwater_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_freshwater_ecotoxicity",
            (("mcwf_1"."freshwater_inorganics_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_freshwater_inorganics_ecotoxicity",
            (("mcwf_1"."freshwater_organics_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_freshwater_organics_ecotoxicity",
            (("mcwf_1"."abiotic_depletion_fossil_fuels" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_abiotic_depletion_fossil_fuels",
            (("mcwf_1"."freshwater_eutrophication" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_freshwater_eutrophication",
            (("mcwf_1"."marine_eutrophication" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_marine_eutrophication",
            (("mcwf_1"."terrestrial_eutrophication" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_terrestrial_eutrophication",
            (("mcwf_1"."carcinogenic_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_carcinogenic_human_toxicity",
            (("mcwf_1"."carcinogenic_inorganics_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_carcinogenic_inorganics_human_toxicity",
            (("mcwf_1"."carcinogenic_organics_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_carcinogenic_organics_human_toxicity",
            (("mcwf_1"."non_carcinogenic_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_non_carcinogenic_human_toxicity",
            (("mcwf_1"."non_carcinogenic_inorganics_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_non_carcinogenic_inorganics_human_toxicity",
            (("mcwf_1"."non_carcinogenic_organics_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_non_carcinogenic_organics_human_toxicity",
            (("mcwf_1"."ionizing_radiation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_ionizing_radiation",
            (("mcwf_1"."land_use" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_land_use",
            (("mcwf_1"."abiotic_depletion" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_abiotic_depletion",
            (("mcwf_1"."ozone_depletion" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_ozone_depletion",
            (("mcwf_1"."particulate_matter_formation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_particulate_matter_formation",
            (("mcwf_1"."human_health_photochemical_ozone_creation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_human_health_photochemical_ozone_creation",
            (("mcwf_1"."water_use" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_water_use",
            1 AS "is_leaf",
                CASE
                    WHEN "mcwf_1"."is_supplier_specific" THEN 'supplier'::"text"
                    ELSE 'database'::"text"
                END AS "impact_source"
           FROM "public"."ef_material_composition_with_factors" "mcwf_1"
          WHERE (NOT ("mcwf_1"."id" IN ( SELECT DISTINCT "ef_material_composition_with_factors_1"."parent_id"
                   FROM "public"."ef_material_composition_with_factors" "ef_material_composition_with_factors_1"
                  WHERE ("ef_material_composition_with_factors_1"."parent_id" IS NOT NULL))))
        UNION ALL
         SELECT "mcwf_1"."id",
            "mcwf_1"."parent_id",
            "mcwf_1"."acidification",
            "mcwf_1"."global_warming",
            "mcwf_1"."biogenic_global_warming",
            "mcwf_1"."fossil_fuel_global_warming",
            "mcwf_1"."land_use_global_warming",
            "mcwf_1"."freshwater_ecotoxicity",
            "mcwf_1"."freshwater_inorganics_ecotoxicity",
            "mcwf_1"."freshwater_organics_ecotoxicity",
            "mcwf_1"."abiotic_depletion_fossil_fuels",
            "mcwf_1"."freshwater_eutrophication",
            "mcwf_1"."marine_eutrophication",
            "mcwf_1"."terrestrial_eutrophication",
            "mcwf_1"."carcinogenic_human_toxicity",
            "mcwf_1"."carcinogenic_inorganics_human_toxicity",
            "mcwf_1"."carcinogenic_organics_human_toxicity",
            "mcwf_1"."non_carcinogenic_human_toxicity",
            "mcwf_1"."non_carcinogenic_inorganics_human_toxicity",
            "mcwf_1"."non_carcinogenic_organics_human_toxicity",
            "mcwf_1"."ionizing_radiation",
            "mcwf_1"."land_use",
            "mcwf_1"."abiotic_depletion",
            "mcwf_1"."ozone_depletion",
            "mcwf_1"."particulate_matter_formation",
            "mcwf_1"."human_health_photochemical_ozone_creation",
            "mcwf_1"."water_use",
            "mcwf_1"."weight_grams",
            "mcwf_1"."is_supplier_specific",
            "tt"."rn",
            "tt"."total_acidification",
            "tt"."total_global_warming",
            "tt"."total_biogenic_global_warming",
            "tt"."total_fossil_fuel_global_warming",
            "tt"."total_land_use_global_warming",
            "tt"."total_freshwater_ecotoxicity",
            "tt"."total_freshwater_inorganics_ecotoxicity",
            "tt"."total_freshwater_organics_ecotoxicity",
            "tt"."total_abiotic_depletion_fossil_fuels",
            "tt"."total_freshwater_eutrophication",
            "tt"."total_marine_eutrophication",
            "tt"."total_terrestrial_eutrophication",
            "tt"."total_carcinogenic_human_toxicity",
            "tt"."total_carcinogenic_inorganics_human_toxicity",
            "tt"."total_carcinogenic_organics_human_toxicity",
            "tt"."total_non_carcinogenic_human_toxicity",
            "tt"."total_non_carcinogenic_inorganics_human_toxicity",
            "tt"."total_non_carcinogenic_organics_human_toxicity",
            "tt"."total_ionizing_radiation",
            "tt"."total_land_use",
            "tt"."total_abiotic_depletion",
            "tt"."total_ozone_depletion",
            "tt"."total_particulate_matter_formation",
            "tt"."total_human_health_photochemical_ozone_creation",
            "tt"."total_water_use",
            0 AS "is_leaf",
                CASE
                    WHEN "mcwf_1"."is_supplier_specific" THEN 'supplier'::"text"
                    WHEN (("tt"."impact_source" = 'mixed'::"text") OR ("tt"."impact_source" = 'supplier'::"text")) THEN 'mixed'::"text"
                    WHEN ("tt"."impact_source" IS NULL) THEN "tt"."impact_source"
                    ELSE 'database'::"text"
                END AS "impact_source"
           FROM ("public"."ef_material_composition_with_factors" "mcwf_1"
             JOIN "tree_traversal" "tt" ON (("mcwf_1"."id" = "tt"."parent_id")))
        ), "aggregated_results" AS (
         SELECT "tt"."id",
            "tt"."parent_id",
            "tt"."acidification",
            "tt"."global_warming",
            "tt"."biogenic_global_warming",
            "tt"."fossil_fuel_global_warming",
            "tt"."land_use_global_warming",
            "tt"."freshwater_ecotoxicity",
            "tt"."freshwater_inorganics_ecotoxicity",
            "tt"."freshwater_organics_ecotoxicity",
            "tt"."abiotic_depletion_fossil_fuels",
            "tt"."freshwater_eutrophication",
            "tt"."marine_eutrophication",
            "tt"."terrestrial_eutrophication",
            "tt"."carcinogenic_human_toxicity",
            "tt"."carcinogenic_inorganics_human_toxicity",
            "tt"."carcinogenic_organics_human_toxicity",
            "tt"."non_carcinogenic_human_toxicity",
            "tt"."non_carcinogenic_inorganics_human_toxicity",
            "tt"."non_carcinogenic_organics_human_toxicity",
            "tt"."ionizing_radiation",
            "tt"."land_use",
            "tt"."abiotic_depletion",
            "tt"."ozone_depletion",
            "tt"."particulate_matter_formation",
            "tt"."human_health_photochemical_ozone_creation",
            "tt"."water_use",
            "tt"."weight_grams",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."acidification") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_acidification"
                END) AS "total_acidification",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."global_warming") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_global_warming"
                END) AS "total_global_warming",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."biogenic_global_warming") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_biogenic_global_warming"
                END) AS "total_biogenic_global_warming",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."fossil_fuel_global_warming") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_fossil_fuel_global_warming"
                END) AS "total_fossil_fuel_global_warming",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."land_use_global_warming") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_land_use_global_warming"
                END) AS "total_land_use_global_warming",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."freshwater_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_freshwater_ecotoxicity"
                END) AS "total_freshwater_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."freshwater_inorganics_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_freshwater_inorganics_ecotoxicity"
                END) AS "total_freshwater_inorganics_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."freshwater_organics_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_freshwater_organics_ecotoxicity"
                END) AS "total_freshwater_organics_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."abiotic_depletion_fossil_fuels") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_abiotic_depletion_fossil_fuels"
                END) AS "total_abiotic_depletion_fossil_fuels",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."freshwater_eutrophication") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_freshwater_eutrophication"
                END) AS "total_freshwater_eutrophication",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."marine_eutrophication") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_marine_eutrophication"
                END) AS "total_marine_eutrophication",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."terrestrial_eutrophication") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_terrestrial_eutrophication"
                END) AS "total_terrestrial_eutrophication",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."carcinogenic_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_carcinogenic_human_toxicity"
                END) AS "total_carcinogenic_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."carcinogenic_inorganics_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_carcinogenic_inorganics_human_toxicity"
                END) AS "total_carcinogenic_inorganics_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."carcinogenic_organics_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_carcinogenic_organics_human_toxicity"
                END) AS "total_carcinogenic_organics_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."non_carcinogenic_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_non_carcinogenic_human_toxicity"
                END) AS "total_non_carcinogenic_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."non_carcinogenic_inorganics_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_non_carcinogenic_inorganics_human_toxicity"
                END) AS "total_non_carcinogenic_inorganics_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."non_carcinogenic_organics_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_non_carcinogenic_organics_human_toxicity"
                END) AS "total_non_carcinogenic_organics_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."ionizing_radiation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_ionizing_radiation"
                END) AS "total_ionizing_radiation",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."land_use") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_land_use"
                END) AS "total_land_use",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."abiotic_depletion") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_abiotic_depletion"
                END) AS "total_abiotic_depletion",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."ozone_depletion") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_ozone_depletion"
                END) AS "total_ozone_depletion",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."particulate_matter_formation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_particulate_matter_formation"
                END) AS "total_particulate_matter_formation",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."human_health_photochemical_ozone_creation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_human_health_photochemical_ozone_creation"
                END) AS "total_human_health_photochemical_ozone_creation",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."water_use") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_water_use"
                END) AS "total_water_use",
            "tt"."is_leaf",
            "tt"."impact_source"
           FROM "tree_traversal" "tt"
          WHERE ("tt"."is_leaf" = 0)
          GROUP BY "tt"."id", "tt"."parent_id", "tt"."acidification", "tt"."global_warming", "tt"."biogenic_global_warming", "tt"."fossil_fuel_global_warming", "tt"."land_use_global_warming", "tt"."freshwater_ecotoxicity", "tt"."freshwater_inorganics_ecotoxicity", "tt"."freshwater_organics_ecotoxicity", "tt"."abiotic_depletion_fossil_fuels", "tt"."freshwater_eutrophication", "tt"."marine_eutrophication", "tt"."terrestrial_eutrophication", "tt"."carcinogenic_human_toxicity", "tt"."carcinogenic_inorganics_human_toxicity", "tt"."carcinogenic_organics_human_toxicity", "tt"."non_carcinogenic_human_toxicity", "tt"."non_carcinogenic_inorganics_human_toxicity", "tt"."non_carcinogenic_organics_human_toxicity", "tt"."ionizing_radiation", "tt"."land_use", "tt"."abiotic_depletion", "tt"."ozone_depletion", "tt"."particulate_matter_formation", "tt"."human_health_photochemical_ozone_creation", "tt"."water_use", "tt"."weight_grams", "tt"."is_leaf", "tt"."is_supplier_specific", "tt"."impact_source"
        ), "combined_results" AS (
         SELECT "tree_traversal"."id",
            "tree_traversal"."parent_id",
            "tree_traversal"."weight_grams",
            "tree_traversal"."total_acidification",
            "tree_traversal"."total_global_warming",
            "tree_traversal"."total_biogenic_global_warming",
            "tree_traversal"."total_fossil_fuel_global_warming",
            "tree_traversal"."total_land_use_global_warming",
            "tree_traversal"."total_freshwater_ecotoxicity",
            "tree_traversal"."total_freshwater_inorganics_ecotoxicity",
            "tree_traversal"."total_freshwater_organics_ecotoxicity",
            "tree_traversal"."total_abiotic_depletion_fossil_fuels",
            "tree_traversal"."total_freshwater_eutrophication",
            "tree_traversal"."total_marine_eutrophication",
            "tree_traversal"."total_terrestrial_eutrophication",
            "tree_traversal"."total_carcinogenic_human_toxicity",
            "tree_traversal"."total_carcinogenic_inorganics_human_toxicity",
            "tree_traversal"."total_carcinogenic_organics_human_toxicity",
            "tree_traversal"."total_non_carcinogenic_human_toxicity",
            "tree_traversal"."total_non_carcinogenic_inorganics_human_toxicity",
            "tree_traversal"."total_non_carcinogenic_organics_human_toxicity",
            "tree_traversal"."total_ionizing_radiation",
            "tree_traversal"."total_land_use",
            "tree_traversal"."total_abiotic_depletion",
            "tree_traversal"."total_ozone_depletion",
            "tree_traversal"."total_particulate_matter_formation",
            "tree_traversal"."total_human_health_photochemical_ozone_creation",
            "tree_traversal"."total_water_use",
            "tree_traversal"."is_leaf",
            "tree_traversal"."impact_source"
           FROM "tree_traversal"
          WHERE ("tree_traversal"."is_leaf" = 1)
        UNION ALL
         SELECT "aggregated_results"."id",
            "aggregated_results"."parent_id",
            "aggregated_results"."weight_grams",
            "aggregated_results"."total_acidification",
            "aggregated_results"."total_global_warming",
            "aggregated_results"."total_biogenic_global_warming",
            "aggregated_results"."total_fossil_fuel_global_warming",
            "aggregated_results"."total_land_use_global_warming",
            "aggregated_results"."total_freshwater_ecotoxicity",
            "aggregated_results"."total_freshwater_inorganics_ecotoxicity",
            "aggregated_results"."total_freshwater_organics_ecotoxicity",
            "aggregated_results"."total_abiotic_depletion_fossil_fuels",
            "aggregated_results"."total_freshwater_eutrophication",
            "aggregated_results"."total_marine_eutrophication",
            "aggregated_results"."total_terrestrial_eutrophication",
            "aggregated_results"."total_carcinogenic_human_toxicity",
            "aggregated_results"."total_carcinogenic_inorganics_human_toxicity",
            "aggregated_results"."total_carcinogenic_organics_human_toxicity",
            "aggregated_results"."total_non_carcinogenic_human_toxicity",
            "aggregated_results"."total_non_carcinogenic_inorganics_human_toxicity",
            "aggregated_results"."total_non_carcinogenic_organics_human_toxicity",
            "aggregated_results"."total_ionizing_radiation",
            "aggregated_results"."total_land_use",
            "aggregated_results"."total_abiotic_depletion",
            "aggregated_results"."total_ozone_depletion",
            "aggregated_results"."total_particulate_matter_formation",
            "aggregated_results"."total_human_health_photochemical_ozone_creation",
            "aggregated_results"."total_water_use",
            "aggregated_results"."is_leaf",
            "aggregated_results"."impact_source"
           FROM "aggregated_results"
        ), "combined_results_with_priority" AS (
         SELECT "combined_results"."id",
            "combined_results"."parent_id",
            "combined_results"."weight_grams",
            "combined_results"."total_acidification",
            "combined_results"."total_global_warming",
            "combined_results"."total_biogenic_global_warming",
            "combined_results"."total_fossil_fuel_global_warming",
            "combined_results"."total_land_use_global_warming",
            "combined_results"."total_freshwater_ecotoxicity",
            "combined_results"."total_freshwater_inorganics_ecotoxicity",
            "combined_results"."total_freshwater_organics_ecotoxicity",
            "combined_results"."total_abiotic_depletion_fossil_fuels",
            "combined_results"."total_freshwater_eutrophication",
            "combined_results"."total_marine_eutrophication",
            "combined_results"."total_terrestrial_eutrophication",
            "combined_results"."total_carcinogenic_human_toxicity",
            "combined_results"."total_carcinogenic_inorganics_human_toxicity",
            "combined_results"."total_carcinogenic_organics_human_toxicity",
            "combined_results"."total_non_carcinogenic_human_toxicity",
            "combined_results"."total_non_carcinogenic_inorganics_human_toxicity",
            "combined_results"."total_non_carcinogenic_organics_human_toxicity",
            "combined_results"."total_ionizing_radiation",
            "combined_results"."total_land_use",
            "combined_results"."total_abiotic_depletion",
            "combined_results"."total_ozone_depletion",
            "combined_results"."total_particulate_matter_formation",
            "combined_results"."total_human_health_photochemical_ozone_creation",
            "combined_results"."total_water_use",
            "combined_results"."is_leaf",
            "combined_results"."impact_source",
            "row_number"() OVER (PARTITION BY "combined_results"."id" ORDER BY
                CASE "combined_results"."impact_source"
                    WHEN 'supplier'::"text" THEN 1
                    WHEN 'mixed'::"text" THEN 2
                    ELSE 3
                END) AS "priority"
           FROM "combined_results"
        ), "filtered_combined_results" AS (
         SELECT "combined_results_with_priority"."id",
            "combined_results_with_priority"."parent_id",
            "combined_results_with_priority"."weight_grams",
            "combined_results_with_priority"."total_acidification",
            "combined_results_with_priority"."total_global_warming",
            "combined_results_with_priority"."total_biogenic_global_warming",
            "combined_results_with_priority"."total_fossil_fuel_global_warming",
            "combined_results_with_priority"."total_land_use_global_warming",
            "combined_results_with_priority"."total_freshwater_ecotoxicity",
            "combined_results_with_priority"."total_freshwater_inorganics_ecotoxicity",
            "combined_results_with_priority"."total_freshwater_organics_ecotoxicity",
            "combined_results_with_priority"."total_abiotic_depletion_fossil_fuels",
            "combined_results_with_priority"."total_freshwater_eutrophication",
            "combined_results_with_priority"."total_marine_eutrophication",
            "combined_results_with_priority"."total_terrestrial_eutrophication",
            "combined_results_with_priority"."total_carcinogenic_human_toxicity",
            "combined_results_with_priority"."total_carcinogenic_inorganics_human_toxicity",
            "combined_results_with_priority"."total_carcinogenic_organics_human_toxicity",
            "combined_results_with_priority"."total_non_carcinogenic_human_toxicity",
            "combined_results_with_priority"."total_non_carcinogenic_inorganics_human_toxicity",
            "combined_results_with_priority"."total_non_carcinogenic_organics_human_toxicity",
            "combined_results_with_priority"."total_ionizing_radiation",
            "combined_results_with_priority"."total_land_use",
            "combined_results_with_priority"."total_abiotic_depletion",
            "combined_results_with_priority"."total_ozone_depletion",
            "combined_results_with_priority"."total_particulate_matter_formation",
            "combined_results_with_priority"."total_human_health_photochemical_ozone_creation",
            "combined_results_with_priority"."total_water_use",
            "combined_results_with_priority"."is_leaf",
            "combined_results_with_priority"."impact_source",
            "combined_results_with_priority"."priority"
           FROM "combined_results_with_priority"
          WHERE ("combined_results_with_priority"."priority" = 1)
        )
 SELECT "mcwf"."id",
    "mcwf"."created_at",
    "mcwf"."weight_grams",
    "mcwf"."org_id",
    "mcwf"."lca_id",
    "mcwf"."level",
    "mcwf"."parent_id",
    "mcwf"."leaf",
    "mcwf"."retake_part_id",
    "mcwf"."customer_part_id",
    "mcwf"."part_description",
    "mcwf"."origin",
    "mcwf"."manufacturing_process",
    "mcwf"."primary_material",
    "mcwf"."is_supplier_specific",
    "mcwf"."supplier_id",
    "mcwf"."factor_id",
    "mcwf"."reference_product_name",
    "mcwf"."activity_name",
    "mcwf"."database_name",
    "fcr"."total_acidification",
    "fcr"."total_global_warming",
    "fcr"."total_biogenic_global_warming",
    "fcr"."total_fossil_fuel_global_warming",
    "fcr"."total_land_use_global_warming",
    "fcr"."total_freshwater_ecotoxicity",
    "fcr"."total_freshwater_inorganics_ecotoxicity",
    "fcr"."total_freshwater_organics_ecotoxicity",
    "fcr"."total_abiotic_depletion_fossil_fuels",
    "fcr"."total_freshwater_eutrophication",
    "fcr"."total_marine_eutrophication",
    "fcr"."total_terrestrial_eutrophication",
    "fcr"."total_carcinogenic_human_toxicity",
    "fcr"."total_carcinogenic_inorganics_human_toxicity",
    "fcr"."total_carcinogenic_organics_human_toxicity",
    "fcr"."total_non_carcinogenic_human_toxicity",
    "fcr"."total_non_carcinogenic_inorganics_human_toxicity",
    "fcr"."total_non_carcinogenic_organics_human_toxicity",
    "fcr"."total_ionizing_radiation",
    "fcr"."total_land_use",
    "fcr"."total_abiotic_depletion",
    "fcr"."total_ozone_depletion",
    "fcr"."total_particulate_matter_formation",
    "fcr"."total_human_health_photochemical_ozone_creation",
    "fcr"."total_water_use",
    "fcr"."is_leaf",
    "fcr"."impact_source"
   FROM ("public"."ef_material_composition_with_factors" "mcwf"
     LEFT JOIN "filtered_combined_results" "fcr" ON (("mcwf"."id" = "fcr"."id")));


ALTER TABLE "public"."ef_material_composition_with_impacts" OWNER TO "postgres";

--
-- Name: ef_materials_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."ef_materials_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_acidification" numeric,
    "total_global_warming" numeric,
    "total_biogenic_global_warming" numeric,
    "total_fossil_fuel_global_warming" numeric,
    "total_land_use_global_warming" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_freshwater_inorganics_ecotoxicity" numeric,
    "total_freshwater_organics_ecotoxicity" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_terrestrial_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_carcinogenic_inorganics_human_toxicity" numeric,
    "total_carcinogenic_organics_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_inorganics_human_toxicity" numeric,
    "total_non_carcinogenic_organics_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_abiotic_depletion" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."ef_materials_results" OWNER TO "postgres";

--
-- Name: ef_total_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."ef_total_results" (
    "lca_id" "uuid" NOT NULL,
    "total_acidification" numeric,
    "total_global_warming" numeric,
    "total_biogenic_global_warming" numeric,
    "total_fossil_fuel_global_warming" numeric,
    "total_land_use_global_warming" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_freshwater_inorganics_ecotoxicity" numeric,
    "total_freshwater_organics_ecotoxicity" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_terrestrial_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_carcinogenic_inorganics_human_toxicity" numeric,
    "total_carcinogenic_organics_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_inorganics_human_toxicity" numeric,
    "total_non_carcinogenic_organics_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_abiotic_depletion" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_water_use" numeric,
    "retake_part_id" "text",
    "customer_part_id" "text",
    "part_description" "text",
    "impact_source" "text",
    "materials_completed" boolean,
    "transportation_completed" boolean,
    "manufacturing_completed" boolean,
    "use_phase_completed" boolean,
    "end_of_life_completed" boolean,
    "org_id" "text",
    "weight_grams" numeric,
    "long_description" "text",
    "material_composition_id" "text"
);


ALTER TABLE "public"."ef_total_results" OWNER TO "postgres";

--
-- Name: ef_transportation_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."ef_transportation_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_acidification" numeric,
    "total_global_warming" numeric,
    "total_biogenic_global_warming" numeric,
    "total_fossil_fuel_global_warming" numeric,
    "total_land_use_global_warming" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_freshwater_inorganics_ecotoxicity" numeric,
    "total_freshwater_organics_ecotoxicity" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_terrestrial_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_carcinogenic_inorganics_human_toxicity" numeric,
    "total_carcinogenic_organics_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_inorganics_human_toxicity" numeric,
    "total_non_carcinogenic_organics_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_abiotic_depletion" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."ef_transportation_results" OWNER TO "postgres";

--
-- Name: ef_transportation_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_transportation_with_impacts" AS
 SELECT "t"."id",
    "t"."created_at",
    "t"."origin",
    "t"."destination",
    "t"."distance_km",
    "t"."transportation_type",
    "t"."org_id",
    "t"."lca_id",
    "t"."factor_id",
    "t"."material_composition_id",
    "m"."weight_grams",
    "p"."customer_part_id",
    "p"."part_description",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ((("f"."ef_ac" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_acidification",
    ((("f"."ef_g" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_global_warming",
    ((("f"."ef_b_g" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_biogenic_global_warming",
    ((("f"."ef_ff_g" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_fossil_fuel_global_warming",
    ((("f"."ef_l_g" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_land_use_global_warming",
    ((("f"."ef_f_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_freshwater_ecotoxicity",
    ((("f"."ef_f_i_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_freshwater_inorganics_ecotoxicity",
    ((("f"."ef_f_o_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_freshwater_organics_ecotoxicity",
    ((("f"."ef_ad_ff" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_abiotic_depletion_fossil_fuels",
    ((("f"."ef_f_eu" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_freshwater_eutrophication",
    ((("f"."ef_m_eu" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_marine_eutrophication",
    ((("f"."ef_t_eu" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_terrestrial_eutrophication",
    ((("f"."ef_cht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_carcinogenic_human_toxicity",
    ((("f"."ef_ciht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_carcinogenic_inorganics_human_toxicity",
    ((("f"."ef_coht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_carcinogenic_organics_human_toxicity",
    ((("f"."ef_ncht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_non_carcinogenic_human_toxicity",
    ((("f"."ef_nciht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_non_carcinogenic_inorganics_human_toxicity",
    ((("f"."ef_ncoht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_non_carcinogenic_organics_human_toxicity",
    ((("f"."ef_ir" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_ionizing_radiation",
    ((("f"."ef_l" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_land_use",
    ((("f"."ef_ad" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_abiotic_depletion",
    ((("f"."ef_od" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_ozone_depletion",
    ((("f"."ef_pm" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_particulate_matter_formation",
    ((("f"."ef_hh_oc" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_ef_human_health_photochemical_ozone_creation",
    ((("f"."ef_w" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_water_use"
   FROM ((("public"."transportation" "t"
     LEFT JOIN "public"."material_composition" "m" ON (("t"."material_composition_id" = "m"."id")))
     LEFT JOIN "public"."parts" "p" ON (("m"."retake_part_id" = "p"."retake_part_id")))
     LEFT JOIN "public"."third_party_factors" "f" ON (("t"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."ef_transportation_with_impacts" OWNER TO "postgres";

--
-- Name: ef_use_phase_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."ef_use_phase_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_acidification" numeric,
    "total_global_warming" numeric,
    "total_biogenic_global_warming" numeric,
    "total_fossil_fuel_global_warming" numeric,
    "total_land_use_global_warming" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_freshwater_inorganics_ecotoxicity" numeric,
    "total_freshwater_organics_ecotoxicity" numeric,
    "total_abiotic_depletion_fossil_fuels" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_terrestrial_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_carcinogenic_inorganics_human_toxicity" numeric,
    "total_carcinogenic_organics_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_inorganics_human_toxicity" numeric,
    "total_non_carcinogenic_organics_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_abiotic_depletion" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."ef_use_phase_results" OWNER TO "postgres";

--
-- Name: ef_use_phase_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."ef_use_phase_with_impacts" AS
 SELECT "up"."id",
    "up"."org_id",
    "up"."lca_id",
    "up"."quantity",
    "up"."location",
    "up"."percent_at_location",
    "up"."factor_id",
    "up"."use_type",
    "s"."has_use_phase",
    "f"."reference_product_name",
    "f"."database_name",
    "f"."activity_name",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ac" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_acidification",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_g" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_global_warming",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_b_g" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_biogenic_global_warming",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ff_g" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_fossil_fuel_global_warming",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_l_g" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_land_use_global_warming",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_f_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_freshwater_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_f_i_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_freshwater_inorganics_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_f_o_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_freshwater_organics_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ad_ff" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_abiotic_depletion_fossil_fuels",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_f_eu" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_freshwater_eutrophication",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_m_eu" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_marine_eutrophication",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_t_eu" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_terrestrial_eutrophication",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_cht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_carcinogenic_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ciht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_carcinogenic_inorganics_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_coht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_carcinogenic_organics_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ncht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_non_carcinogenic_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_nciht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_non_carcinogenic_inorganics_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ncoht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_non_carcinogenic_organics_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ir" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_ionizing_radiation",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_l" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_land_use",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_ad" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_abiotic_depletion",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_od" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_ozone_depletion",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_pm" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_particulate_matter_formation",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_hh_oc" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_ef_human_health_photochemical_ozone_creation",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."ef_w" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_water_use"
   FROM (("public"."use_phase" "up"
     JOIN "public"."third_party_factors" "f" ON (("f"."factor_id" = "up"."factor_id")))
     JOIN "public"."service_life" "s" ON (("s"."lca_id" = "up"."lca_id")));


ALTER TABLE "public"."ef_use_phase_with_impacts" OWNER TO "postgres";

--
-- Name: material_composition_with_descriptions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."material_composition_with_descriptions" AS
 SELECT "mc"."id",
    "mc"."created_at",
    "mc"."weight_grams",
    "mc"."org_id",
    "mc"."lca_id",
    "mc"."level",
    "mc"."parent_id",
    "mc"."retake_part_id",
    "mc"."supplier_id",
    "p"."part_description",
    "p"."primary_material",
    "s"."name" AS "supplier_name"
   FROM (("public"."material_composition" "mc"
     LEFT JOIN "public"."parts" "p" ON (("mc"."retake_part_id" = "p"."retake_part_id")))
     LEFT JOIN "public"."suppliers" "s" ON (("mc"."supplier_id" = "s"."id")));


ALTER TABLE "public"."material_composition_with_descriptions" OWNER TO "postgres";

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."messages" (
    "id" "uuid" NOT NULL,
    "date" "text",
    "from" "text",
    "status" "text",
    "type" "text",
    "org_id" "text"
);


ALTER TABLE "public"."messages" OWNER TO "postgres";

--
-- Name: messages_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."messages_attachments" (
    "id" "uuid" NOT NULL,
    "message_id" "uuid",
    "path" "text",
    "bucket" "text"
);


ALTER TABLE "public"."messages_attachments" OWNER TO "postgres";

--
-- Name: organization_email_servers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."organization_email_servers" (
    "id" bigint NOT NULL,
    "org_id" "text",
    "name" "text",
    "inbound_address" "text",
    "type" "text"
);


ALTER TABLE "public"."organization_email_servers" OWNER TO "postgres";

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."organizations" (
    "id" "text" NOT NULL,
    "name" "text",
    "website" "text",
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";

--
-- Name: organizations_email_servers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."organization_email_servers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."organizations_email_servers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: parts_engagement_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."parts_engagement_status" AS
 SELECT "cml_parts_with_impacts"."org_id",
    "count"(*) FILTER (WHERE ("cml_parts_with_impacts"."supplier_engagement" = 'not_engaged'::"text")) AS "not_engaged",
    "count"(*) FILTER (WHERE ("cml_parts_with_impacts"."supplier_engagement" = 'awaiting_response'::"text")) AS "awaiting_response",
    "count"(*) FILTER (WHERE ("cml_parts_with_impacts"."impact_source" = 'supplier'::"text")) AS "data_received"
   FROM "public"."cml_parts_with_impacts"
  WHERE ("cml_parts_with_impacts"."is_base_material" = false)
  GROUP BY "cml_parts_with_impacts"."org_id";


ALTER TABLE "public"."parts_engagement_status" OWNER TO "postgres";

--
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."regions" (
    "id" "text" NOT NULL,
    "name" "text"
);


ALTER TABLE "public"."regions" OWNER TO "postgres";

--
-- Name: rmh_end_of_life_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."rmh_end_of_life_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_energy_resources" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_metals_material_resources" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_terrestrial_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."rmh_end_of_life_results" OWNER TO "postgres";

--
-- Name: rmh_end_of_life_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_end_of_life_with_impacts" AS
 SELECT "eol"."id",
    "eol"."created_at",
    "eol"."org_id",
    "eol"."lca_id",
    "eol"."description",
    "eol"."weight_grams",
    "eol"."location",
    "eol"."factor_id",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    (("f"."rmh_t_ac" * "eol"."weight_grams") / (1000)::numeric) AS "total_acidification",
    (("f"."rmh_g" * "eol"."weight_grams") / (1000)::numeric) AS "total_global_warming",
    (("f"."rmh_f_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_freshwater_ecotoxicity",
    (("f"."rmh_m_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_marine_ecotoxicity",
    (("f"."rmh_t_et" * "eol"."weight_grams") / (1000)::numeric) AS "total_terrestrial_ecotoxicity",
    (("f"."rmh_er" * "eol"."weight_grams") / (1000)::numeric) AS "total_energy_resources",
    (("f"."rmh_f_eu" * "eol"."weight_grams") / (1000)::numeric) AS "total_freshwater_eutrophication",
    (("f"."rmh_m_eu" * "eol"."weight_grams") / (1000)::numeric) AS "total_marine_eutrophication",
    (("f"."rmh_cht" * "eol"."weight_grams") / (1000)::numeric) AS "total_carcinogenic_human_toxicity",
    (("f"."rmh_ncht" * "eol"."weight_grams") / (1000)::numeric) AS "total_non_carcinogenic_human_toxicity",
    (("f"."rmh_ir" * "eol"."weight_grams") / (1000)::numeric) AS "total_ionizing_radiation",
    (("f"."rmh_l" * "eol"."weight_grams") / (1000)::numeric) AS "total_land_use",
    (("f"."rmh_mm_r" * "eol"."weight_grams") / (1000)::numeric) AS "total_metals_material_resources",
    (("f"."rmh_od" * "eol"."weight_grams") / (1000)::numeric) AS "total_ozone_depletion",
    (("f"."rmh_pm" * "eol"."weight_grams") / (1000)::numeric) AS "total_particulate_matter_formation",
    (("f"."rmh_hh_oc" * "eol"."weight_grams") / (1000)::numeric) AS "total_human_health_photochemical_ozone_creation",
    (("f"."rmh_t_oc" * "eol"."weight_grams") / (1000)::numeric) AS "total_terrestrial_photochemical_ozone_creation",
    (("f"."rmh_w" * "eol"."weight_grams") / (1000)::numeric) AS "total_water_use"
   FROM ("public"."end_of_life" "eol"
     LEFT JOIN "public"."third_party_factors" "f" ON (("eol"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."rmh_end_of_life_with_impacts" OWNER TO "postgres";

--
-- Name: rmh_purchased_energy_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_purchased_energy_with_impacts" AS
 SELECT "pe"."id",
    "pe"."created_at",
    "pe"."description",
    "pe"."quantity_kwh",
    "pe"."facility_id",
    "pe"."org_id",
    "pe"."percent_renewable",
    "pe"."year",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ("f"."rmh_t_ac" * "pe"."quantity_kwh") AS "total_acidification",
    ("f"."rmh_g" * "pe"."quantity_kwh") AS "total_global_warming",
    ("f"."rmh_f_et" * "pe"."quantity_kwh") AS "total_freshwater_ecotoxicity",
    ("f"."rmh_m_et" * "pe"."quantity_kwh") AS "total_marine_ecotoxicity",
    ("f"."rmh_t_et" * "pe"."quantity_kwh") AS "total_terrestrial_ecotoxicity",
    ("f"."rmh_er" * "pe"."quantity_kwh") AS "total_energy_resources",
    ("f"."rmh_f_eu" * "pe"."quantity_kwh") AS "total_freshwater_eutrophication",
    ("f"."rmh_m_eu" * "pe"."quantity_kwh") AS "total_marine_eutrophication",
    ("f"."rmh_cht" * "pe"."quantity_kwh") AS "total_carcinogenic_human_toxicity",
    ("f"."rmh_ncht" * "pe"."quantity_kwh") AS "total_non_carcinogenic_human_toxicity",
    ("f"."rmh_ir" * "pe"."quantity_kwh") AS "total_ionizing_radiation",
    ("f"."rmh_l" * "pe"."quantity_kwh") AS "total_land_use",
    ("f"."rmh_mm_r" * "pe"."quantity_kwh") AS "total_metals_material_resources",
    ("f"."rmh_od" * "pe"."quantity_kwh") AS "total_ozone_depletion",
    ("f"."rmh_pm" * "pe"."quantity_kwh") AS "total_particulate_matter_formation",
    ("f"."rmh_hh_oc" * "pe"."quantity_kwh") AS "total_human_health_photochemical_ozone_creation",
    ("f"."rmh_t_oc" * "pe"."quantity_kwh") AS "total_terrestrial_photochemical_ozone_creation",
    ("f"."rmh_w" * "pe"."quantity_kwh") AS "total_water_use"
   FROM ("public"."purchased_energy" "pe"
     LEFT JOIN "public"."third_party_factors" "f" ON (("pe"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."rmh_purchased_energy_with_impacts" OWNER TO "postgres";

--
-- Name: rmh_stationary_fuel_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_stationary_fuel_with_impacts" AS
 SELECT "sf"."id",
    "sf"."facility_id",
    "sf"."year",
    "sf"."description",
    "sf"."quantity_mj",
    "sf"."org_id",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ("f"."rmh_t_ac" * "sf"."quantity_mj") AS "total_acidification",
    ("f"."rmh_g" * "sf"."quantity_mj") AS "total_global_warming",
    ("f"."rmh_f_et" * "sf"."quantity_mj") AS "total_freshwater_ecotoxicity",
    ("f"."rmh_m_et" * "sf"."quantity_mj") AS "total_marine_ecotoxicity",
    ("f"."rmh_t_et" * "sf"."quantity_mj") AS "total_terrestrial_ecotoxicity",
    ("f"."rmh_er" * "sf"."quantity_mj") AS "total_energy_resources",
    ("f"."rmh_f_eu" * "sf"."quantity_mj") AS "total_freshwater_eutrophication",
    ("f"."rmh_m_eu" * "sf"."quantity_mj") AS "total_marine_eutrophication",
    ("f"."rmh_cht" * "sf"."quantity_mj") AS "total_carcinogenic_human_toxicity",
    ("f"."rmh_ncht" * "sf"."quantity_mj") AS "total_non_carcinogenic_human_toxicity",
    ("f"."rmh_ir" * "sf"."quantity_mj") AS "total_ionizing_radiation",
    ("f"."rmh_l" * "sf"."quantity_mj") AS "total_land_use",
    ("f"."rmh_mm_r" * "sf"."quantity_mj") AS "total_metals_material_resources",
    ("f"."rmh_od" * "sf"."quantity_mj") AS "total_ozone_depletion",
    ("f"."rmh_pm" * "sf"."quantity_mj") AS "total_particulate_matter_formation",
    ("f"."rmh_hh_oc" * "sf"."quantity_mj") AS "total_human_health_photochemical_ozone_creation",
    ("f"."rmh_t_oc" * "sf"."quantity_mj") AS "total_terrestrial_photochemical_ozone_creation",
    ("f"."rmh_w" * "sf"."quantity_mj") AS "total_water_use"
   FROM ("public"."stationary_fuel" "sf"
     LEFT JOIN "public"."third_party_factors" "f" ON (("sf"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."rmh_stationary_fuel_with_impacts" OWNER TO "postgres";

--
-- Name: rmh_facility_energy_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_facility_energy_with_impacts" AS
 SELECT "f"."org_id",
    "f"."name",
    "f"."location",
    "f"."created_at",
    "f"."id",
    "pe"."quantity_kwh",
    "pe"."percent_renewable",
    "sf"."quantity_mj",
    ("pe"."total_acidification" + "sf"."total_acidification") AS "total_acidification",
    ("pe"."total_global_warming" + "sf"."total_global_warming") AS "total_global_warming",
    ("pe"."total_freshwater_ecotoxicity" + "sf"."total_freshwater_ecotoxicity") AS "total_freshwater_ecotoxicity",
    ("pe"."total_marine_ecotoxicity" + "sf"."total_marine_ecotoxicity") AS "total_marine_ecotoxicity",
    ("pe"."total_terrestrial_ecotoxicity" + "sf"."total_terrestrial_ecotoxicity") AS "total_terrestrial_ecotoxicity",
    ("pe"."total_energy_resources" + "sf"."total_energy_resources") AS "total_energy_resources",
    ("pe"."total_freshwater_eutrophication" + "sf"."total_freshwater_eutrophication") AS "total_freshwater_eutrophication",
    ("pe"."total_marine_eutrophication" + "sf"."total_marine_eutrophication") AS "total_marine_eutrophication",
    ("pe"."total_carcinogenic_human_toxicity" + "sf"."total_carcinogenic_human_toxicity") AS "total_carcinogenic_human_toxicity",
    ("pe"."total_non_carcinogenic_human_toxicity" + "sf"."total_non_carcinogenic_human_toxicity") AS "total_non_carcinogenic_human_toxicity",
    ("pe"."total_ionizing_radiation" + "sf"."total_ionizing_radiation") AS "total_ionizing_radiation",
    ("pe"."total_land_use" + "sf"."total_land_use") AS "total_land_use",
    ("pe"."total_metals_material_resources" + "sf"."total_metals_material_resources") AS "total_metals_material_resources",
    ("pe"."total_ozone_depletion" + "sf"."total_ozone_depletion") AS "total_ozone_depletion",
    ("pe"."total_particulate_matter_formation" + "sf"."total_particulate_matter_formation") AS "total_particulate_matter_formation",
    ("pe"."total_human_health_photochemical_ozone_creation" + "sf"."total_human_health_photochemical_ozone_creation") AS "total_human_health_photochemical_ozone_creation",
    ("pe"."total_terrestrial_photochemical_ozone_creation" + "sf"."total_terrestrial_photochemical_ozone_creation") AS "total_terrestrial_photochemical_ozone_creation",
    ("pe"."total_water_use" + "sf"."total_water_use") AS "total_water_use"
   FROM (("public"."facilities" "f"
     LEFT JOIN "public"."rmh_purchased_energy_with_impacts" "pe" ON ((("f"."id" = "pe"."facility_id") AND ("pe"."year" = (EXTRACT(year FROM CURRENT_DATE) - (1)::numeric)))))
     LEFT JOIN "public"."rmh_stationary_fuel_with_impacts" "sf" ON ((("f"."id" = "sf"."facility_id") AND ("sf"."year" = (EXTRACT(year FROM CURRENT_DATE) - (1)::numeric)))));


ALTER TABLE "public"."rmh_facility_energy_with_impacts" OWNER TO "postgres";

--
-- Name: rmh_facility_allocation_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_facility_allocation_with_impacts" AS
 SELECT "fa"."id",
    "fa"."created_at",
    "fa"."facility_id",
    "fa"."percent_revenue",
    "fa"."quantity_produced",
    "fa"."lca_id",
    "fa"."org_id",
    "f"."name",
    "f"."location",
    "f"."percent_renewable",
    ((("f"."quantity_mj" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "quantity_mj",
    ((("f"."quantity_kwh" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "quantity_kwh",
    ((("f"."total_acidification" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_acidification",
    ((("f"."total_global_warming" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_global_warming",
    ((("f"."total_freshwater_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_freshwater_ecotoxicity",
    ((("f"."total_marine_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_marine_ecotoxicity",
    ((("f"."total_terrestrial_ecotoxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_terrestrial_ecotoxicity",
    ((("f"."total_energy_resources" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_energy_resources",
    ((("f"."total_freshwater_eutrophication" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_freshwater_eutrophication",
    ((("f"."total_marine_eutrophication" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_marine_eutrophication",
    ((("f"."total_carcinogenic_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_carcinogenic_human_toxicity",
    ((("f"."total_non_carcinogenic_human_toxicity" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_non_carcinogenic_human_toxicity",
    ((("f"."total_ionizing_radiation" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_ionizing_radiation",
    ((("f"."total_land_use" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_land_use",
    ((("f"."total_metals_material_resources" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_metals_material_resources",
    ((("f"."total_ozone_depletion" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_ozone_depletion",
    ((("f"."total_particulate_matter_formation" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_particulate_matter_formation",
    ((("f"."total_human_health_photochemical_ozone_creation" * "fa"."percent_revenue") / (100)::numeric) / "fa"."quantity_produced") AS "total_human_health_photochemical_ozone_creation"
   FROM ("public"."rmh_facility_energy_with_impacts" "f"
     JOIN "public"."facility_allocation" "fa" ON (("f"."id" = "fa"."facility_id")));


ALTER TABLE "public"."rmh_facility_allocation_with_impacts" OWNER TO "postgres";

--
-- Name: rmh_manufacturing_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."rmh_manufacturing_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_energy_resources" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_metals_material_resources" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_terrestrial_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."rmh_manufacturing_results" OWNER TO "postgres";

--
-- Name: rmh_material_composition_with_factors; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_material_composition_with_factors" AS
 SELECT "material_composition"."id",
    "material_composition"."created_at",
    "material_composition"."weight_grams",
    "material_composition"."org_id",
    "material_composition"."lca_id",
    "material_composition"."level",
    "material_composition"."parent_id",
    "material_composition"."leaf",
    "material_composition"."retake_part_id",
    "material_composition"."supplier_id",
    "parts"."customer_part_id",
    "parts"."part_description",
    "parts"."origin",
    "parts"."manufacturing_process",
    "parts"."primary_material",
    "factors"."factor_id",
    "factors"."reference_product_name",
    "factors"."activity_name",
    "factors"."database_name",
    COALESCE(("retake_factors"."rmh_t_ac")::double precision, ("factors"."rmh_t_ac")::double precision, (0)::double precision) AS "acidification",
    COALESCE(("retake_factors"."rmh_g")::double precision, ("factors"."rmh_g")::double precision, (0)::double precision) AS "global_warming",
    COALESCE(("retake_factors"."rmh_f_et")::double precision, ("factors"."rmh_f_et")::double precision, (0)::double precision) AS "freshwater_ecotoxicity",
    COALESCE(("retake_factors"."rmh_m_et")::double precision, ("factors"."rmh_m_et")::double precision, (0)::double precision) AS "marine_ecotoxicity",
    COALESCE(("retake_factors"."rmh_t_et")::double precision, ("factors"."rmh_t_et")::double precision, (0)::double precision) AS "terrestrial_ecotoxicity",
    COALESCE(("retake_factors"."rmh_er")::double precision, ("factors"."rmh_er")::double precision, (0)::double precision) AS "energy_resources",
    COALESCE(("retake_factors"."rmh_f_eu")::double precision, ("factors"."rmh_f_eu")::double precision, (0)::double precision) AS "freshwater_eutrophication",
    COALESCE(("retake_factors"."rmh_m_eu")::double precision, ("factors"."rmh_m_eu")::double precision, (0)::double precision) AS "marine_eutrophication",
    COALESCE(("retake_factors"."rmh_cht")::double precision, ("factors"."rmh_cht")::double precision, (0)::double precision) AS "carcinogenic_human_toxicity",
    COALESCE(("retake_factors"."rmh_ncht")::double precision, ("factors"."rmh_ncht")::double precision, (0)::double precision) AS "non_carcinogenic_human_toxicity",
    COALESCE(("retake_factors"."rmh_ir")::double precision, ("factors"."rmh_ir")::double precision, (0)::double precision) AS "ionizing_radiation",
    COALESCE(("retake_factors"."rmh_l")::double precision, ("factors"."rmh_l")::double precision, (0)::double precision) AS "land_use",
    COALESCE(("retake_factors"."rmh_mm_r")::double precision, ("factors"."rmh_mm_r")::double precision, (0)::double precision) AS "metals_material_resources",
    COALESCE(("retake_factors"."rmh_od")::double precision, ("factors"."rmh_od")::double precision, (0)::double precision) AS "ozone_depletion",
    COALESCE(("retake_factors"."rmh_pm")::double precision, ("factors"."rmh_pm")::double precision, (0)::double precision) AS "particulate_matter_formation",
    COALESCE(("retake_factors"."rmh_hh_oc")::double precision, ("factors"."rmh_hh_oc")::double precision, (0)::double precision) AS "human_health_photochemical_ozone_creation",
    COALESCE(("retake_factors"."rmh_t_oc")::double precision, ("factors"."rmh_t_oc")::double precision, (0)::double precision) AS "terrestrial_photochemical_ozone_creation",
    COALESCE(("retake_factors"."rmh_w")::double precision, ("factors"."rmh_w")::double precision, (0)::double precision) AS "water_use",
        CASE
            WHEN ("retake_factors"."retake_part_id" IS NOT NULL) THEN true
            ELSE false
        END AS "is_supplier_specific"
   FROM ((("public"."material_composition"
     LEFT JOIN "public"."parts_with_factors" "parts" ON (("material_composition"."retake_part_id" = "parts"."retake_part_id")))
     LEFT JOIN "public"."third_party_factors" "factors" ON (("parts"."factor_id" = "factors"."factor_id")))
     LEFT JOIN "public"."retake_factors" ON ((("material_composition"."retake_part_id" = "retake_factors"."retake_part_id") AND ("material_composition"."supplier_id" = "retake_factors"."supplier_id"))));


ALTER TABLE "public"."rmh_material_composition_with_factors" OWNER TO "postgres";

--
-- Name: rmh_material_composition_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_material_composition_with_impacts" AS
 WITH RECURSIVE "tree_traversal" AS (
         SELECT "mcwf_1"."id",
            "mcwf_1"."parent_id",
            "mcwf_1"."acidification",
            "mcwf_1"."global_warming",
            "mcwf_1"."freshwater_ecotoxicity",
            "mcwf_1"."marine_ecotoxicity",
            "mcwf_1"."terrestrial_ecotoxicity",
            "mcwf_1"."energy_resources",
            "mcwf_1"."freshwater_eutrophication",
            "mcwf_1"."marine_eutrophication",
            "mcwf_1"."carcinogenic_human_toxicity",
            "mcwf_1"."non_carcinogenic_human_toxicity",
            "mcwf_1"."ionizing_radiation",
            "mcwf_1"."land_use",
            "mcwf_1"."metals_material_resources",
            "mcwf_1"."ozone_depletion",
            "mcwf_1"."particulate_matter_formation",
            "mcwf_1"."human_health_photochemical_ozone_creation",
            "mcwf_1"."terrestrial_photochemical_ozone_creation",
            "mcwf_1"."water_use",
            "mcwf_1"."weight_grams",
            "mcwf_1"."is_supplier_specific",
            "row_number"() OVER (PARTITION BY "mcwf_1"."parent_id", "mcwf_1"."is_supplier_specific" ORDER BY "mcwf_1"."id") AS "rn",
            (("mcwf_1"."acidification" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_acidification",
            (("mcwf_1"."global_warming" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_global_warming",
            (("mcwf_1"."freshwater_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_freshwater_ecotoxicity",
            (("mcwf_1"."marine_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_marine_ecotoxicity",
            (("mcwf_1"."terrestrial_ecotoxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_terrestrial_ecotoxicity",
            (("mcwf_1"."energy_resources" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_energy_resources",
            (("mcwf_1"."freshwater_eutrophication" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_freshwater_eutrophication",
            (("mcwf_1"."marine_eutrophication" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_marine_eutrophication",
            (("mcwf_1"."carcinogenic_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_carcinogenic_human_toxicity",
            (("mcwf_1"."non_carcinogenic_human_toxicity" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_non_carcinogenic_human_toxicity",
            (("mcwf_1"."ionizing_radiation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_ionizing_radiation",
            (("mcwf_1"."land_use" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_land_use",
            (("mcwf_1"."metals_material_resources" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_metals_material_resources",
            (("mcwf_1"."ozone_depletion" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_ozone_depletion",
            (("mcwf_1"."particulate_matter_formation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_particulate_matter_formation",
            (("mcwf_1"."human_health_photochemical_ozone_creation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_human_health_photochemical_ozone_creation",
            (("mcwf_1"."terrestrial_photochemical_ozone_creation" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_terrestrial_photochemical_ozone_creation",
            (("mcwf_1"."water_use" * ("mcwf_1"."weight_grams")::double precision) / (1000)::double precision) AS "total_water_use",
            1 AS "is_leaf",
                CASE
                    WHEN "mcwf_1"."is_supplier_specific" THEN 'supplier'::"text"
                    ELSE 'database'::"text"
                END AS "impact_source"
           FROM "public"."rmh_material_composition_with_factors" "mcwf_1"
          WHERE (NOT ("mcwf_1"."id" IN ( SELECT DISTINCT "rmh_material_composition_with_factors_1"."parent_id"
                   FROM "public"."rmh_material_composition_with_factors" "rmh_material_composition_with_factors_1"
                  WHERE ("rmh_material_composition_with_factors_1"."parent_id" IS NOT NULL))))
        UNION ALL
         SELECT "mcwf_1"."id",
            "mcwf_1"."parent_id",
            "mcwf_1"."acidification",
            "mcwf_1"."global_warming",
            "mcwf_1"."freshwater_ecotoxicity",
            "mcwf_1"."marine_ecotoxicity",
            "mcwf_1"."terrestrial_ecotoxicity",
            "mcwf_1"."energy_resources",
            "mcwf_1"."freshwater_eutrophication",
            "mcwf_1"."marine_eutrophication",
            "mcwf_1"."carcinogenic_human_toxicity",
            "mcwf_1"."non_carcinogenic_human_toxicity",
            "mcwf_1"."ionizing_radiation",
            "mcwf_1"."land_use",
            "mcwf_1"."metals_material_resources",
            "mcwf_1"."ozone_depletion",
            "mcwf_1"."particulate_matter_formation",
            "mcwf_1"."human_health_photochemical_ozone_creation",
            "mcwf_1"."terrestrial_photochemical_ozone_creation",
            "mcwf_1"."water_use",
            "mcwf_1"."weight_grams",
            "mcwf_1"."is_supplier_specific",
            "tt"."rn",
            "tt"."total_acidification",
            "tt"."total_global_warming",
            "tt"."total_freshwater_ecotoxicity",
            "tt"."total_marine_ecotoxicity",
            "tt"."total_terrestrial_ecotoxicity",
            "tt"."total_energy_resources",
            "tt"."total_freshwater_eutrophication",
            "tt"."total_marine_eutrophication",
            "tt"."total_carcinogenic_human_toxicity",
            "tt"."total_non_carcinogenic_human_toxicity",
            "tt"."total_ionizing_radiation",
            "tt"."total_land_use",
            "tt"."total_metals_material_resources",
            "tt"."total_ozone_depletion",
            "tt"."total_particulate_matter_formation",
            "tt"."total_human_health_photochemical_ozone_creation",
            "tt"."total_terrestrial_photochemical_ozone_creation",
            "tt"."total_water_use",
            0 AS "is_leaf",
                CASE
                    WHEN "mcwf_1"."is_supplier_specific" THEN 'supplier'::"text"
                    WHEN (("tt"."impact_source" = 'mixed'::"text") OR ("tt"."impact_source" = 'supplier'::"text")) THEN 'mixed'::"text"
                    WHEN ("tt"."impact_source" IS NULL) THEN "tt"."impact_source"
                    ELSE 'database'::"text"
                END AS "impact_source"
           FROM ("public"."rmh_material_composition_with_factors" "mcwf_1"
             JOIN "tree_traversal" "tt" ON (("mcwf_1"."id" = "tt"."parent_id")))
        ), "aggregated_results" AS (
         SELECT "tt"."id",
            "tt"."parent_id",
            "tt"."acidification",
            "tt"."global_warming",
            "tt"."freshwater_ecotoxicity",
            "tt"."marine_ecotoxicity",
            "tt"."terrestrial_ecotoxicity",
            "tt"."energy_resources",
            "tt"."freshwater_eutrophication",
            "tt"."marine_eutrophication",
            "tt"."carcinogenic_human_toxicity",
            "tt"."non_carcinogenic_human_toxicity",
            "tt"."ionizing_radiation",
            "tt"."land_use",
            "tt"."metals_material_resources",
            "tt"."ozone_depletion",
            "tt"."particulate_matter_formation",
            "tt"."human_health_photochemical_ozone_creation",
            "tt"."terrestrial_photochemical_ozone_creation",
            "tt"."water_use",
            "tt"."weight_grams",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."acidification") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_acidification"
                END) AS "total_acidification",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."global_warming") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_global_warming"
                END) AS "total_global_warming",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."freshwater_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_freshwater_ecotoxicity"
                END) AS "total_freshwater_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."marine_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_marine_ecotoxicity"
                END) AS "total_marine_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."terrestrial_ecotoxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_terrestrial_ecotoxicity"
                END) AS "total_terrestrial_ecotoxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."energy_resources") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_energy_resources"
                END) AS "total_energy_resources",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."freshwater_eutrophication") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_freshwater_eutrophication"
                END) AS "total_freshwater_eutrophication",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."marine_eutrophication") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_marine_eutrophication"
                END) AS "total_marine_eutrophication",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."carcinogenic_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_carcinogenic_human_toxicity"
                END) AS "total_carcinogenic_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."non_carcinogenic_human_toxicity") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_non_carcinogenic_human_toxicity"
                END) AS "total_non_carcinogenic_human_toxicity",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."ionizing_radiation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_ionizing_radiation"
                END) AS "total_ionizing_radiation",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."land_use") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_land_use"
                END) AS "total_land_use",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."metals_material_resources") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_metals_material_resources"
                END) AS "total_metals_material_resources",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."ozone_depletion") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_ozone_depletion"
                END) AS "total_ozone_depletion",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."particulate_matter_formation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_particulate_matter_formation"
                END) AS "total_particulate_matter_formation",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."human_health_photochemical_ozone_creation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_human_health_photochemical_ozone_creation"
                END) AS "total_human_health_photochemical_ozone_creation",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."terrestrial_photochemical_ozone_creation") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_terrestrial_photochemical_ozone_creation"
                END) AS "total_terrestrial_photochemical_ozone_creation",
            "sum"(
                CASE
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" = 1)) THEN ((("tt"."weight_grams")::double precision * "tt"."water_use") / (1000)::double precision)
                    WHEN ("tt"."is_supplier_specific" AND ("tt"."rn" <> 1)) THEN (0)::double precision
                    ELSE "tt"."total_water_use"
                END) AS "total_water_use",
            "tt"."is_leaf",
            "tt"."impact_source"
           FROM "tree_traversal" "tt"
          WHERE ("tt"."is_leaf" = 0)
          GROUP BY "tt"."id", "tt"."parent_id", "tt"."acidification", "tt"."global_warming", "tt"."freshwater_ecotoxicity", "tt"."marine_ecotoxicity", "tt"."terrestrial_ecotoxicity", "tt"."energy_resources", "tt"."freshwater_eutrophication", "tt"."marine_eutrophication", "tt"."carcinogenic_human_toxicity", "tt"."non_carcinogenic_human_toxicity", "tt"."ionizing_radiation", "tt"."land_use", "tt"."metals_material_resources", "tt"."ozone_depletion", "tt"."particulate_matter_formation", "tt"."human_health_photochemical_ozone_creation", "tt"."terrestrial_photochemical_ozone_creation", "tt"."water_use", "tt"."weight_grams", "tt"."is_leaf", "tt"."is_supplier_specific", "tt"."impact_source"
        ), "combined_results" AS (
         SELECT "tree_traversal"."id",
            "tree_traversal"."parent_id",
            "tree_traversal"."weight_grams",
            "tree_traversal"."total_acidification",
            "tree_traversal"."total_global_warming",
            "tree_traversal"."total_freshwater_ecotoxicity",
            "tree_traversal"."total_marine_ecotoxicity",
            "tree_traversal"."total_terrestrial_ecotoxicity",
            "tree_traversal"."total_energy_resources",
            "tree_traversal"."total_freshwater_eutrophication",
            "tree_traversal"."total_marine_eutrophication",
            "tree_traversal"."total_carcinogenic_human_toxicity",
            "tree_traversal"."total_non_carcinogenic_human_toxicity",
            "tree_traversal"."total_ionizing_radiation",
            "tree_traversal"."total_land_use",
            "tree_traversal"."total_metals_material_resources",
            "tree_traversal"."total_ozone_depletion",
            "tree_traversal"."total_particulate_matter_formation",
            "tree_traversal"."total_human_health_photochemical_ozone_creation",
            "tree_traversal"."total_terrestrial_photochemical_ozone_creation",
            "tree_traversal"."total_water_use",
            "tree_traversal"."is_leaf",
            "tree_traversal"."impact_source"
           FROM "tree_traversal"
          WHERE ("tree_traversal"."is_leaf" = 1)
        UNION ALL
         SELECT "aggregated_results"."id",
            "aggregated_results"."parent_id",
            "aggregated_results"."weight_grams",
            "aggregated_results"."total_acidification",
            "aggregated_results"."total_global_warming",
            "aggregated_results"."total_freshwater_ecotoxicity",
            "aggregated_results"."total_marine_ecotoxicity",
            "aggregated_results"."total_terrestrial_ecotoxicity",
            "aggregated_results"."total_energy_resources",
            "aggregated_results"."total_freshwater_eutrophication",
            "aggregated_results"."total_marine_eutrophication",
            "aggregated_results"."total_carcinogenic_human_toxicity",
            "aggregated_results"."total_non_carcinogenic_human_toxicity",
            "aggregated_results"."total_ionizing_radiation",
            "aggregated_results"."total_land_use",
            "aggregated_results"."total_metals_material_resources",
            "aggregated_results"."total_ozone_depletion",
            "aggregated_results"."total_particulate_matter_formation",
            "aggregated_results"."total_human_health_photochemical_ozone_creation",
            "aggregated_results"."total_terrestrial_photochemical_ozone_creation",
            "aggregated_results"."total_water_use",
            "aggregated_results"."is_leaf",
            "aggregated_results"."impact_source"
           FROM "aggregated_results"
        ), "combined_results_with_priority" AS (
         SELECT "combined_results"."id",
            "combined_results"."parent_id",
            "combined_results"."weight_grams",
            "combined_results"."total_acidification",
            "combined_results"."total_global_warming",
            "combined_results"."total_freshwater_ecotoxicity",
            "combined_results"."total_marine_ecotoxicity",
            "combined_results"."total_terrestrial_ecotoxicity",
            "combined_results"."total_energy_resources",
            "combined_results"."total_freshwater_eutrophication",
            "combined_results"."total_marine_eutrophication",
            "combined_results"."total_carcinogenic_human_toxicity",
            "combined_results"."total_non_carcinogenic_human_toxicity",
            "combined_results"."total_ionizing_radiation",
            "combined_results"."total_land_use",
            "combined_results"."total_metals_material_resources",
            "combined_results"."total_ozone_depletion",
            "combined_results"."total_particulate_matter_formation",
            "combined_results"."total_human_health_photochemical_ozone_creation",
            "combined_results"."total_terrestrial_photochemical_ozone_creation",
            "combined_results"."total_water_use",
            "combined_results"."is_leaf",
            "combined_results"."impact_source",
            "row_number"() OVER (PARTITION BY "combined_results"."id" ORDER BY
                CASE "combined_results"."impact_source"
                    WHEN 'supplier'::"text" THEN 1
                    WHEN 'mixed'::"text" THEN 2
                    ELSE 3
                END) AS "priority"
           FROM "combined_results"
        ), "filtered_combined_results" AS (
         SELECT "combined_results_with_priority"."id",
            "combined_results_with_priority"."parent_id",
            "combined_results_with_priority"."weight_grams",
            "combined_results_with_priority"."total_acidification",
            "combined_results_with_priority"."total_global_warming",
            "combined_results_with_priority"."total_freshwater_ecotoxicity",
            "combined_results_with_priority"."total_marine_ecotoxicity",
            "combined_results_with_priority"."total_terrestrial_ecotoxicity",
            "combined_results_with_priority"."total_energy_resources",
            "combined_results_with_priority"."total_freshwater_eutrophication",
            "combined_results_with_priority"."total_marine_eutrophication",
            "combined_results_with_priority"."total_carcinogenic_human_toxicity",
            "combined_results_with_priority"."total_non_carcinogenic_human_toxicity",
            "combined_results_with_priority"."total_ionizing_radiation",
            "combined_results_with_priority"."total_land_use",
            "combined_results_with_priority"."total_metals_material_resources",
            "combined_results_with_priority"."total_ozone_depletion",
            "combined_results_with_priority"."total_particulate_matter_formation",
            "combined_results_with_priority"."total_human_health_photochemical_ozone_creation",
            "combined_results_with_priority"."total_terrestrial_photochemical_ozone_creation",
            "combined_results_with_priority"."total_water_use",
            "combined_results_with_priority"."is_leaf",
            "combined_results_with_priority"."impact_source",
            "combined_results_with_priority"."priority"
           FROM "combined_results_with_priority"
          WHERE ("combined_results_with_priority"."priority" = 1)
        )
 SELECT "mcwf"."id",
    "mcwf"."created_at",
    "mcwf"."weight_grams",
    "mcwf"."org_id",
    "mcwf"."lca_id",
    "mcwf"."level",
    "mcwf"."parent_id",
    "mcwf"."leaf",
    "mcwf"."retake_part_id",
    "mcwf"."customer_part_id",
    "mcwf"."part_description",
    "mcwf"."origin",
    "mcwf"."manufacturing_process",
    "mcwf"."primary_material",
    "mcwf"."is_supplier_specific",
    "mcwf"."supplier_id",
    "mcwf"."factor_id",
    "mcwf"."reference_product_name",
    "mcwf"."activity_name",
    "mcwf"."database_name",
    "fcr"."total_acidification",
    "fcr"."total_global_warming",
    "fcr"."total_freshwater_ecotoxicity",
    "fcr"."total_marine_ecotoxicity",
    "fcr"."total_terrestrial_ecotoxicity",
    "fcr"."total_energy_resources",
    "fcr"."total_freshwater_eutrophication",
    "fcr"."total_marine_eutrophication",
    "fcr"."total_carcinogenic_human_toxicity",
    "fcr"."total_non_carcinogenic_human_toxicity",
    "fcr"."total_ionizing_radiation",
    "fcr"."total_land_use",
    "fcr"."total_metals_material_resources",
    "fcr"."total_ozone_depletion",
    "fcr"."total_particulate_matter_formation",
    "fcr"."total_human_health_photochemical_ozone_creation",
    "fcr"."total_terrestrial_photochemical_ozone_creation",
    "fcr"."total_water_use",
    "fcr"."is_leaf",
    "fcr"."impact_source"
   FROM ("public"."rmh_material_composition_with_factors" "mcwf"
     LEFT JOIN "filtered_combined_results" "fcr" ON (("mcwf"."id" = "fcr"."id")));


ALTER TABLE "public"."rmh_material_composition_with_impacts" OWNER TO "postgres";

--
-- Name: rmh_materials_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."rmh_materials_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_energy_resources" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_metals_material_resources" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_terrestrial_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."rmh_materials_results" OWNER TO "postgres";

--
-- Name: rmh_total_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."rmh_total_results" (
    "lca_id" "uuid" NOT NULL,
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_energy_resources" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_metals_material_resources" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_terrestrial_photochemical_ozone_creation" numeric,
    "total_water_use" numeric,
    "retake_part_id" "text",
    "customer_part_id" "text",
    "part_description" "text",
    "impact_source" "text",
    "materials_completed" boolean,
    "transportation_completed" boolean,
    "manufacturing_completed" boolean,
    "use_phase_completed" boolean,
    "end_of_life_completed" boolean,
    "org_id" "text",
    "weight_grams" numeric,
    "long_description" "text",
    "material_composition_id" "text"
);


ALTER TABLE "public"."rmh_total_results" OWNER TO "postgres";

--
-- Name: rmh_transportation_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."rmh_transportation_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_energy_resources" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_metals_material_resources" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_terrestrial_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."rmh_transportation_results" OWNER TO "postgres";

--
-- Name: rmh_transportation_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_transportation_with_impacts" AS
 SELECT "t"."id",
    "t"."created_at",
    "t"."origin",
    "t"."destination",
    "t"."distance_km",
    "t"."transportation_type",
    "t"."org_id",
    "t"."lca_id",
    "t"."factor_id",
    "t"."material_composition_id",
    "m"."weight_grams",
    "p"."customer_part_id",
    "p"."part_description",
    "f"."reference_product_name",
    "f"."activity_name",
    "f"."database_name",
    ((("f"."rmh_t_ac" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_acidification",
    ((("f"."rmh_g" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_global_warming",
    ((("f"."rmh_f_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_freshwater_ecotoxicity",
    ((("f"."rmh_m_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_marine_ecotoxicity",
    ((("f"."rmh_t_et" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_terrestrial_ecotoxicity",
    ((("f"."rmh_er" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_energy_resources",
    ((("f"."rmh_f_eu" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_freshwater_eutrophication",
    ((("f"."rmh_m_eu" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_marine_eutrophication",
    ((("f"."rmh_cht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_carcinogenic_human_toxicity",
    ((("f"."rmh_ncht" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_non_carcinogenic_human_toxicity",
    ((("f"."rmh_ir" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_ionizing_radiation",
    ((("f"."rmh_l" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_land_use",
    ((("f"."rmh_mm_r" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_metals_material_resources",
    ((("f"."rmh_od" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_ozone_depletion",
    ((("f"."rmh_pm" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_particulate_matter_formation",
    ((("f"."rmh_hh_oc" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_human_health_photochemical_ozone_creation",
    ((("f"."rmh_t_oc" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_terrestrial_photochemical_ozone_creation",
    ((("f"."rmh_w" * "m"."weight_grams") * "t"."distance_km") / (1000000)::numeric) AS "total_water_use"
   FROM ((("public"."transportation" "t"
     LEFT JOIN "public"."material_composition" "m" ON (("t"."material_composition_id" = "m"."id")))
     LEFT JOIN "public"."parts" "p" ON (("m"."retake_part_id" = "p"."retake_part_id")))
     LEFT JOIN "public"."third_party_factors" "f" ON (("t"."factor_id" = "f"."factor_id")));


ALTER TABLE "public"."rmh_transportation_with_impacts" OWNER TO "postgres";

--
-- Name: rmh_use_phase_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."rmh_use_phase_results" (
    "lca_id" "uuid" NOT NULL,
    "org_id" "text",
    "total_global_warming" numeric,
    "total_acidification" numeric,
    "total_freshwater_ecotoxicity" numeric,
    "total_marine_ecotoxicity" numeric,
    "total_terrestrial_ecotoxicity" numeric,
    "total_energy_resources" numeric,
    "total_freshwater_eutrophication" numeric,
    "total_marine_eutrophication" numeric,
    "total_carcinogenic_human_toxicity" numeric,
    "total_non_carcinogenic_human_toxicity" numeric,
    "total_ionizing_radiation" numeric,
    "total_land_use" numeric,
    "total_metals_material_resources" numeric,
    "total_ozone_depletion" numeric,
    "total_particulate_matter_formation" numeric,
    "total_human_health_photochemical_ozone_creation" numeric,
    "total_terrestrial_photochemical_ozone_creation" numeric,
    "total_water_use" numeric
);


ALTER TABLE "public"."rmh_use_phase_results" OWNER TO "postgres";

--
-- Name: rmh_use_phase_with_impacts; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW "public"."rmh_use_phase_with_impacts" AS
 SELECT "up"."id",
    "up"."org_id",
    "up"."lca_id",
    "up"."quantity",
    "up"."location",
    "up"."percent_at_location",
    "up"."factor_id",
    "up"."use_type",
    "s"."has_use_phase",
    "f"."reference_product_name",
    "f"."database_name",
    "f"."activity_name",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_t_ac" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_acidification",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_g" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_global_warming",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_f_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_freshwater_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_m_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_marine_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_t_et" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_terrestrial_ecotoxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_er" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_energy_resources",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_f_eu" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_freshwater_eutrophication",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_m_eu" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_marine_eutrophication",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_cht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_carcinogenic_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_ncht" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_non_carcinogenic_human_toxicity",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_ir" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_ionizing_radiation",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_l" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_land_use",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_mm_r" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_metals_material_resources",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_od" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_ozone_depletion",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_pm" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_particulate_matter_formation",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_hh_oc" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_human_health_photochemical_ozone_creation",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_t_oc" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_terrestrial_photochemical_ozone_creation",
        CASE
            WHEN ("s"."has_use_phase" = false) THEN (0)::numeric
            ELSE (((("f"."rmh_w" * "up"."quantity") * "s"."quantity") * "up"."percent_at_location") / (100)::numeric)
        END AS "total_water_use"
   FROM (("public"."use_phase" "up"
     JOIN "public"."third_party_factors" "f" ON (("f"."factor_id" = "up"."factor_id")))
     JOIN "public"."service_life" "s" ON (("s"."lca_id" = "up"."lca_id")));


ALTER TABLE "public"."rmh_use_phase_with_impacts" OWNER TO "postgres";

--
-- Name: seed_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."seed_companies" (
    "Company" "text",
    "Company Name for Emails" "text",
    "Account Stage" "text",
    "Lists" "text",
    "# Employees" bigint,
    "Industry" "text",
    "Account Owner" "text",
    "Website" "text",
    "Company Linkedin Url" "text",
    "Facebook Url" "text",
    "Twitter Url" "text",
    "Company Street" "text",
    "Company City" "text",
    "Company State" "text",
    "Company Country" "text",
    "Company Postal Code" "text",
    "Company Address" "text",
    "Keywords" "text",
    "Company Phone" "text",
    "SEO Description" "text",
    "Technologies" "text",
    "Total Funding" bigint,
    "Latest Funding" "text",
    "Latest Funding Amount" bigint,
    "Last Raised At" "text",
    "Annual Revenue" bigint,
    "Number of Retail Locations" "text",
    "Apollo Account Id" "text",
    "SIC Codes" "text",
    "Short Description" "text",
    "Founded Year" bigint,
    "Logo Url" "text"
);


ALTER TABLE "public"."seed_companies" OWNER TO "postgres";

--
-- Name: supported_utilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."supported_utilities" (
    "providerId" "text",
    "providerName" "text",
    "country" "text",
    "hasMFA" boolean,
    "RTCV" boolean,
    "serviceType" "text"
);


ALTER TABLE "public"."supported_utilities" OWNER TO "postgres";

--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."units" (
    "id" bigint NOT NULL,
    "name" "text"
);


ALTER TABLE "public"."units" OWNER TO "postgres";

--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."units" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."units_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."users" (
    "id" "text" NOT NULL,
    "email" "text",
    "email_verified" boolean,
    "name" "text",
    "family_name" "text",
    "given_name" "text",
    "nickname" "text",
    "locale" "text",
    "org_id" "text",
    "picture" "text",
    "sid" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "sub" "text",
    "custom_email_verified" boolean DEFAULT false,
    "sender_signature" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."vendors" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "website" "text"
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";

--
-- Name: regions Regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "Regions_pkey" PRIMARY KEY ("id");


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");


--
-- Name: cml_total_results cml_total_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."cml_total_results"
    ADD CONSTRAINT "cml_total_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: vendors constraint_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "constraint_name" UNIQUE ("name");


--
-- Name: ef_end_of_life_results ef_end_of_life_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."ef_end_of_life_results"
    ADD CONSTRAINT "ef_end_of_life_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: ef_manufacturing_results ef_manufacturing_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."ef_manufacturing_results"
    ADD CONSTRAINT "ef_manufacturing_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: ef_materials_results ef_materials_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."ef_materials_results"
    ADD CONSTRAINT "ef_materials_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: ef_total_results ef_total_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."ef_total_results"
    ADD CONSTRAINT "ef_total_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: ef_transportation_results ef_transportation_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."ef_transportation_results"
    ADD CONSTRAINT "ef_transportation_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: ef_use_phase_results ef_use_phase_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."ef_use_phase_results"
    ADD CONSTRAINT "ef_use_phase_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: end_of_life end_of_life_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."end_of_life"
    ADD CONSTRAINT "end_of_life_pkey" PRIMARY KEY ("id");


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."facilities"
    ADD CONSTRAINT "facilities_pkey" PRIMARY KEY ("id");


--
-- Name: facility_allocation facility_allocation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."facility_allocation"
    ADD CONSTRAINT "facility_allocation_pkey" PRIMARY KEY ("id");


--
-- Name: material_composition lcas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."material_composition"
    ADD CONSTRAINT "lcas_pkey" PRIMARY KEY ("id");


--
-- Name: messages_attachments messages_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages_attachments"
    ADD CONSTRAINT "messages_attachments_pkey" PRIMARY KEY ("id");


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");


--
-- Name: organization_email_servers organizations_email_servers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organization_email_servers"
    ADD CONSTRAINT "organizations_email_servers_pkey" PRIMARY KEY ("id");


--
-- Name: organizations organizations_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_id_key" UNIQUE ("id");


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");


--
-- Name: parts parts_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_id_key" UNIQUE ("retake_part_id");


--
-- Name: parts parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_pkey" PRIMARY KEY ("retake_part_id");


--
-- Name: parts_third_party_factors parts_third_party_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."parts_third_party_factors"
    ADD CONSTRAINT "parts_third_party_factors_pkey" PRIMARY KEY ("retake_part_id");


--
-- Name: cml_end_of_life_results pk_cml_end_of_life_results; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."cml_end_of_life_results"
    ADD CONSTRAINT "pk_cml_end_of_life_results" PRIMARY KEY ("lca_id");


--
-- Name: cml_manufacturing_results pk_cml_manufacturing_results; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."cml_manufacturing_results"
    ADD CONSTRAINT "pk_cml_manufacturing_results" PRIMARY KEY ("lca_id");


--
-- Name: cml_materials_results pk_cml_materials_results; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."cml_materials_results"
    ADD CONSTRAINT "pk_cml_materials_results" PRIMARY KEY ("lca_id");


--
-- Name: cml_transportation_results pk_cml_transportation_results; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."cml_transportation_results"
    ADD CONSTRAINT "pk_cml_transportation_results" PRIMARY KEY ("lca_id");


--
-- Name: cml_use_phase_results pk_cml_use_phase_results; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."cml_use_phase_results"
    ADD CONSTRAINT "pk_cml_use_phase_results" PRIMARY KEY ("lca_id");


--
-- Name: purchased_energy purchased_energy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."purchased_energy"
    ADD CONSTRAINT "purchased_energy_pkey" PRIMARY KEY ("id");


--
-- Name: retake_factors retake_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."retake_factors"
    ADD CONSTRAINT "retake_factors_pkey" PRIMARY KEY ("factor_id");


--
-- Name: rmh_end_of_life_results rmh_end_of_life_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rmh_end_of_life_results"
    ADD CONSTRAINT "rmh_end_of_life_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: rmh_manufacturing_results rmh_manufacturing_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rmh_manufacturing_results"
    ADD CONSTRAINT "rmh_manufacturing_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: rmh_materials_results rmh_materials_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rmh_materials_results"
    ADD CONSTRAINT "rmh_materials_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: rmh_total_results rmh_total_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rmh_total_results"
    ADD CONSTRAINT "rmh_total_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: rmh_transportation_results rmh_transportation_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rmh_transportation_results"
    ADD CONSTRAINT "rmh_transportation_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: rmh_use_phase_results rmh_use_phase_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rmh_use_phase_results"
    ADD CONSTRAINT "rmh_use_phase_results_pkey" PRIMARY KEY ("lca_id");


--
-- Name: service_life service_life_lca_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."service_life"
    ADD CONSTRAINT "service_life_lca_id_key" UNIQUE ("lca_id");


--
-- Name: service_life service_life_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."service_life"
    ADD CONSTRAINT "service_life_pkey" PRIMARY KEY ("id");


--
-- Name: stationary_fuel stationary_fuel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stationary_fuel"
    ADD CONSTRAINT "stationary_fuel_pkey" PRIMARY KEY ("id");


--
-- Name: supplier_product_engagement supplier_product_engagement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."supplier_product_engagement"
    ADD CONSTRAINT "supplier_product_engagement_pkey" PRIMARY KEY ("id");


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");


--
-- Name: third_party_factors third_party_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."third_party_factors"
    ADD CONSTRAINT "third_party_factors_pkey" PRIMARY KEY ("factor_id");


--
-- Name: transportation transportation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."transportation"
    ADD CONSTRAINT "transportation_pkey" PRIMARY KEY ("id");


--
-- Name: facility_allocation unique_facility_allocation_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."facility_allocation"
    ADD CONSTRAINT "unique_facility_allocation_id" UNIQUE ("facility_id", "lca_id");


--
-- Name: parts unique_org_part; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "unique_org_part" UNIQUE ("org_id", "customer_part_id");


--
-- Name: purchased_energy unique_purchased_energy; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."purchased_energy"
    ADD CONSTRAINT "unique_purchased_energy" UNIQUE ("facility_id", "year");


--
-- Name: stationary_fuel unique_stationary_fuel; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stationary_fuel"
    ADD CONSTRAINT "unique_stationary_fuel" UNIQUE ("facility_id", "year");


--
-- Name: suppliers unique_supplier; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "unique_supplier" UNIQUE ("name", "org_id");


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");


--
-- Name: use_phase use_phase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."use_phase"
    ADD CONSTRAINT "use_phase_pkey" PRIMARY KEY ("id");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");


--
-- Name: idx_material_composition_retake_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_material_composition_retake_id" ON "public"."material_composition" USING "btree" ("retake_part_id");


--
-- Name: idx_parts_id_factor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_parts_id_factor_id" ON "public"."parts_third_party_factors" USING "btree" ("retake_part_id", "factor_id");


--
-- Name: idx_third_party_factors_activity_name_trgm; Type: INDEX; Schema: public; Owner: postgres
--


CREATE INDEX "idx_third_party_factors_activity_name_trgm" ON "public"."third_party_factors" USING "gin" ("activity_name" "public"."gin_trgm_ops");


--
-- Name: idx_third_party_factors_reference_product_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_third_party_factors_reference_product_name" ON "public"."third_party_factors" USING "btree" ("reference_product_name");


--
-- Name: parts parts_trigger_ins; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "parts_trigger_ins" AFTER INSERT ON "public"."parts" REFERENCING NEW TABLE AS "new_table" FOR EACH STATEMENT EXECUTE FUNCTION "public"."notify_parts_change"();


--
-- Name: parts parts_trigger_upd; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "parts_trigger_upd" AFTER UPDATE ON "public"."parts" REFERENCING NEW TABLE AS "new_table" FOR EACH STATEMENT EXECUTE FUNCTION "public"."notify_parts_change"();


--
-- Name: activities activities_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");


--
-- Name: facilities facilities_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."facilities"
    ADD CONSTRAINT "facilities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");


--
-- Name: facility_allocation facility_allocation_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."facility_allocation"
    ADD CONSTRAINT "facility_allocation_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;


--
-- Name: transportation fk_material_composition; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."transportation"
    ADD CONSTRAINT "fk_material_composition" FOREIGN KEY ("material_composition_id") REFERENCES "public"."material_composition"("id") ON DELETE CASCADE;


--
-- Name: material_composition material_composition_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."material_composition"
    ADD CONSTRAINT "material_composition_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");


--
-- Name: messages_attachments messages_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages_attachments"
    ADD CONSTRAINT "messages_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id");


--
-- Name: messages messages_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");


--
-- Name: organization_email_servers organization_email_servers_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organization_email_servers"
    ADD CONSTRAINT "organization_email_servers_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");


--
-- Name: parts_third_party_factors parts_third_party_factors_retake_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."parts_third_party_factors"
    ADD CONSTRAINT "parts_third_party_factors_retake_part_id_fkey" FOREIGN KEY ("retake_part_id") REFERENCES "public"."parts"("retake_part_id") ON DELETE CASCADE;


--
-- Name: purchased_energy purchased_energy_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."purchased_energy"
    ADD CONSTRAINT "purchased_energy_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;


--
-- Name: stationary_fuel stationary_fuel_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stationary_fuel"
    ADD CONSTRAINT "stationary_fuel_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE CASCADE;


--
-- Name: users users_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");


--
-- Name: activities Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."activities" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: cml_end_of_life_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."cml_end_of_life_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: cml_manufacturing_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."cml_manufacturing_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: cml_materials_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."cml_materials_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: cml_total_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."cml_total_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: cml_transportation_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."cml_transportation_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: cml_use_phase_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."cml_use_phase_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: ef_end_of_life_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."ef_end_of_life_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: ef_manufacturing_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."ef_manufacturing_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: ef_materials_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."ef_materials_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: ef_total_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."ef_total_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: ef_transportation_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."ef_transportation_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: ef_use_phase_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."ef_use_phase_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: end_of_life Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."end_of_life" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: facilities Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."facilities" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: facility_allocation Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."facility_allocation" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: material_composition Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."material_composition" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: messages Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."messages" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: messages_attachments Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."messages_attachments" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: organization_email_servers Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."organization_email_servers" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: organizations Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."organizations" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: parts Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."parts" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: parts_third_party_factors Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."parts_third_party_factors" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: purchased_energy Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."purchased_energy" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: regions Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."regions" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: retake_factors Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."retake_factors" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: rmh_end_of_life_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."rmh_end_of_life_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: rmh_manufacturing_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."rmh_manufacturing_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: rmh_materials_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."rmh_materials_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: rmh_total_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."rmh_total_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: rmh_transportation_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."rmh_transportation_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: rmh_use_phase_results Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."rmh_use_phase_results" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: service_life Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."service_life" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: stationary_fuel Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."stationary_fuel" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: supplier_product_engagement Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."supplier_product_engagement" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: suppliers Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."suppliers" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: third_party_factors Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."third_party_factors" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: transportation Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."transportation" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: units Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."units" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: use_phase Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."use_phase" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: users Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."users" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: vendors Enable all for anon only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable all for anon only" ON "public"."vendors" TO "anon" USING (true) WITH CHECK (true);


--
-- Name: seed_companies Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."seed_companies" FOR SELECT USING (true);


--
-- Name: supported_utilities Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."supported_utilities" FOR SELECT USING (true);


--
-- Name: activities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;

--
-- Name: cml_end_of_life_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."cml_end_of_life_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: cml_manufacturing_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."cml_manufacturing_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: cml_materials_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."cml_materials_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: cml_total_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."cml_total_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: cml_transportation_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."cml_transportation_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: cml_use_phase_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."cml_use_phase_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: ef_end_of_life_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."ef_end_of_life_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: ef_manufacturing_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."ef_manufacturing_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: ef_materials_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."ef_materials_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: ef_total_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."ef_total_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: ef_transportation_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."ef_transportation_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: ef_use_phase_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."ef_use_phase_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: end_of_life; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."end_of_life" ENABLE ROW LEVEL SECURITY;

--
-- Name: facilities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."facilities" ENABLE ROW LEVEL SECURITY;

--
-- Name: facility_allocation; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."facility_allocation" ENABLE ROW LEVEL SECURITY;

--
-- Name: material_composition; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."material_composition" ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: messages_attachments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."messages_attachments" ENABLE ROW LEVEL SECURITY;

--
-- Name: organization_email_servers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."organization_email_servers" ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;

--
-- Name: parts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."parts" ENABLE ROW LEVEL SECURITY;

--
-- Name: parts_third_party_factors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."parts_third_party_factors" ENABLE ROW LEVEL SECURITY;

--
-- Name: purchased_energy; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."purchased_energy" ENABLE ROW LEVEL SECURITY;

--
-- Name: regions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."regions" ENABLE ROW LEVEL SECURITY;

--
-- Name: retake_factors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."retake_factors" ENABLE ROW LEVEL SECURITY;

--
-- Name: rmh_end_of_life_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."rmh_end_of_life_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: rmh_manufacturing_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."rmh_manufacturing_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: rmh_materials_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."rmh_materials_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: rmh_total_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."rmh_total_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: rmh_transportation_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."rmh_transportation_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: rmh_use_phase_results; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."rmh_use_phase_results" ENABLE ROW LEVEL SECURITY;

--
-- Name: seed_companies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."seed_companies" ENABLE ROW LEVEL SECURITY;

--
-- Name: service_life; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."service_life" ENABLE ROW LEVEL SECURITY;

--
-- Name: stationary_fuel; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."stationary_fuel" ENABLE ROW LEVEL SECURITY;

--
-- Name: supplier_product_engagement; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."supplier_product_engagement" ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;

--
-- Name: supported_utilities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."supported_utilities" ENABLE ROW LEVEL SECURITY;

--
-- Name: third_party_factors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."third_party_factors" ENABLE ROW LEVEL SECURITY;

--
-- Name: transportation; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."transportation" ENABLE ROW LEVEL SECURITY;

--
-- Name: units; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."units" ENABLE ROW LEVEL SECURITY;

--
-- Name: use_phase; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."use_phase" ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

--
-- Name: vendors; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "net"; Type: ACL; Schema: -; Owner: supabase_admin
--

-- GRANT USAGE ON SCHEMA "net" TO "supabase_functions_admin";
-- GRANT USAGE ON SCHEMA "net" TO "anon";
-- GRANT USAGE ON SCHEMA "net" TO "authenticated";
-- GRANT USAGE ON SCHEMA "net" TO "service_role";


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "gtrgm_in"("cstring"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";


--
-- Name: FUNCTION "gtrgm_out"("public"."gtrgm"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";


--
-- Name: FUNCTION "algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."armor"("bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea", "text"[], "text"[]); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "dashboard_user";


--
-- Name: FUNCTION "crypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."crypt"("text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "dearmor"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."dearmor"("text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."digest"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."digest"("text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_bytes"(integer); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_uuid"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_random_uuid"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_salt"("text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text", integer); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_salt"("text", integer) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "dashboard_user";


--
-- Name: FUNCTION "pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_key_id"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "sign"("payload" "json", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "try_cast_double"("inp" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_decode"("data" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."url_decode"("data" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_encode"("data" "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v1"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1mc"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v3"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v4"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v4"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v5"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_nil"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_nil"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_dns"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_dns"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_oid"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_oid"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_url"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_url"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_x500"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_x500"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "dashboard_user";


--
-- Name: FUNCTION "verify"("token" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "comment_directive"("comment_" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "service_role";


--
-- Name: FUNCTION "exception"("message" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "service_role";


--
-- Name: FUNCTION "get_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "service_role";


--
-- Name: FUNCTION "increment_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "service_role";


--
-- Name: FUNCTION "graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb"); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "anon";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "service_role";


--
-- Name: FUNCTION "http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer); Type: ACL; Schema: net; Owner: supabase_admin
--

-- REVOKE ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) FROM PUBLIC;
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "supabase_functions_admin";
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "postgres";
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "anon";
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "authenticated";
-- GRANT ALL ON FUNCTION "net"."http_get"("url" "text", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "service_role";


--
-- Name: FUNCTION "http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer); Type: ACL; Schema: net; Owner: supabase_admin
--

-- REVOKE ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) FROM PUBLIC;
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "supabase_functions_admin";
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "postgres";
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "anon";
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "authenticated";
-- GRANT ALL ON FUNCTION "net"."http_post"("url" "text", "body" "jsonb", "params" "jsonb", "headers" "jsonb", "timeout_milliseconds" integer) TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_keygen"(); Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "service_role";


--
-- Name: FUNCTION "emissions_factors"("categ" "text", "units" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."emissions_factors"("categ" "text", "units" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."emissions_factors"("categ" "text", "units" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."emissions_factors"("categ" "text", "units" "text") TO "service_role";


--
-- Name: FUNCTION "get_campaigns"("org_id" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_campaigns"("org_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaigns"("org_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaigns"("org_id" "text") TO "service_role";


--
-- Name: FUNCTION "get_categories"("input_org_id" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_categories"("input_org_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_categories"("input_org_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_categories"("input_org_id" "text") TO "service_role";


--
-- Name: FUNCTION "get_documents"("input_org_id" "text", "file_type" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_documents"("input_org_id" "text", "file_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_documents"("input_org_id" "text", "file_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_documents"("input_org_id" "text", "file_type" "text") TO "service_role";


--
-- Name: FUNCTION "get_sorted_years"("input_org_id" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_sorted_years"("input_org_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sorted_years"("input_org_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sorted_years"("input_org_id" "text") TO "service_role";


--
-- Name: FUNCTION "get_total_kg_co2e"("ghg_category" "text", "year" numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "year" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "year" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "year" numeric) TO "service_role";


--
-- Name: FUNCTION "get_total_kg_co2e"("ghg_category" "text", "input_org_id" "text", "year" numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "input_org_id" "text", "year" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "input_org_id" "text", "year" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_total_kg_co2e"("ghg_category" "text", "input_org_id" "text", "year" numeric) TO "service_role";


--
-- Name: FUNCTION "get_vendors_by_year"("org_id" "text", "year" numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_vendors_by_year"("org_id" "text", "year" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vendors_by_year"("org_id" "text", "year" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vendors_by_year"("org_id" "text", "year" numeric) TO "service_role";


--
-- Name: FUNCTION "gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";


--
-- Name: FUNCTION "gin_extract_value_trgm"("text", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";


--
-- Name: FUNCTION "gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";


--
-- Name: FUNCTION "gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_compress"("internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_consistent"("internal", "text", smallint, "oid", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_decompress"("internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_distance"("internal", "text", smallint, "oid", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_options"("internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_penalty"("internal", "internal", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_picksplit"("internal", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";


--
-- Name: FUNCTION "gtrgm_union"("internal", "internal"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";


--
-- Name: FUNCTION "notify_parts_change"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."notify_parts_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_parts_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_parts_change"() TO "service_role";


--
-- Name: FUNCTION "set_limit"(real); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";


--
-- Name: FUNCTION "show_limit"(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";


--
-- Name: FUNCTION "show_trgm"("text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";


--
-- Name: FUNCTION "similarity"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";


--
-- Name: FUNCTION "similarity_dist"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";


--
-- Name: FUNCTION "similarity_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "strict_word_similarity"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";


--
-- Name: FUNCTION "strict_word_similarity_commutator_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "strict_word_similarity_dist_commutator_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "strict_word_similarity_dist_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "strict_word_similarity_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "validate_organization_name"("org_name" "text"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."validate_organization_name"("org_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_organization_name"("org_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_organization_name"("org_name" "text") TO "service_role";


--
-- Name: FUNCTION "word_similarity"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";


--
-- Name: FUNCTION "word_similarity_commutator_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "word_similarity_dist_commutator_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "word_similarity_dist_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";


--
-- Name: FUNCTION "word_similarity_op"("text", "text"); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


--
-- Name: TABLE "pg_stat_statements"; Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON TABLE "extensions"."pg_stat_statements" FROM "postgres";
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "dashboard_user";


--
-- Name: TABLE "pg_stat_statements_info"; Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON TABLE "extensions"."pg_stat_statements_info" FROM "postgres";
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "dashboard_user";


--
-- Name: SEQUENCE "seq_schema_version"; Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "postgres";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "anon";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "authenticated";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "service_role";


--
-- Name: TABLE "decrypted_key"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."decrypted_key" TO "pgsodium_keyholder";


--
-- Name: TABLE "masking_rule"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."masking_rule" TO "pgsodium_keyholder";


--
-- Name: TABLE "mask_columns"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."mask_columns" TO "pgsodium_keyholder";


--
-- Name: TABLE "activities"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";


--
-- Name: TABLE "cml_end_of_life_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_end_of_life_results" TO "anon";
GRANT ALL ON TABLE "public"."cml_end_of_life_results" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_end_of_life_results" TO "service_role";


--
-- Name: TABLE "end_of_life"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."end_of_life" TO "anon";
GRANT ALL ON TABLE "public"."end_of_life" TO "authenticated";
GRANT ALL ON TABLE "public"."end_of_life" TO "service_role";


--
-- Name: TABLE "third_party_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."third_party_factors" TO "anon";
GRANT ALL ON TABLE "public"."third_party_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."third_party_factors" TO "service_role";


--
-- Name: TABLE "cml_end_of_life_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_end_of_life_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_end_of_life_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_end_of_life_with_impacts" TO "service_role";


--
-- Name: TABLE "purchased_energy"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."purchased_energy" TO "anon";
GRANT ALL ON TABLE "public"."purchased_energy" TO "authenticated";
GRANT ALL ON TABLE "public"."purchased_energy" TO "service_role";


--
-- Name: TABLE "cml_purchased_energy_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_purchased_energy_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_purchased_energy_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_purchased_energy_with_impacts" TO "service_role";


--
-- Name: TABLE "stationary_fuel"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."stationary_fuel" TO "anon";
GRANT ALL ON TABLE "public"."stationary_fuel" TO "authenticated";
GRANT ALL ON TABLE "public"."stationary_fuel" TO "service_role";


--
-- Name: TABLE "cml_stationary_fuel_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_stationary_fuel_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_stationary_fuel_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_stationary_fuel_with_impacts" TO "service_role";


--
-- Name: TABLE "facilities"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."facilities" TO "anon";
GRANT ALL ON TABLE "public"."facilities" TO "authenticated";
GRANT ALL ON TABLE "public"."facilities" TO "service_role";


--
-- Name: TABLE "cml_facility_energy_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_facility_energy_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_facility_energy_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_facility_energy_with_impacts" TO "service_role";


--
-- Name: TABLE "facility_allocation"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."facility_allocation" TO "anon";
GRANT ALL ON TABLE "public"."facility_allocation" TO "authenticated";
GRANT ALL ON TABLE "public"."facility_allocation" TO "service_role";


--
-- Name: TABLE "cml_facility_allocation_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_facility_allocation_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_facility_allocation_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_facility_allocation_with_impacts" TO "service_role";


--
-- Name: TABLE "cml_manufacturing_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_manufacturing_results" TO "anon";
GRANT ALL ON TABLE "public"."cml_manufacturing_results" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_manufacturing_results" TO "service_role";


--
-- Name: TABLE "material_composition"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."material_composition" TO "anon";
GRANT ALL ON TABLE "public"."material_composition" TO "authenticated";
GRANT ALL ON TABLE "public"."material_composition" TO "service_role";


--
-- Name: TABLE "parts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."parts" TO "anon";
GRANT ALL ON TABLE "public"."parts" TO "authenticated";
GRANT ALL ON TABLE "public"."parts" TO "service_role";


--
-- Name: TABLE "parts_third_party_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."parts_third_party_factors" TO "anon";
GRANT ALL ON TABLE "public"."parts_third_party_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."parts_third_party_factors" TO "service_role";


--
-- Name: TABLE "parts_with_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."parts_with_factors" TO "anon";
GRANT ALL ON TABLE "public"."parts_with_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."parts_with_factors" TO "service_role";


--
-- Name: TABLE "retake_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."retake_factors" TO "anon";
GRANT ALL ON TABLE "public"."retake_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."retake_factors" TO "service_role";


--
-- Name: TABLE "cml_material_composition_with_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_material_composition_with_factors" TO "anon";
GRANT ALL ON TABLE "public"."cml_material_composition_with_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_material_composition_with_factors" TO "service_role";


--
-- Name: TABLE "cml_material_composition_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_material_composition_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_material_composition_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_material_composition_with_impacts" TO "service_role";


--
-- Name: TABLE "cml_materials_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_materials_results" TO "anon";
GRANT ALL ON TABLE "public"."cml_materials_results" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_materials_results" TO "service_role";


--
-- Name: TABLE "parts_by_supplier"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."parts_by_supplier" TO "anon";
GRANT ALL ON TABLE "public"."parts_by_supplier" TO "authenticated";
GRANT ALL ON TABLE "public"."parts_by_supplier" TO "service_role";


--
-- Name: TABLE "parts_by_supplier_with_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."parts_by_supplier_with_factors" TO "anon";
GRANT ALL ON TABLE "public"."parts_by_supplier_with_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."parts_by_supplier_with_factors" TO "service_role";


--
-- Name: TABLE "supplier_product_engagement"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."supplier_product_engagement" TO "anon";
GRANT ALL ON TABLE "public"."supplier_product_engagement" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_product_engagement" TO "service_role";


--
-- Name: TABLE "suppliers"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";


--
-- Name: TABLE "cml_parts_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_parts_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_parts_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_parts_with_impacts" TO "service_role";


--
-- Name: TABLE "cml_total_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_total_results" TO "anon";
GRANT ALL ON TABLE "public"."cml_total_results" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_total_results" TO "service_role";


--
-- Name: TABLE "cml_transportation_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_transportation_results" TO "anon";
GRANT ALL ON TABLE "public"."cml_transportation_results" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_transportation_results" TO "service_role";


--
-- Name: TABLE "transportation"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."transportation" TO "anon";
GRANT ALL ON TABLE "public"."transportation" TO "authenticated";
GRANT ALL ON TABLE "public"."transportation" TO "service_role";


--
-- Name: TABLE "cml_transportation_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_transportation_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_transportation_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_transportation_with_impacts" TO "service_role";


--
-- Name: TABLE "cml_use_phase_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_use_phase_results" TO "anon";
GRANT ALL ON TABLE "public"."cml_use_phase_results" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_use_phase_results" TO "service_role";


--
-- Name: TABLE "service_life"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."service_life" TO "anon";
GRANT ALL ON TABLE "public"."service_life" TO "authenticated";
GRANT ALL ON TABLE "public"."service_life" TO "service_role";


--
-- Name: TABLE "use_phase"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."use_phase" TO "anon";
GRANT ALL ON TABLE "public"."use_phase" TO "authenticated";
GRANT ALL ON TABLE "public"."use_phase" TO "service_role";


--
-- Name: TABLE "cml_use_phase_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."cml_use_phase_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."cml_use_phase_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."cml_use_phase_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_end_of_life_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_end_of_life_results" TO "anon";
GRANT ALL ON TABLE "public"."ef_end_of_life_results" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_end_of_life_results" TO "service_role";


--
-- Name: TABLE "ef_end_of_life_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_end_of_life_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_end_of_life_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_end_of_life_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_purchased_energy_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_purchased_energy_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_purchased_energy_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_purchased_energy_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_stationary_fuel_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_stationary_fuel_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_stationary_fuel_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_stationary_fuel_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_facility_energy_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_facility_energy_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_facility_energy_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_facility_energy_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_facility_allocation_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_facility_allocation_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_facility_allocation_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_facility_allocation_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_manufacturing_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_manufacturing_results" TO "anon";
GRANT ALL ON TABLE "public"."ef_manufacturing_results" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_manufacturing_results" TO "service_role";


--
-- Name: TABLE "ef_material_composition_with_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_material_composition_with_factors" TO "anon";
GRANT ALL ON TABLE "public"."ef_material_composition_with_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_material_composition_with_factors" TO "service_role";


--
-- Name: TABLE "ef_material_composition_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_material_composition_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_material_composition_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_material_composition_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_materials_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_materials_results" TO "anon";
GRANT ALL ON TABLE "public"."ef_materials_results" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_materials_results" TO "service_role";


--
-- Name: TABLE "ef_total_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_total_results" TO "anon";
GRANT ALL ON TABLE "public"."ef_total_results" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_total_results" TO "service_role";


--
-- Name: TABLE "ef_transportation_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_transportation_results" TO "anon";
GRANT ALL ON TABLE "public"."ef_transportation_results" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_transportation_results" TO "service_role";


--
-- Name: TABLE "ef_transportation_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_transportation_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_transportation_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_transportation_with_impacts" TO "service_role";


--
-- Name: TABLE "ef_use_phase_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_use_phase_results" TO "anon";
GRANT ALL ON TABLE "public"."ef_use_phase_results" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_use_phase_results" TO "service_role";


--
-- Name: TABLE "ef_use_phase_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."ef_use_phase_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."ef_use_phase_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."ef_use_phase_with_impacts" TO "service_role";


--
-- Name: TABLE "material_composition_with_descriptions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."material_composition_with_descriptions" TO "anon";
GRANT ALL ON TABLE "public"."material_composition_with_descriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."material_composition_with_descriptions" TO "service_role";


--
-- Name: TABLE "messages"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";


--
-- Name: TABLE "messages_attachments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."messages_attachments" TO "anon";
GRANT ALL ON TABLE "public"."messages_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."messages_attachments" TO "service_role";


--
-- Name: TABLE "organization_email_servers"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."organization_email_servers" TO "anon";
GRANT ALL ON TABLE "public"."organization_email_servers" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_email_servers" TO "service_role";


--
-- Name: TABLE "organizations"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";


--
-- Name: SEQUENCE "organizations_email_servers_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."organizations_email_servers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."organizations_email_servers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."organizations_email_servers_id_seq" TO "service_role";


--
-- Name: TABLE "parts_engagement_status"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."parts_engagement_status" TO "anon";
GRANT ALL ON TABLE "public"."parts_engagement_status" TO "authenticated";
GRANT ALL ON TABLE "public"."parts_engagement_status" TO "service_role";


--
-- Name: TABLE "regions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."regions" TO "anon";
GRANT ALL ON TABLE "public"."regions" TO "authenticated";
GRANT ALL ON TABLE "public"."regions" TO "service_role";


--
-- Name: TABLE "rmh_end_of_life_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_end_of_life_results" TO "anon";
GRANT ALL ON TABLE "public"."rmh_end_of_life_results" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_end_of_life_results" TO "service_role";


--
-- Name: TABLE "rmh_end_of_life_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_end_of_life_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_end_of_life_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_end_of_life_with_impacts" TO "service_role";


--
-- Name: TABLE "rmh_purchased_energy_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_purchased_energy_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_purchased_energy_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_purchased_energy_with_impacts" TO "service_role";


--
-- Name: TABLE "rmh_stationary_fuel_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_stationary_fuel_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_stationary_fuel_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_stationary_fuel_with_impacts" TO "service_role";


--
-- Name: TABLE "rmh_facility_energy_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_facility_energy_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_facility_energy_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_facility_energy_with_impacts" TO "service_role";


--
-- Name: TABLE "rmh_facility_allocation_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_facility_allocation_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_facility_allocation_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_facility_allocation_with_impacts" TO "service_role";


--
-- Name: TABLE "rmh_manufacturing_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_manufacturing_results" TO "anon";
GRANT ALL ON TABLE "public"."rmh_manufacturing_results" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_manufacturing_results" TO "service_role";


--
-- Name: TABLE "rmh_material_composition_with_factors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_material_composition_with_factors" TO "anon";
GRANT ALL ON TABLE "public"."rmh_material_composition_with_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_material_composition_with_factors" TO "service_role";


--
-- Name: TABLE "rmh_material_composition_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_material_composition_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_material_composition_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_material_composition_with_impacts" TO "service_role";


--
-- Name: TABLE "rmh_materials_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_materials_results" TO "anon";
GRANT ALL ON TABLE "public"."rmh_materials_results" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_materials_results" TO "service_role";


--
-- Name: TABLE "rmh_total_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_total_results" TO "anon";
GRANT ALL ON TABLE "public"."rmh_total_results" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_total_results" TO "service_role";


--
-- Name: TABLE "rmh_transportation_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_transportation_results" TO "anon";
GRANT ALL ON TABLE "public"."rmh_transportation_results" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_transportation_results" TO "service_role";


--
-- Name: TABLE "rmh_transportation_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_transportation_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_transportation_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_transportation_with_impacts" TO "service_role";


--
-- Name: TABLE "rmh_use_phase_results"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_use_phase_results" TO "anon";
GRANT ALL ON TABLE "public"."rmh_use_phase_results" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_use_phase_results" TO "service_role";


--
-- Name: TABLE "rmh_use_phase_with_impacts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rmh_use_phase_with_impacts" TO "anon";
GRANT ALL ON TABLE "public"."rmh_use_phase_with_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rmh_use_phase_with_impacts" TO "service_role";


--
-- Name: TABLE "seed_companies"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."seed_companies" TO "anon";
GRANT ALL ON TABLE "public"."seed_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."seed_companies" TO "service_role";


--
-- Name: TABLE "supported_utilities"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."supported_utilities" TO "anon";
GRANT ALL ON TABLE "public"."supported_utilities" TO "authenticated";
GRANT ALL ON TABLE "public"."supported_utilities" TO "service_role";


--
-- Name: TABLE "units"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."units" TO "anon";
GRANT ALL ON TABLE "public"."units" TO "authenticated";
GRANT ALL ON TABLE "public"."units" TO "service_role";


--
-- Name: SEQUENCE "units_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."units_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."units_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."units_id_seq" TO "service_role";


--
-- Name: TABLE "users"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";


--
-- Name: TABLE "vendors"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- PostgreSQL database dump complete
--

RESET ALL;
