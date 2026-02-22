CREATE TABLE `profiles_to_skills` (
	`profileId` text NOT NULL,
	`skillId` text NOT NULL,
	`createdAt` integer NOT NULL,
	PRIMARY KEY(`profileId`, `skillId`),
	FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skillId`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_files` (
	`id` text PRIMARY KEY NOT NULL,
	`skillId` text NOT NULL,
	`fileName` text NOT NULL,
	`fileContent` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`skillId`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Untitled Skill' NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`userId` text NOT NULL,
	`communityDownloads` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_skill_slug` ON `skills` (`userId`,`slug`);