CREATE TABLE "relay_miners" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "relay_miners_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"identity" varchar(66) NOT NULL,
	"region" varchar(255) NOT NULL,
	"domain" varchar(255),
	"createdAt" timestamp DEFAULT now(),
	"createdBy" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"updatedBy" varchar(255) NOT NULL,
	CONSTRAINT "relay_miners_identity_unique" UNIQUE("identity")
);
--> statement-breakpoint
ALTER TABLE "address_groups" DROP CONSTRAINT "address_groups_name_unique";--> statement-breakpoint
ALTER TABLE "address_groups" ADD COLUMN "relay_miner_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "relay_miners" ADD CONSTRAINT "relay_miners_createdBy_users_identity_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relay_miners" ADD CONSTRAINT "relay_miners_updatedBy_users_identity_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "address_groups" ADD CONSTRAINT "address_groups_relay_miner_id_relay_miners_id_fk" FOREIGN KEY ("relay_miner_id") REFERENCES "public"."relay_miners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "address_groups" DROP COLUMN "region";--> statement-breakpoint
ALTER TABLE "address_groups" DROP COLUMN "domain";