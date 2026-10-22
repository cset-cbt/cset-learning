CREATE TABLE `course_instructor` (
	`course_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'instructor' NOT NULL,
	`assigned_at` integer NOT NULL,
	PRIMARY KEY(`course_id`, `user_id`),
	FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
