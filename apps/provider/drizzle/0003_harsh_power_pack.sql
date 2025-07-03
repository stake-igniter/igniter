ALTER TABLE "keys" ADD COLUMN "ownerAddress" varchar(255) DEFAULT '';--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_address_unique" UNIQUE("address");--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_publicKey_unique" UNIQUE("publicKey");