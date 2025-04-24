CREATE TYPE "public"."address_states" AS ENUM('available', 'delivered', 'staking', 'staked', 'stake_failed', 'unstaking', 'unstaked');--> statement-breakpoint
CREATE TYPE "public"."chain_ids" AS ENUM('pocket', 'pocket-beta', 'pocket-alpha');--> statement-breakpoint
CREATE TYPE "public"."key_management_strategy_types" AS ENUM('dynamic', 'manual');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'owner');--> statement-breakpoint
CREATE TYPE "public"."rpc_types" AS ENUM('UNKNOWN_RPC', 'GRPC', 'WEBSOCKET', 'JSON_RPC', 'REST', 'UNRECOGNIZED');--> statement-breakpoint
CREATE TABLE "address_group_services" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "address_group_services_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"addressGroupId" integer NOT NULL,
	"serviceId" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "address_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "address_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mnemonic" text NOT NULL,
	"identity" varchar(255) NOT NULL,
	"region" varchar(255) NOT NULL,
	"clients" varchar[] DEFAULT '{}',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "address_groups_identity_unique" UNIQUE("identity")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "addresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"address" varchar(255) NOT NULL,
	"publicKey" varchar(66) NOT NULL,
	"privateKey" text NOT NULL,
	"origin" "key_management_strategy_types" NOT NULL,
	"state" "address_states" DEFAULT 'available' NOT NULL,
	"deliveredAt" timestamp,
	"delegator_identity" varchar,
	"address_group_id" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "application_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "application_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"supportEmail" varchar(255),
	"ownerIdentity" varchar(255) NOT NULL,
	"ownerEmail" varchar(255),
	"providerFee" numeric(5, 2) NOT NULL,
	"delegatorRewardsAddress" varchar(255) NOT NULL,
	"chainId" "chain_ids" NOT NULL,
	"minimumStake" integer NOT NULL,
	"isBootstrapped" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chains" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chains_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"chainId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delegators" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "delegators_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"identity" varchar(255) NOT NULL,
	"publicKey" varchar(255) NOT NULL,
	"enabled" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "delegators_identity_unique" UNIQUE("identity"),
	CONSTRAINT "delegators_publicKey_unique" UNIQUE("publicKey")
);
--> statement-breakpoint
CREATE TABLE "key_management_strategies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "key_management_strategies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"weight" integer NOT NULL,
	"addressGroupAssignment" varchar(255) NOT NULL,
	"type" "key_management_strategy_types" NOT NULL,
	"disabled" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "key_management_strategies_weight_unique" UNIQUE("weight")
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
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "services_serviceId_unique" UNIQUE("serviceId"),
	CONSTRAINT "check_endpoints_not_empty" CHECK (jsonb_array_length(endpoints) > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"identity" varchar(255) NOT NULL,
	"email" varchar(255),
	"role" "role" NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "address_group_services" ADD CONSTRAINT "address_group_services_addressGroupId_address_groups_id_fk" FOREIGN KEY ("addressGroupId") REFERENCES "public"."address_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "address_group_services" ADD CONSTRAINT "address_group_services_serviceId_services_serviceId_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("serviceId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_delegator_identity_delegators_identity_fk" FOREIGN KEY ("delegator_identity") REFERENCES "public"."delegators"("identity") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_address_group_id_address_groups_id_fk" FOREIGN KEY ("address_group_id") REFERENCES "public"."address_groups"("id") ON DELETE no action ON UPDATE no action;