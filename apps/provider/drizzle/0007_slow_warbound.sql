ALTER TYPE "public"."address_states" ADD VALUE 'misconfigured' BEFORE 'staked';--> statement-breakpoint
ALTER TYPE "public"."address_states" ADD VALUE 'remediation_failed' BEFORE 'staked';