ALTER TABLE `user` ADD `githubUsername` text;--> statement-breakpoint
ALTER TABLE `user` ADD `githubUrl` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_name_unique` ON `user` (`name`);