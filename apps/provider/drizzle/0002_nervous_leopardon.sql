ALTER TABLE "address_groups" RENAME COLUMN "clients" TO "linkedAddresses";--> statement-breakpoint
ALTER TABLE "relay_miners" ALTER COLUMN "domain" SET NOT NULL;