CREATE TYPE "public"."status" AS ENUM('pending', 'success', 'failure', 'not_executed');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('stake', 'unstake', 'send');--> statement-breakpoint
CREATE TYPE "public"."protocols" AS ENUM('morse', 'shannon');--> statement-breakpoint
CREATE TYPE "public"."chain_ids" AS ENUM('mainnet', 'testnet');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'owner');--> statement-breakpoint
CREATE TABLE "activity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "type" NOT NULL,
	"status" "status" NOT NULL,
	"seenOn" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "application_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "application_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"supportEmail" varchar(255),
	"ownerEmail" varchar(255),
	"ownerIdentity" varchar(255) NOT NULL,
	"fee" numeric(5, 2) NOT NULL,
	"minimumStake" integer DEFAULT 15000 NOT NULL,
	"isBootstrapped" boolean NOT NULL,
	"chainId" "chain_ids" NOT NULL,
	"blockchainProtocol" "protocols" NOT NULL,
	"privacyPolicy" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
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
	"type" "type" NOT NULL,
	"status" "status" NOT NULL,
	"executionHeight" integer,
	"executionTimestamp" timestamp,
	"verificationHeight" integer,
	"verificationTimestamp" timestamp,
	"dependsOn" integer,
	"signedPayload" varchar,
	"signatureTimestamp" timestamp NOT NULL,
	"activityId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
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
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_dependsOn_transactions_id_fk" FOREIGN KEY ("dependsOn") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_activityId_activity_id_fk" FOREIGN KEY ("activityId") REFERENCES "public"."activity"("id") ON DELETE no action ON UPDATE no action;