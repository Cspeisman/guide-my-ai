PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_mcps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Untitled MCP' NOT NULL,
	`slug` text NOT NULL,
	`context` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Generate slugs for existing mcps from their names
INSERT INTO `__new_mcps`("id", "name", "slug", "context", "userId", "createdAt", "updatedAt") 
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
  "context",
  "userId", 
  "createdAt", 
  "updatedAt" 
FROM `mcps`;--> statement-breakpoint
DROP TABLE `mcps`;--> statement-breakpoint
ALTER TABLE `__new_mcps` RENAME TO `mcps`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_mcp_slug` ON `mcps` (`userId`,`slug`);