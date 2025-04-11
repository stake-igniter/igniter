CREATE TYPE "public"."node_status" AS ENUM('staked', 'staking', 'unstaked', 'unstaking');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('healthy', 'unhealthy', 'unknown', 'unreachable');--> statement-breakpoint
CREATE TYPE "public"."tx_status" AS ENUM('pending', 'success', 'failure', 'not_executed');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('Stake', 'Unstake', 'Upstake', 'Operational Funds');--> statement-breakpoint
ALTER TYPE "public"."status" RENAME TO "activity_status";--> statement-breakpoint
ALTER TYPE "public"."type" RENAME TO "activity_type";--> statement-breakpoint
ALTER TYPE "public"."protocols" RENAME TO "blockchain_protocols";--> statement-breakpoint
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
ALTER TABLE "activity" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE tx_type;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DATA TYPE tx_status;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "activityId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "totalValue" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "userId" integer;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "status" "provider_status" DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "userId" integer;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "public"."activity" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."activity_status";--> statement-breakpoint
CREATE TYPE "public"."activity_status" AS ENUM('pending', 'success', 'failure', 'in_progress');--> statement-breakpoint
ALTER TABLE "public"."activity" ALTER COLUMN "status" SET DATA TYPE "public"."activity_status" USING "status"::"public"."activity_status";--> statement-breakpoint
ALTER TABLE "public"."activity" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."activity_type";--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('Stake', 'Unstake', 'Upstake', 'Operational Funds');--> statement-breakpoint
ALTER TABLE "public"."activity" ALTER COLUMN "type" SET DATA TYPE "public"."activity_type" USING "type"::"public"."activity_type";