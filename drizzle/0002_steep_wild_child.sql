-- Add name column with a temporary default value
ALTER TABLE `rules` ADD `name` text NOT NULL DEFAULT 'Untitled Rule';

-- Remove the default for future inserts (SQLite doesn't support this directly, so we leave the default)