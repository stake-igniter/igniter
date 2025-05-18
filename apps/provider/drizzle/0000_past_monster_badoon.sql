CREATE TYPE "public"."address_states" AS ENUM('available', 'delivered', 'staking', 'staked', 'stake_failed', 'unstaking', 'unstaked');--> statement-breakpoint
CREATE TYPE "public"."chain_ids" AS ENUM('pocket', 'pocket-beta', 'pocket-alpha');--> statement-breakpoint
CREATE TYPE "public"."provider_fee" AS ENUM('up_to', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'owner');--> statement-breakpoint
CREATE TABLE "address_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "address_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"region" varchar(255) NOT NULL,
	"domain" varchar(255),
	"clients" varchar[] DEFAULT '{}',
	"services" varchar[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now(),
	"createdBy" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"updatedBy" varchar(255) NOT NULL,
	CONSTRAINT "address_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "application_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "application_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"appIdentity" uuid NOT NULL,
	"supportEmail" varchar(255),
	"ownerIdentity" varchar(255) NOT NULL,
	"ownerEmail" varchar(255),
	"fee" numeric(5, 2) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"delegatorRewardsAddress" varchar(255) NOT NULL,
	"chainId" "chain_ids" NOT NULL,
	"minimumStake" integer NOT NULL,
	"isBootstrapped" boolean NOT NULL,
	"rpcUrl" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"createdBy" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"updatedBy" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delegators" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "delegators_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"identity" varchar(255) NOT NULL,
	"publicKey" varchar(255) NOT NULL,
	"enabled" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"createdBy" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"updatedBy" varchar(255) NOT NULL,
	CONSTRAINT "delegators_identity_unique" UNIQUE("identity"),
	CONSTRAINT "delegators_publicKey_unique" UNIQUE("publicKey")
);
--> statement-breakpoint
CREATE TABLE "keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"address" varchar(255) NOT NULL,
	"publicKey" varchar(66) NOT NULL,
	"privateKey" text NOT NULL,
	"state" "address_states" DEFAULT 'available' NOT NULL,
	"deliveredAt" timestamp,
	"delegator_identity" varchar,
	"address_group_id" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "services_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"serviceId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"ownerAddress" varchar(255) NOT NULL,
	"computeUnits" integer NOT NULL,
	"revSharePercentage" integer,
	"endpoints" json NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"createdBy" varchar(255) NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"updatedBy" varchar(255) NOT NULL,
	CONSTRAINT "services_serviceId_unique" UNIQUE("serviceId"),
	CONSTRAINT "check_endpoints_not_empty" CHECK (json_array_length(endpoints) > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"identity" varchar(255) NOT NULL,
	"email" varchar(255),
	"role" "role" NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_identity_unique" UNIQUE("identity")
);
--> statement-breakpoint
ALTER TABLE "address_groups" ADD CONSTRAINT "address_groups_createdBy_users_identity_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "address_groups" ADD CONSTRAINT "address_groups_updatedBy_users_identity_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_settings" ADD CONSTRAINT "application_settings_createdBy_users_identity_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_settings" ADD CONSTRAINT "application_settings_updatedBy_users_identity_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegators" ADD CONSTRAINT "delegators_createdBy_users_identity_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegators" ADD CONSTRAINT "delegators_updatedBy_users_identity_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_delegator_identity_delegators_identity_fk" FOREIGN KEY ("delegator_identity") REFERENCES "public"."delegators"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_address_group_id_address_groups_id_fk" FOREIGN KEY ("address_group_id") REFERENCES "public"."address_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_createdBy_users_identity_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_updatedBy_users_identity_fk" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("identity") ON DELETE no action ON UPDATE no action;