package dto

import (
	"en-inventory/internal/domain"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Response DTOs
type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorDetail provides detailed information about validation errors
type ErrorDetail struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// NewErrorDetail creates a new error detail with proper formatting
func NewErrorDetail(field, tag string, params ...string) ErrorDetail {
	var msg string
	switch tag {
	case "required":
		msg = "This field is required"
	case "uuid":
		msg = "Must be a valid UUID format (e.g., 83abf13d-04f1-4159-a9d3-7ef4d0a061d3)"
	case "min":
		msg = fmt.Sprintf("Must be at least %s", params[0])
	case "max":
		msg = fmt.Sprintf("Must not exceed %s", params[0])
	case "oneof":
		msg = fmt.Sprintf("Must be one of: %s", params[0])
	default:
		msg = "Invalid value"
	}
	return ErrorDetail{
		Field:   field,
		Message: msg,
	}
}

// ValidationError represents a structured validation error response
type ValidationError struct {
	Status  string        `json:"status"`
	Message string        `json:"message"`
	Details []ErrorDetail `json:"details"`
}

// Pagination DTOs
type PaginationQuery struct {
	Page     int `form:"page,default=1" binding:"min=1"`
	PageSize int `form:"page_size,default=10" binding:"min=1,max=100"`
}

type PaginatedResponse struct {
	Status     string      `json:"status"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data"`
	Pagination struct {
		CurrentPage int  `json:"current_page"`
		PageSize    int  `json:"page_size"`
		TotalItems  int  `json:"total_items"`
		TotalPages  int  `json:"total_pages"`
		HasPrevious bool `json:"has_previous"`
		HasNext     bool `json:"has_next"`
	} `json:"pagination"`
}

// Asset Request DTOs
type CreateAssetRequest struct {
	Kode              string  `json:"kode"` // Tidak required - akan di-generate otomatis
	Nama              string  `json:"nama" binding:"required"`
	Spesifikasi       string  `json:"spesifikasi"`
	Quantity          int     `json:"quantity" binding:"required"`
	Satuan            string  `json:"satuan" binding:"required"`
	TanggalPerolehan  string  `json:"tanggal_perolehan"` // Format: "2006-01-02"
	HargaPerolehan    float64 `json:"harga_perolehan" binding:"required"`
	UmurEkonomisTahun int     `json:"umur_ekonomis_tahun" binding:"required"`
	Keterangan        string  `json:"keterangan"`
	Lokasi            string  `json:"lokasi"`
	LokasiID          *uint   `json:"lokasi_id"`      // Reference to Location model
	AsalPengadaan     string  `json:"asal_pengadaan"` // Procurement source
	CategoryID        string  `json:"category_id" binding:"required,uuid"`
	Status            string  `json:"status"`
}

type UpdateAssetRequest struct {
	Kode              string  `json:"kode" binding:"required"`
	Nama              string  `json:"nama" binding:"required"`
	Spesifikasi       string  `json:"spesifikasi"`
	Quantity          int     `json:"quantity" binding:"required"`
	Satuan            string  `json:"satuan" binding:"required"`
	TanggalPerolehan  string  `json:"tanggal_perolehan"` // Format: "2006-01-02"
	HargaPerolehan    float64 `json:"harga_perolehan" binding:"required"`
	UmurEkonomisTahun int     `json:"umur_ekonomis_tahun" binding:"required"`
	Keterangan        string  `json:"keterangan"`
	Lokasi            string  `json:"lokasi"`
	LokasiID          *uint   `json:"lokasi_id"`      // Reference to Location model
	AsalPengadaan     string  `json:"asal_pengadaan"` // Procurement source
	CategoryID        string  `json:"category_id" binding:"required,uuid"`
	Status            string  `json:"status"`
}

// BulkAssetRequest represents request to create multiple assets
type BulkAssetRequest struct {
	Asset    CreateAssetRequest `json:"asset" binding:"required"`
	Quantity int                `json:"quantity" binding:"required,min=1"`
}

// AssetResponse represents the response structure for asset data
type AssetResponse struct {
	ID                  uuid.UUID         `json:"id"`
	Kode                string            `json:"kode"`
	Nama                string            `json:"nama"`
	Spesifikasi         string            `json:"spesifikasi"`
	Quantity            int               `json:"quantity"`
	Satuan              string            `json:"satuan"`
	TanggalPerolehan    time.Time         `json:"tanggal_perolehan"`
	HargaPerolehan      float64           `json:"harga_perolehan"`
	UmurEkonomisTahun   int               `json:"umur_ekonomis_tahun"`
	UmurEkonomisBulan   int               `json:"umur_ekonomis_bulan"`
	AkumulasiPenyusutan float64           `json:"akumulasi_penyusutan"`
	NilaiSisa           float64           `json:"nilai_sisa"`
	Keterangan          string            `json:"keterangan"`
	Lokasi              string            `json:"lokasi"`
	LokasiID            *uint             `json:"lokasi_id"`
	LocationInfo        *LocationResponse `json:"location_info,omitempty"`
	AsalPengadaan       string            `json:"asal_pengadaan"`
	CategoryID          uuid.UUID         `json:"category_id"`
	Category            CategoryResponse  `json:"category"`
	Status              string            `json:"status"`
	BulkID              *uuid.UUID        `json:"bulk_id,omitempty"`
	BulkSequence        int               `json:"bulk_sequence,omitempty"`
	IsBulkParent        bool              `json:"is_bulk_parent"`
	BulkTotalCount      int               `json:"bulk_total_count,omitempty"`
	CreatedAt           time.Time         `json:"created_at"`
	UpdatedAt           time.Time         `json:"updated_at"`
}

// CategoryRequest DTOs
type CreateCategoryRequest struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateCategoryRequest struct {
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// CategoryResponse represents the response structure for category data
type CategoryResponse struct {
	ID          uuid.UUID `json:"id"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// LocationResponse represents the response structure for location data
type LocationResponse struct {
	ID          uint      `json:"id"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Building    string    `json:"building"`
	Floor       string    `json:"floor"`
	Room        string    `json:"room"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// SuccessResponse represents a generic success response
type SuccessResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Validate validates the create asset request
func (r *CreateAssetRequest) Validate() error {
	if r.Quantity < 0 {
		return fmt.Errorf("quantity cannot be negative")
	}
	if r.HargaPerolehan <= 0 {
		return fmt.Errorf("harga perolehan harus lebih dari 0")
	}
	if r.UmurEkonomisTahun <= 0 {
		return fmt.Errorf("umur ekonomis harus lebih dari 0")
	}

	// Validate status - must be one of the valid values
	if r.Status != "" && r.Status != "baik" && r.Status != "rusak" && r.Status != "tidak_memadai" {
		r.Status = "baik" // Default to 'baik' if invalid status provided
	}

	return nil
}

// Validate validates the update asset request
func (r *UpdateAssetRequest) Validate() error {
	if r.Quantity < 0 {
		return fmt.Errorf("quantity cannot be negative")
	}
	if r.HargaPerolehan <= 0 {
		return fmt.Errorf("harga perolehan harus lebih dari 0")
	}
	if r.UmurEkonomisTahun <= 0 {
		return fmt.Errorf("umur ekonomis harus lebih dari 0")
	}

	// Validate status - must be one of the valid values
	if r.Status != "" && r.Status != "baik" && r.Status != "rusak" && r.Status != "tidak_memadai" {
		r.Status = "baik" // Default to 'baik' if invalid status provided
	}

	return nil
}

// ToAsset converts CreateAssetRequest to domain.Asset
func (r *CreateAssetRequest) ToAsset() (*domain.Asset, error) {
	categoryID, err := uuid.Parse(r.CategoryID)
	if err != nil {
		return nil, fmt.Errorf("invalid category_id format: %v", err)
	}

	// Parse tanggal perolehan
	var tanggalPerolehan time.Time
	if r.TanggalPerolehan != "" {
		tanggalPerolehan, err = time.Parse("2006-01-02", r.TanggalPerolehan)
		if err != nil {
			return nil, fmt.Errorf("format tanggal perolehan tidak valid: %v", err)
		}
	} else {
		tanggalPerolehan = time.Now()
	}

	// Use only valid status values
	status := r.Status
	if status != "baik" && status != "rusak" && status != "tidak_memadai" {
		status = "baik" // Default
	}

	var lokasiID *uint
	if r.LokasiID != nil && *r.LokasiID > 0 {
		lokasiID = r.LokasiID
	}

	return &domain.Asset{
		Kode:              r.Kode,
		Nama:              r.Nama,
		Spesifikasi:       r.Spesifikasi,
		Quantity:          r.Quantity,
		Satuan:            r.Satuan,
		TanggalPerolehan:  tanggalPerolehan,
		HargaPerolehan:    r.HargaPerolehan,
		UmurEkonomisTahun: r.UmurEkonomisTahun,
		Keterangan:        r.Keterangan,
		Lokasi:            r.Lokasi,
		LokasiID:          lokasiID,
		AsalPengadaan:     r.AsalPengadaan,
		CategoryID:        categoryID,
		Status:            status,
	}, nil
}

// ToAsset converts UpdateAssetRequest to domain.Asset
func (r *UpdateAssetRequest) ToAsset(id uuid.UUID) (*domain.Asset, error) {
	categoryID, err := uuid.Parse(r.CategoryID)
	if err != nil {
		return nil, fmt.Errorf("invalid category_id format: %v", err)
	}

	// Parse tanggal perolehan
	var tanggalPerolehan time.Time
	if r.TanggalPerolehan != "" {
		tanggalPerolehan, err = time.Parse("2006-01-02", r.TanggalPerolehan)
		if err != nil {
			return nil, fmt.Errorf("format tanggal perolehan tidak valid: %v", err)
		}
	} else {
		tanggalPerolehan = time.Now()
	}

	// Use only valid status values
	status := r.Status
	if status != "baik" && status != "rusak" && status != "tidak_memadai" {
		status = "baik" // Default
	}

	var lokasiID *uint
	if r.LokasiID != nil && *r.LokasiID > 0 {
		lokasiID = r.LokasiID
	}

	return &domain.Asset{
		ID:                id,
		Kode:              r.Kode,
		Nama:              r.Nama,
		Spesifikasi:       r.Spesifikasi,
		Quantity:          r.Quantity,
		Satuan:            r.Satuan,
		TanggalPerolehan:  tanggalPerolehan,
		HargaPerolehan:    r.HargaPerolehan,
		UmurEkonomisTahun: r.UmurEkonomisTahun,
		Keterangan:        r.Keterangan,
		Lokasi:            r.Lokasi,
		LokasiID:          lokasiID,
		AsalPengadaan:     r.AsalPengadaan,
		CategoryID:        categoryID,
		Status:            status,
	}, nil
}

// ToCategory converts CreateCategoryRequest to domain.AssetCategory
func (r *CreateCategoryRequest) ToCategory() *domain.AssetCategory {
	return &domain.AssetCategory{
		Code:        r.Code,
		Name:        r.Name,
		Description: r.Description,
	}
}

// ToCategory converts UpdateCategoryRequest to domain.AssetCategory
func (r *UpdateCategoryRequest) ToCategory(id uuid.UUID) *domain.AssetCategory {
	return &domain.AssetCategory{
		ID:          id,
		Code:        r.Code,
		Name:        r.Name,
		Description: r.Description,
	}
}
