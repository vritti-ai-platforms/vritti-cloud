ALTER TABLE "cloud"."organizations" DROP COLUMN "market_id";--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" DROP CONSTRAINT "plan_prices_market_id_markets_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" RENAME COLUMN "market_id" TO "country_id";--> statement-breakpoint
ALTER TABLE "cloud"."plan_prices" ADD CONSTRAINT "plan_prices_country_id_countries_id_fkey" FOREIGN KEY ("country_id") REFERENCES "cloud"."countries"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" DROP CONSTRAINT "app_prices_market_id_markets_id_fkey";--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" RENAME COLUMN "market_id" TO "country_id";--> statement-breakpoint
ALTER TABLE "cloud"."app_prices" ADD CONSTRAINT "app_prices_country_id_countries_id_fkey" FOREIGN KEY ("country_id") REFERENCES "cloud"."countries"("id") ON DELETE CASCADE;--> statement-breakpoint
DROP TABLE "cloud"."market_countries" CASCADE;--> statement-breakpoint
DROP TABLE "cloud"."markets" CASCADE;
