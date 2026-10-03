CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`age` integer NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`tier` text DEFAULT 'Standard' NOT NULL,
	`is_new` integer DEFAULT false,
	`is_verified` integer DEFAULT false,
	`status` text DEFAULT 'recent' NOT NULL,
	`pics_count` integer DEFAULT 0 NOT NULL,
	`vids_count` integer,
	`photo_url` text,
	`about` text,
	`phone` text NOT NULL,
	`whatsapp` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_slug_unique` ON `profiles` (`slug`);