DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."batch_status" AS ENUM('MANUFACTURED', 'WITH_DISTRIBUTOR', 'WITH_PHARMACY', 'PARTIALLY_SOLD', 'FULLY_SOLD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."event_type" AS ENUM('MANUFACTURED', 'DISTRIBUTOR_RECEIVED', 'PHARMACY_RECEIVED', 'SOLD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "actors" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"role" "role" NOT NULL,
	"name" varchar(100) NOT NULL,
	"license_number" varchar(50),
	"city" varchar(100),
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "actors_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_nonces" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"nonce" varchar(100) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batches" (
	"id" text PRIMARY KEY NOT NULL,
	"on_chain_id" varchar(66) NOT NULL,
	"medicine_name" varchar(100) NOT NULL,
	"batch_number" varchar(50) NOT NULL,
	"manufacture_date" timestamp NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"total_strips" integer NOT NULL,
	"status" "batch_status" DEFAULT 'MANUFACTURED' NOT NULL,
	"qr_image_url" text,
	"tx_hash" varchar(66),
	"is_expired" boolean DEFAULT false NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"manufacturer_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batches_on_chain_id_unique" UNIQUE("on_chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "counterfeit_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reported_qr" text NOT NULL,
	"reporter_ip" varchar(45),
	"city" varchar(100),
	"batch_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sale_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"on_chain_id" varchar(66) NOT NULL,
	"tablets_sold" integer NOT NULL,
	"qr_image_url" text,
	"tx_hash" varchar(66),
	"strip_id" text NOT NULL,
	"pharmacy_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sale_tokens_on_chain_id_unique" UNIQUE("on_chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "strips" (
	"id" text PRIMARY KEY NOT NULL,
	"on_chain_id" varchar(66) NOT NULL,
	"strip_number" integer NOT NULL,
	"tablets_total" integer NOT NULL,
	"tablets_remaining" integer NOT NULL,
	"qr_image_url" text,
	"is_sold" boolean DEFAULT false NOT NULL,
	"batch_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strips_on_chain_id_unique" UNIQUE("on_chain_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supply_chain_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" "event_type" NOT NULL,
	"actor_name" varchar(100) NOT NULL,
	"actor_city" varchar(100),
	"tx_hash" varchar(66),
	"batch_id" text NOT NULL,
	"actor_id" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batches" ADD CONSTRAINT "batches_manufacturer_id_actors_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "counterfeit_reports" ADD CONSTRAINT "counterfeit_reports_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sale_tokens" ADD CONSTRAINT "sale_tokens_strip_id_strips_id_fk" FOREIGN KEY ("strip_id") REFERENCES "public"."strips"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sale_tokens" ADD CONSTRAINT "sale_tokens_pharmacy_id_actors_id_fk" FOREIGN KEY ("pharmacy_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "strips" ADD CONSTRAINT "strips_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "supply_chain_events" ADD CONSTRAINT "supply_chain_events_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "supply_chain_events" ADD CONSTRAINT "supply_chain_events_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
