ALTER TABLE `quiz` ADD `question_count` integer;--> statement-breakpoint
ALTER TABLE `quiz` ADD `shuffle_questions` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz` ADD `shuffle_options` integer DEFAULT false NOT NULL;