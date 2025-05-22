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
	if err := tx.Preload("Category").First(asset, asset.ID).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (r *assetRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Asset{}, id).Error
}

func (r *assetRepository) GetByID(id uuid.UUID) (*domain.Asset, error) {
	var asset domain.Asset
	err := r.db.Preload("Category").Where("id = ?", id).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

func (r *assetRepository) List(filter map[string]interface{}) ([]domain.Asset, error) {
	var assets []domain.Asset
	query := r.db

	if categoryID, ok := filter["category_id"]; ok {
		query = query.Where("category_id = ?", categoryID)
	}
	if status, ok := filter["status"]; ok {
		query = query.Where("status = ?", status)
	}
	err := query.Preload("Category").Find(&assets).Error
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
	}

	// Get paginated records with filters
	offset := (page - 1) * pageSize
	err := query.Preload("Category").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&assets).Error
	if err != nil {
		return nil, 0, err
	}

	return assets, int(total), nil
}
