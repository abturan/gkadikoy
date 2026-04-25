CREATE TABLE "citizen_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(50),
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"location" varchar(200),
	"imageUrl" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"articleId" integer NOT NULL,
	"authorName" varchar(200) NOT NULL,
	"authorEmail" varchar(320) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newspaper_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"issueNumber" integer NOT NULL,
	"title" varchar(300),
	"coverImageUrl" text NOT NULL,
	"pdfUrl" text NOT NULL,
	"publishDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newspaper_issues_issueNumber_unique" UNIQUE("issueNumber")
);
