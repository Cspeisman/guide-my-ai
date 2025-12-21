CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Untitled Profile' NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_name_unique` ON `profiles` (`name`);--> statement-breakpoint
CREATE TABLE `profiles_to_mcps` (
	`profileId` text NOT NULL,
	`mcpId` text NOT NULL,
	`createdAt` integer NOT NULL,
	PRIMARY KEY(`profileId`, `mcpId`),
	FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mcpId`) REFERENCES `mcps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles_to_rules` (
	`profileId` text NOT NULL,
	`ruleId` text NOT NULL,
	`createdAt` integer NOT NULL,
	PRIMARY KEY(`profileId`, `ruleId`),
	FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ruleId`) REFERENCES `rules`(`id`) ON UPDATE no action ON DELETE cascade
);
