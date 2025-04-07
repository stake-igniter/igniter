ALTER TABLE "transactions" ALTER COLUMN "signedPayload" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "application_settings" ADD COLUMN "delegatorRewardsAddress" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "delegatorRewardsAddress" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "fromAddress" varchar(255) NOT NULL;