ALTER TYPE "public"."address_states" ADD VALUE 'imported' BEFORE 'available';--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "lastUpdatedHeight" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "stakeOwner" varchar(255) DEFAULT '';--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "stakeAmountUpokt" bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "balanceUpokt" bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "services" json DEFAULT '[]'::json;