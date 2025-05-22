CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_categories_name ON asset_categories(name);

COMMENT ON TABLE asset_categories IS 'Table for storing asset categories';
COMMENT ON COLUMN asset_categories.id IS 'Unique identifier for the category';
COMMENT ON COLUMN asset_categories.name IS 'Name of the category';
COMMENT ON COLUMN asset_categories.description IS 'Description of the category';
