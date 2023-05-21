drop index if exists "public"."idx_third_party_factors_activity_name_trgm";

alter table "public"."third_party_factors" add column "activity_type" text;



