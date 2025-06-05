package domain

import (
	"time"

	"github.com/google/uuid"
)

type Asset struct {
	ID                  uuid.UUID     `json:"id" gorm:"type:uuid;primary_key"`
	Kode                string        `json:"kode" gorm:"size:50;not null;unique"`
	Nama                string        `json:"nama" gorm:"size:255;not null"`
	Spesifikasi         string        `json:"spesifikasi" gorm:"type:text"`
	Quantity            int           `json:"quantity" gorm:"not null"`
	Satuan              string        `json:"satuan" gorm:"size:50;not null"`
	TanggalPerolehan    time.Time     `json:"tanggal_perolehan" gorm:"not null"`
	HargaPerolehan      float64       `json:"harga_perolehan" gorm:"not null"`
	UmurEkonomisTahun   int           `json:"umur_ekonomis_tahun" gorm:"not null"`
	UmurEkonomisBulan   int           `json:"umur_ekonomis_bulan" gorm:"not null"`
	AkumulasiPenyusutan float64       `json:"akumulasi_penyusutan" gorm:"not null"`
	NilaiSisa           float64       `json:"nilai_sisa" gorm:"not null"`
	Keterangan          string        `json:"keterangan" gorm:"type:text"`
	Lokasi              string        `json:"lokasi" gorm:"size:255"`
	LokasiID            *uint         `json:"lokasi_id" gorm:"column:lokasi_id"`
	LocationInfo        *Location     `json:"location_info,omitempty" gorm:"foreignkey:LokasiID"`
	AsalPengadaan       string        `json:"asal_pengadaan" gorm:"column:asal_pengadaan;size:255"`
	CategoryID          uuid.UUID     `json:"category_id" gorm:"type:uuid;not null;column:category_id"`
	Category            AssetCategory `json:"category" gorm:"foreignkey:CategoryID"`
	Status              string        `json:"status" gorm:"size:20;default:'baik'"`
	// Bulk asset fields
	BulkID         *uuid.UUID `json:"bulk_id,omitempty" gorm:"type:uuid;column:bulk_id;index"`
	BulkSequence   int        `json:"bulk_sequence,omitempty" gorm:"default:1"`
	IsBulkParent   bool       `json:"is_bulk_parent" gorm:"default:false"`
	BulkTotalCount int        `json:"bulk_total_count,omitempty" gorm:"default:1"`
	CreatedAt      time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Asset) TableName() string {
	return "assets"
}

type AssetCategory struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	Code        string    `json:"code" binding:"required" gorm:"size:50;not null;unique"`
	Name        string    `json:"name" binding:"required" gorm:"size:255;not null;unique"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
	Assets      []Asset   `json:"assets,omitempty" gorm:"foreignkey:CategoryID"`
}

type AssetRepository interface {
	Create(asset *Asset) error
	CreateBulk(assets []Asset) error
	Update(asset *Asset) error
	Delete(id uuid.UUID) error
	GetByID(id uuid.UUID) (*Asset, error)
	GetBulkAssets(bulkID uuid.UUID) ([]Asset, error)
	List(filter map[string]interface{}) ([]Asset, error)
	ListPaginated(filter map[string]interface{}, page, pageSize int) ([]Asset, int, error)
	ListPaginatedWithBulk(filter map[string]interface{}, page, pageSize int) ([]Asset, int, error)
}

type AssetCategoryRepository interface {
	Create(category *AssetCategory) error
	Update(category *AssetCategory) error
	Delete(id uuid.UUID) error
	GetByID(id uuid.UUID) (*AssetCategory, error)
	GetByCode(code string) (*AssetCategory, error)
	List() ([]AssetCategory, error)
	ListPaginated(page, pageSize int) ([]AssetCategory, int, error)
}

type AssetUsecase interface {
	CreateAsset(asset *Asset) error
	CreateBulkAsset(asset *Asset, quantity int) ([]Asset, error)
	UpdateAsset(asset *Asset) error
	DeleteAsset(id uuid.UUID) error
	GetAsset(id uuid.UUID) (*Asset, error)
	GetBulkAssets(bulkID uuid.UUID) ([]Asset, error)
	ListAssets(filter map[string]interface{}) ([]Asset, error)
	ListAssetsPaginated(filter map[string]interface{}, page, pageSize int) ([]Asset, int, error)
	ListAssetsWithBulk(filter map[string]interface{}, page, pageSize int) ([]Asset, int, error)
	GetAllAssets() ([]Asset, error)
	GetLocationByID(id uint) (*Location, error)
	GetCategoryByID(id uuid.UUID) (*AssetCategory, error)
	GetLocationByCode(code string) (*Location, error)
	GetCategoryByCode(code string) (*AssetCategory, error)
}

type AssetCategoryUsecase interface {
	CreateCategory(category *AssetCategory) error
	UpdateCategory(category *AssetCategory) error
	DeleteCategory(id uuid.UUID) error
	GetCategory(id uuid.UUID) (*AssetCategory, error)
	ListCategories() ([]AssetCategory, error)
	ListCategoriesPaginated(page, pageSize int) ([]AssetCategory, int, error)
}
