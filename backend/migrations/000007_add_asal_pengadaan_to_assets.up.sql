-- +migrate Up
-- Add asal_pengadaan column to assets table
ALTER TABLE assets ADD COLUMN asal_pengadaan VARCHAR(255);

-- +migrate Down
-- Remove asal_pengadaan column from assets table
ALTER TABLE assets DROP COLUMN asal_pengadaan;
