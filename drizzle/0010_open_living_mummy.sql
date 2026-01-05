ALTER TABLE `rules` ADD `communityDownloads` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `mcps` ADD `communityDownloads` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `communityDownloads` integer DEFAULT 0 NOT NULL;