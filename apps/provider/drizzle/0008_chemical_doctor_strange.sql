ALTER TABLE "keys" ADD COLUMN "remediationHistory" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "delegatorRevSharePercentage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "delegatorRewardsAddress" varchar(255) DEFAULT '';