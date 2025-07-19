CREATE TABLE "regions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "regions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"displayName" varchar(20) NOT NULL,
	"urlValue" varchar(20) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"createdBy" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"updatedBy" varchar(255) NOT NULL,
	CONSTRAINT "regions_displayName_unique" UNIQUE("displayName"),
	CONSTRAINT "regions_urlValue_unique" UNIQUE("urlValue")
);
--> statement-breakpoint
ALTER TABLE "application_settings" ADD COLUMN "indexerApiUrl" varchar;--> statement-breakpoint
ALTER TABLE "relay_miners" ADD COLUMN "region_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_createdBy_users_identity_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_updatedBy_users_identity_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relay_miners" ADD CONSTRAINT "relay_miners_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relay_miners" DROP COLUMN "region";