ALTER TABLE assets 
ADD COLUMN asal_pengadaan VARCHAR(255),
ADD COLUMN lokasi_id INTEGER,
ADD CONSTRAINT fk_assets_location
    FOREIGN KEY (lokasi_id) 
    REFERENCES locations(id)
    ON DELETE SET NULL;
