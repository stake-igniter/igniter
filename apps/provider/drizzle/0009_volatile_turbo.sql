ALTER TABLE "keys" ALTER COLUMN "state" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "keys" ALTER COLUMN "state" SET DEFAULT 'available'::text;--> statement-breakpoint
DROP TYPE "public"."address_states";--> statement-breakpoint
CREATE TYPE "public"."address_states" AS ENUM('imported', 'available', 'delivered', 'staking', 'remediation_failed', 'attention_needed', 'staked', 'stake_failed', 'unstaking', 'unstaked');--> statement-breakpoint
ALTER TABLE "keys" ALTER COLUMN "state" SET DEFAULT 'available'::"public"."address_states";--> statement-breakpoint
ALTER TABLE "keys" ALTER COLUMN "state" SET DATA TYPE "public"."address_states" USING "state"::"public"."address_states";--> statement-breakpoint
ALTER TABLE "application_settings" ADD COLUMN "initialOperationalFunds" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "application_settings" ADD COLUMN "minimumOperationalFunds" integer DEFAULT 2;