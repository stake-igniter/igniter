CREATE TYPE "public"."chain_ids" AS ENUM('pocket', 'pocket-beta', 'pocket-alpha');--> statement-breakpoint
CREATE TYPE "public"."node_status" AS ENUM('staked', 'staking', 'unstaked', 'unstaking');--> statement-breakpoint
CREATE TYPE "public"."provider_fee" AS ENUM('up_to', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('healthy', 'unhealthy', 'unknown', 'unreachable');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'owner');--> statement-breakpoint
CREATE TYPE "public"."tx_status" AS ENUM('pending', 'success', 'failure', 'not_executed');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('Stake', 'Unstake', 'Upstake', 'Operational Funds');--> statement-breakpoint
CREATE TABLE "application_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "application_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"appIdentity" uuid NOT NULL,
	"supportEmail" varchar(255),
	"ownerEmail" varchar(255),
	"ownerIdentity" varchar(255) NOT NULL,
	"fee" numeric(5, 2) NOT NULL,
	"minimumStake" integer DEFAULT 15000 NOT NULL,
	"isBootstrapped" boolean NOT NULL,
	"chainId" "chain_ids" NOT NULL,
	"delegatorRewardsAddress" varchar(255) NOT NULL,
	"rpcUrl" varchar NOT NULL,
	"privacyPolicy" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "nodes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"address" varchar(255) NOT NULL,
	"status" "node_status" NOT NULL,
	"stakeAmount" integer NOT NULL,
	"balance" bigint NOT NULL,
	"rewards" bigint NOT NULL,
	"serviceUrl" varchar(255),
	"chains" varchar(255)[],
	"providerId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"publicKey" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"enabled" boolean NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"fee" numeric DEFAULT '1.00' NOT NULL,
	"domains" text[] DEFAULT '{}',
	"regions" text[] DEFAULT '{}',
	"status" "provider_status" DEFAULT 'unknown' NOT NULL,
	"delegatorRewardsAddress" varchar(255) DEFAULT '',
	"minimumStake" integer DEFAULT 0 NOT NULL,
	"operationalFunds" integer DEFAULT 5 NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "providers_publicKey_unique" UNIQUE("publicKey")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hash" varchar(255),
	"type" "tx_type" NOT NULL,
	"status" "tx_status" NOT NULL,
	"executionHeight" integer,
	"executionTimestamp" timestamp,
	"verificationHeight" integer,
	"verificationTimestamp" timestamp,
	"dependsOn" integer,
	"signedPayload" varchar NOT NULL,
	"fromAddress" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"userId" integer,
	"unsignedPayload" varchar NOT NULL,
	"estimatedFee" integer NOT NULL,
	"consumedFee" integer NOT NULL,
	"providerFee" integer,
	"typeProviderFee" "provider_fee",
	"providerId" integer
);
--> statement-breakpoint
CREATE TABLE "transactions_to_nodes" (
	"transactionId" integer NOT NULL,
	"nodeId" integer NOT NULL,
	CONSTRAINT "transactions_to_nodes_transactionId_nodeId_pk" PRIMARY KEY("transactionId","nodeId")
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
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_dependsOn_transactions_id_fk" FOREIGN KEY ("dependsOn") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_providerId_providers_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions_to_nodes" ADD CONSTRAINT "transactions_to_nodes_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions_to_nodes" ADD CONSTRAINT "transactions_to_nodes_nodeId_nodes_id_fk" FOREIGN KEY ("nodeId") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;