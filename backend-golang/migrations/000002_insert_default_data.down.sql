-- Remove default data
-- This will clean up the default categories and locations

-- Remove default locations (in reverse order of insertion)
DELETE FROM locations WHERE code IN (
    'AP-EXT', 'GD-L1-SB', 'GD-L1-SA', 'GU-L2-RM', 
    'GU-L2-RD', 'GU-L1-RIT', 'GU-L1-RA'
);

-- Remove default asset categories
DELETE FROM asset_categories WHERE name IN (
    'Elektronik', 'Furniture', 'Kendaraan', 'Peralatan', 'Bangunan'
);