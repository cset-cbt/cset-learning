ALTER TABLE "users" ADD COLUMN "moodle_user_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_moodle_user_id_unique" UNIQUE("moodle_user_id");