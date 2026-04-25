ALTER TYPE "public"."user_role" ADD VALUE 'editor';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'moderator';--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"userName" varchar(200) NOT NULL,
	"action" varchar(100) NOT NULL,
	"targetType" varchar(50),
	"targetId" integer,
	"details" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "passwordHash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true NOT NULL;