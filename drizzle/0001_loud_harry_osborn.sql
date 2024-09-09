CREATE TABLE IF NOT EXISTS "tposts" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text,
	"author_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tusers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text
);
--> statement-breakpoint
ALTER TABLE "menu_item" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "menu_item" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order_item" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "order_item" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "review" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;