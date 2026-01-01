PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Untitled Profile' NOT NULL,
	`slug` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Generate slugs for existing profiles from their names
INSERT INTO `__new_profiles`("id", "name", "slug", "userId", "createdAt", "updatedAt") 
SELECT 
  "id", 
  "name", 
  LOWER(
    REPLACE(
      REPLACE(
        REPLACE(TRIM("name"), ' ', '-'),
        '_', '-'
      ),
      '--', '-'
    )
  ) as slug,
  "userId", 
  "createdAt", 
  "updatedAt" 
FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_slug` ON `profiles` (`userId`,`slug`);