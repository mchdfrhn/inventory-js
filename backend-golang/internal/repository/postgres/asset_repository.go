package postgres

import (
	"en-inventory/internal/domain"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// normalizeStatus ensures only valid status values are used
func normalizeStatus(status string) string {
	switch status {
	case "baik", "rusak", "tidak_memadai":
		return status
	case "available":
		return "baik"
	case "disposed":
		return "rusak"
	case "in_use", "maintenance":
		return "tidak_memadai"
	default:
		return "baik" // Default case
	}
}

type assetRepository struct {
	db *gorm.DB
}

func NewAssetRepository(db *gorm.DB) domain.AssetRepository {
	return &assetRepository{db: db}
}

func (r *assetRepository) Create(asset *domain.Asset) error {
	if asset.ID == uuid.Nil {
		asset.ID = uuid.New()
	}

	// Debug: Print asset data before saving
	fmt.Printf("Creating asset: %+v\n", asset)

	// Normalize status value
	asset.Status = normalizeStatus(asset.Status)

	// Calculate initial depreciation values
	umurEkonomisBulan := asset.UmurEkonomisTahun * 12
	asset.UmurEkonomisBulan = umurEkonomisBulan

	// Calculate months used
	now := time.Now()
	tahunPemakaian := now.Year() - asset.TanggalPerolehan.Year()
	bulanPemakaian := int(now.Month() - asset.TanggalPerolehan.Month())
	totalBulanPemakaian := tahunPemakaian*12 + bulanPemakaian

	// Ensure non-negative value
	if totalBulanPemakaian < 0 {
		totalBulanPemakaian = 0
	}

	// Cap depreciation at asset's economic life
	if totalBulanPemakaian > umurEkonomisBulan {
		totalBulanPemakaian = umurEkonomisBulan
	}

	// Calculate depreciation and remaining value
	if umurEkonomisBulan > 0 {
		penyusutanPerBulan := asset.HargaPerolehan / float64(umurEkonomisBulan)
		asset.AkumulasiPenyusutan = penyusutanPerBulan * float64(totalBulanPemakaian)
		// Round to 2 decimal places
		asset.AkumulasiPenyusutan = math.Round(asset.AkumulasiPenyusutan*100) / 100

		asset.NilaiSisa = asset.HargaPerolehan - asset.AkumulasiPenyusutan
		if asset.NilaiSisa < 0 {
			asset.NilaiSisa = 0
		}
		// Round to 2 decimal places
		asset.NilaiSisa = math.Round(asset.NilaiSisa*100) / 100
	}
	// Debug: Print specific fields we're concerned about
	fmt.Printf("Before Create - LokasiID: %v, AsalPengadaan: %v\n", asset.LokasiID, asset.AsalPengadaan)

	// Create the asset directly using the domain model
	result := r.db.Create(asset)
	if result.Error != nil {
		return fmt.Errorf("failed to create asset: %w", result.Error)
	}

	// Verify the data was saved correctly
	var savedAsset domain.Asset
	if err := r.db.First(&savedAsset, "id = ?", asset.ID).Error; err != nil {
		return fmt.Errorf("failed to verify saved asset: %w", err)
	}

	// Debug: Print the saved data
	fmt.Printf("After Create - LokasiID: %v, AsalPengadaan: %v\n", savedAsset.LokasiID, savedAsset.AsalPengadaan)

	return nil
}

func (r *assetRepository) Update(asset *domain.Asset) error {
	tx := r.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Normalize status value
	asset.Status = normalizeStatus(asset.Status)

	// Hitung ulang nilai penyusutan dan nilai sisa
	// Konversi umur ekonomis dari tahun ke bulan
	umurEkonomisBulan := asset.UmurEkonomisTahun * 12

	// Hitung masa pemakaian dalam bulan
	now := time.Now()
	tahunPemakaian := now.Year() - asset.TanggalPerolehan.Year()
	bulanPemakaian := int(now.Month() - asset.TanggalPerolehan.Month())
	totalBulanPemakaian := tahunPemakaian*12 + bulanPemakaian

	// Pastikan nilai tidak negatif
	if totalBulanPemakaian < 0 {
		totalBulanPemakaian = 0
	}

	// Batas penyusutan
	if totalBulanPemakaian > umurEkonomisBulan {
		totalBulanPemakaian = umurEkonomisBulan
	}

	// Hitung penyusutan dan nilai sisa
	var akumulasiPenyusutan, nilaiSisa float64
	if umurEkonomisBulan > 0 {
		penyusutanPerBulan := asset.HargaPerolehan / float64(umurEkonomisBulan)
		akumulasiPenyusutan = penyusutanPerBulan * float64(totalBulanPemakaian)
		// Bulatkan nilai ke 2 desimal
		akumulasiPenyusutan = math.Round(akumulasiPenyusutan*100) / 100

		nilaiSisa = asset.HargaPerolehan - akumulasiPenyusutan
		if nilaiSisa < 0 {
			nilaiSisa = 0
		}
		// Bulatkan nilai sisa ke 2 desimal
		nilaiSisa = math.Round(nilaiSisa*100) / 100
	}
	result := tx.Model(&domain.Asset{}).
		Where("id = ?", asset.ID).
		Updates(map[string]interface{}{
			"kode":                 asset.Kode,
			"nama":                 asset.Nama,
			"spesifikasi":          asset.Spesifikasi,
			"quantity":             asset.Quantity,
			"satuan":               asset.Satuan,
			"tanggal_perolehan":    asset.TanggalPerolehan,
			"harga_perolehan":      asset.HargaPerolehan,
			"umur_ekonomis_tahun":  asset.UmurEkonomisTahun,
			"umur_ekonomis_bulan":  umurEkonomisBulan,
			"akumulasi_penyusutan": akumulasiPenyusutan,
			"nilai_sisa":           nilaiSisa,
			"keterangan":           asset.Keterangan,
			"lokasi":               asset.Lokasi,
			"lokasi_id":            asset.LokasiID,
			"asal_pengadaan":       asset.AsalPengadaan,
			"category_id":          asset.CategoryID,
			"status":               asset.Status,
			"updated_at":           time.Now(),
		})

	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	if result.RowsAffected == 0 {
		tx.Rollback()
		return gorm.ErrRecordNotFound
	}
	// Reload the record with Category only
	if err := tx.Preload("Category").Preload("LocationInfo").First(asset, asset.ID).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// UpdateBulkAssets mengupdate semua asset dalam satu bulk berdasarkan bulk_id
func (r *assetRepository) UpdateBulkAssets(bulkID uuid.UUID, assetData *domain.Asset) error {
	tx := r.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Normalize status value
	assetData.Status = normalizeStatus(assetData.Status)

	// Hitung ulang nilai penyusutan dan nilai sisa
	// Konversi umur ekonomis dari tahun ke bulan
	umurEkonomisBulan := assetData.UmurEkonomisTahun * 12

	// Hitung masa pemakaian dalam bulan
	now := time.Now()
	tahunPemakaian := now.Year() - assetData.TanggalPerolehan.Year()
	bulanPemakaian := int(now.Month() - assetData.TanggalPerolehan.Month())
	totalBulanPemakaian := tahunPemakaian*12 + bulanPemakaian

	// Pastikan nilai tidak negatif
	if totalBulanPemakaian < 0 {
		totalBulanPemakaian = 0
	}

	// Batas penyusutan
	if totalBulanPemakaian > umurEkonomisBulan {
		totalBulanPemakaian = umurEkonomisBulan
	}

	// Hitung penyusutan dan nilai sisa
	var akumulasiPenyusutan, nilaiSisa float64
	if umurEkonomisBulan > 0 {
		penyusutanPerBulan := assetData.HargaPerolehan / float64(umurEkonomisBulan)
		akumulasiPenyusutan = penyusutanPerBulan * float64(totalBulanPemakaian)
		// Bulatkan nilai ke 2 desimal
		akumulasiPenyusutan = math.Round(akumulasiPenyusutan*100) / 100

		nilaiSisa = assetData.HargaPerolehan - akumulasiPenyusutan
		if nilaiSisa < 0 {
			nilaiSisa = 0
		}
		// Bulatkan nilai sisa ke 2 desimal
		nilaiSisa = math.Round(nilaiSisa*100) / 100
	}

	// Update semua asset dengan bulk_id yang sama
	// Kecuali field-field yang harus tetap unik seperti kode dan bulk_sequence
	result := tx.Model(&domain.Asset{}).
		Where("bulk_id = ?", bulkID).
		Updates(map[string]interface{}{
			"nama":                 assetData.Nama,
			"spesifikasi":          assetData.Spesifikasi,
			"quantity":             1, // Setiap asset dalam bulk memiliki quantity 1
			"satuan":               assetData.Satuan,
			"tanggal_perolehan":    assetData.TanggalPerolehan,
			"harga_perolehan":      assetData.HargaPerolehan,
			"umur_ekonomis_tahun":  assetData.UmurEkonomisTahun,
			"umur_ekonomis_bulan":  umurEkonomisBulan,
			"akumulasi_penyusutan": akumulasiPenyusutan,
			"nilai_sisa":           nilaiSisa,
			"keterangan":           assetData.Keterangan,
			"lokasi":               assetData.Lokasi,
			"lokasi_id":            assetData.LokasiID,
			"asal_pengadaan":       assetData.AsalPengadaan,
			"category_id":          assetData.CategoryID,
			"status":               assetData.Status,
			"updated_at":           time.Now(),
		})

	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	if result.RowsAffected == 0 {
		tx.Rollback()
		return gorm.ErrRecordNotFound
	}

	return tx.Commit().Error
}

func (r *assetRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Asset{}, id).Error
}

// DeleteBulkAssets menghapus semua asset dalam satu bulk berdasarkan bulk_id
func (r *assetRepository) DeleteBulkAssets(bulkID uuid.UUID) error {
	return r.db.Where("bulk_id = ?", bulkID).Delete(&domain.Asset{}).Error
}

func (r *assetRepository) GetByID(id uuid.UUID) (*domain.Asset, error) {
	var asset domain.Asset
	err := r.db.Preload("Category").Preload("LocationInfo").Where("id = ?", id).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (r *assetRepository) GetBulkAssets(bulkID uuid.UUID) ([]domain.Asset, error) {
	var assets []domain.Asset
	err := r.db.Preload("Category").Preload("LocationInfo").
		Where("bulk_id = ?", bulkID).
		Order("bulk_sequence ASC").
		Find(&assets).Error
	if err != nil {
		return nil, err
	}
	return assets, nil
}

func (r *assetRepository) List(filter map[string]interface{}) ([]domain.Asset, error) {
	var assets []domain.Asset
	query := r.db

	if categoryID, ok := filter["category_id"]; ok {
		query = query.Where("category_id = ?", categoryID)
	}
	if status, ok := filter["status"]; ok {
		query = query.Where("status = ?", status)
	} // Order by created_at instead of parsing kode to avoid empty string errors
	err := query.Preload("Category").Preload("LocationInfo").Order("created_at DESC").Find(&assets).Error
	return assets, err
}

func (r *assetRepository) ListPaginated(filter map[string]interface{}, page, pageSize int) ([]domain.Asset, int, error) {
	var assets []domain.Asset
	var total int64
	query := r.db

	if categoryID, ok := filter["category_id"]; ok {
		query = query.Where("category_id = ?", categoryID)
	}
	if status, ok := filter["status"]; ok {
		query = query.Where("status = ?", status)
	}
	// Get total count with filters
	if err := query.Model(&domain.Asset{}).Count(&total).Error; err != nil {
		return nil, 0, err
	} // Get paginated records with filters ordered by creation date DESC
	offset := (page - 1) * pageSize
	err := query.Preload("Category").Preload("LocationInfo").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&assets).Error
	if err != nil {
		return nil, 0, err
	}

	return assets, int(total), nil
}

func (r *assetRepository) ListPaginatedWithBulk(filter map[string]interface{}, page, pageSize int) ([]domain.Asset, int, error) {
	var assets []domain.Asset
	var total int64

	// Base query that only shows bulk parent records or single assets
	query := r.db.Where("is_bulk_parent = ? OR bulk_id IS NULL", true)

	if categoryID, ok := filter["category_id"]; ok {
		query = query.Where("category_id = ?", categoryID)
	}
	if status, ok := filter["status"]; ok {
		query = query.Where("status = ?", status)
	}

	// Get total count with filters
	if err := query.Model(&domain.Asset{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	// Get paginated records with filters ordered by creation date DESC
	offset := (page - 1) * pageSize
	err := query.Preload("Category").Preload("LocationInfo").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&assets).Error
	if err != nil {
		return nil, 0, err
	}

	return assets, int(total), nil
}

func (r *assetRepository) CreateBulk(assets []domain.Asset) error {
	// Use transaction for bulk insert
	tx := r.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		return err
	}

	// Insert all assets in batch
	for i := range assets {
		// Generate ID if not set
		if assets[i].ID == uuid.Nil {
			assets[i].ID = uuid.New()
		}

		// Normalize status value
		assets[i].Status = normalizeStatus(assets[i].Status)

		// Calculate depreciation for each asset
		umurEkonomisBulan := assets[i].UmurEkonomisTahun * 12
		assets[i].UmurEkonomisBulan = umurEkonomisBulan

		now := time.Now()
		bulanPemakaian := 0
		if !assets[i].TanggalPerolehan.IsZero() {
			totalBulanPemakaian := int(now.Sub(assets[i].TanggalPerolehan).Hours() / (24 * 30))
			if totalBulanPemakaian > 0 {
				bulanPemakaian = totalBulanPemakaian
			}
		}

		if bulanPemakaian > umurEkonomisBulan {
			bulanPemakaian = umurEkonomisBulan
		}

		if umurEkonomisBulan > 0 {
			penyusutanPerBulan := assets[i].HargaPerolehan / float64(umurEkonomisBulan)
			assets[i].AkumulasiPenyusutan = penyusutanPerBulan * float64(bulanPemakaian)
			assets[i].AkumulasiPenyusutan = math.Round(assets[i].AkumulasiPenyusutan*100) / 100

			assets[i].NilaiSisa = assets[i].HargaPerolehan - assets[i].AkumulasiPenyusutan
			if assets[i].NilaiSisa < 0 {
				assets[i].NilaiSisa = 0
			}
			assets[i].NilaiSisa = math.Round(assets[i].NilaiSisa*100) / 100
		}

		if err := tx.Create(&assets[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create bulk asset %d: %w", i+1, err)
		}
	}

	return tx.Commit().Error
}
