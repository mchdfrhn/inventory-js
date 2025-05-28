package http

import (
	"en-inventory/internal/delivery/http/dto"
	"en-inventory/internal/domain"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AssetHandler handles asset-related HTTP requests.
type AssetHandler struct {
	assetUsecase domain.AssetUsecase
}

// NewAssetHandler creates a new asset handler with routes
func NewAssetHandler(r *gin.Engine, au domain.AssetUsecase) {
	handler := &AssetHandler{
		assetUsecase: au,
	}
	api := r.Group("/api/v1")
	{
		assets := api.Group("/assets")
		{
			assets.POST("", handler.CreateAsset)
			assets.POST("/import", handler.Import)
			assets.PUT("/:id", handler.UpdateAsset)
			assets.DELETE("/:id", handler.DeleteAsset)
			assets.GET("/:id", handler.GetAsset)
			assets.GET("", handler.ListAssets)
		}
	}
}

func (h *AssetHandler) CreateAsset(c *gin.Context) {
	var req dto.CreateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	} // Debug: Print request data
	if req.LokasiID != nil {
		println("Request LokasiID:", *req.LokasiID)
	} else {
		println("Request LokasiID: nil")
	}
	println("Request AsalPengadaan:", req.AsalPengadaan)

	asset, err := req.ToAsset()
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Debug: Print converted asset data
	if asset.LokasiID != nil {
		println("Converted Asset LokasiID:", *asset.LokasiID)
	} else {
		println("Converted Asset LokasiID: nil")
	}
	println("Converted Asset AsalPengadaan:", asset.AsalPengadaan)

	if err := h.assetUsecase.CreateAsset(asset); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Status:  "error",
				Message: "Category not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to create asset: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.Response{
		Status:  "success",
		Message: "Asset created successfully",
		Data:    asset,
	})
}

func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ValidationError{
			Status:  "error",
			Message: "Invalid asset ID format",
			Details: []dto.ErrorDetail{{
				Field:   "id",
				Message: "Must be a valid UUID format (e.g., 83abf13d-04f1-4159-a9d3-7ef4d0a061d3)",
			}},
		})
		return
	}

	var req dto.UpdateAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		var details []dto.ErrorDetail
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range validationErrs {
				details = append(details, dto.NewErrorDetail(
					e.Field(),
					e.Tag(),
					e.Param(),
				))
			}
			c.JSON(http.StatusBadRequest, dto.ValidationError{
				Status:  "error",
				Message: "Invalid request data",
				Details: details,
			})
		} else {
			c.JSON(http.StatusBadRequest, dto.ValidationError{
				Status:  "error",
				Message: "Invalid request format",
				Details: []dto.ErrorDetail{{
					Field:   "body",
					Message: "Invalid JSON format",
				}},
			})
		}
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, dto.ValidationError{
			Status:  "error",
			Message: "Validation failed",
			Details: []dto.ErrorDetail{{
				Field:   "status",
				Message: err.Error(),
			}},
		})
		return
	}

	if !dto.AssetStatus(req.Status).IsValid() {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid status value",
		})
		return
	}
	asset, err := req.ToAsset(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}
	if err := h.assetUsecase.UpdateAsset(asset); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dto.ValidationError{
				Status:  "error",
				Message: "Resource not found",
				Details: []dto.ErrorDetail{{
					Field:   "category_id",
					Message: "Category does not exist. Available categories can be found at /api/v1/categories",
				}},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ValidationError{
			Status:  "error",
			Message: "Internal server error",
			Details: []dto.ErrorDetail{{
				Field:   "",
				Message: "An error occurred while updating the asset. Please try again later.",
			}},
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "Asset updated successfully",
		Data:    asset,
	})
}

func (h *AssetHandler) DeleteAsset(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid ID format",
		})
		return
	}

	if err := h.assetUsecase.DeleteAsset(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Status:  "error",
				Message: "Asset not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to delete asset: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "Asset deleted successfully",
	})
}

func (h *AssetHandler) GetAsset(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid ID format",
		})
		return
	}

	asset, err := h.assetUsecase.GetAsset(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Status:  "error",
				Message: "Asset not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to get asset: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "Asset retrieved successfully",
		Data:    asset,
	})
}

func (h *AssetHandler) ListAssets(c *gin.Context) {
	var pagination dto.PaginationQuery
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid pagination parameters: " + err.Error(),
		})
		return
	}

	// If page or pageSize are not provided, use default values
	if pagination.Page == 0 {
		pagination.Page = 1
	}
	if pagination.PageSize == 0 {
		pagination.PageSize = 10
	}

	filter := make(map[string]interface{})

	if categoryID := c.Query("category_id"); categoryID != "" {
		id, err := uuid.Parse(categoryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Status:  "error",
				Message: "Invalid category ID format",
			})
			return
		}
		filter["category_id"] = id
	}

	if status := c.Query("status"); status != "" {
		if !dto.AssetStatus(status).IsValid() {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Status:  "error",
				Message: "Invalid status filter",
			})
			return
		}
		filter["status"] = status
	}

	assets, total, err := h.assetUsecase.ListAssetsPaginated(filter, pagination.Page, pagination.PageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to list assets: " + err.Error(),
		})
		return
	}

	totalPages := (total + pagination.PageSize - 1) / pagination.PageSize

	response := dto.PaginatedResponse{
		Status:  "success",
		Message: "Assets retrieved successfully",
		Data:    assets,
	}
	response.Pagination.CurrentPage = pagination.Page
	response.Pagination.PageSize = pagination.PageSize
	response.Pagination.TotalItems = total
	response.Pagination.TotalPages = totalPages
	response.Pagination.HasPrevious = pagination.Page > 1
	response.Pagination.HasNext = pagination.Page < totalPages

	c.JSON(http.StatusOK, response)
}

// Import handles POST request to import assets from CSV file
func (h *AssetHandler) Import(c *gin.Context) {
	// Get the uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "No file uploaded: " + err.Error(),
		})
		return
	}
	defer file.Close()

	// Check file type
	filename := header.Filename
	if !strings.HasSuffix(strings.ToLower(filename), ".csv") {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Unsupported file format. Please use CSV files.",
		})
		return
	}

	// Process CSV file
	assets, importCount, err := h.processAssetCSVFile(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Failed to process file: " + err.Error(),
		})
		return
	}

	// Import assets to database
	successCount := 0
	var errors []string
	for _, asset := range assets {
		if err := h.assetUsecase.CreateAsset(&asset); err != nil {
			errors = append(errors, fmt.Sprintf("Failed to import asset '%s': %s", asset.Nama, err.Error()))
		} else {
			successCount++
		}
	}

	// Prepare response
	response := gin.H{
		"status":         "success",
		"message":        "Import completed",
		"imported_count": successCount,
		"total_rows":     importCount,
	}

	if len(errors) > 0 {
		response["errors"] = errors
		response["status"] = "partial_success"
	}

	c.JSON(http.StatusOK, response)
}

// processAssetCSVFile processes uploaded CSV file and returns assets
func (h *AssetHandler) processAssetCSVFile(file io.Reader) ([]domain.Asset, int, error) {
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, 0, fmt.Errorf("failed to read CSV file: %v", err)
	}

	if len(records) == 0 {
		return nil, 0, fmt.Errorf("CSV file is empty")
	}

	// Validate headers (Indonesian format without kode column)
	expectedHeaders := []string{"Nama", "Spesifikasi", "Quantity", "Satuan", "Tanggal Perolehan", "Harga Perolehan", "Umur Ekonomis Tahun", "Lokasi ID", "Kategori ID", "Asal Pengadaan", "Status", "Keterangan"}
	headers := records[0]

	if len(headers) != len(expectedHeaders) {
		return nil, 0, fmt.Errorf("invalid CSV format. Expected %d columns, got %d", len(expectedHeaders), len(headers))
	}

	var assets []domain.Asset
	importCount := len(records) - 1 // Exclude header row

	for i, row := range records[1:] { // Skip header row
		if len(row) != len(expectedHeaders) {
			return nil, 0, fmt.Errorf("row %d: invalid number of columns", i+2)
		}

		asset := domain.Asset{
			ID:          uuid.New(),
			Nama:        strings.TrimSpace(row[0]),
			Spesifikasi: strings.TrimSpace(row[1]),
		}

		// Parse quantity
		if quantity, err := strconv.Atoi(strings.TrimSpace(row[2])); err == nil {
			asset.Quantity = quantity
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid quantity value: %s", i+2, row[2])
		}

		asset.Satuan = strings.TrimSpace(row[3])

		// Parse tanggal perolehan
		if tanggal, err := time.Parse("2006-01-02", strings.TrimSpace(row[4])); err == nil {
			asset.TanggalPerolehan = tanggal
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid date format (expected YYYY-MM-DD): %s", i+2, row[4])
		}

		// Parse harga perolehan
		if harga, err := strconv.ParseFloat(strings.TrimSpace(row[5]), 64); err == nil {
			asset.HargaPerolehan = harga
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid price value: %s", i+2, row[5])
		}

		// Parse umur ekonomis tahun
		if umur, err := strconv.Atoi(strings.TrimSpace(row[6])); err == nil {
			asset.UmurEkonomisTahun = umur
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid economic life value: %s", i+2, row[6])
		}

		// Parse lokasi ID
		if lokasiStr := strings.TrimSpace(row[7]); lokasiStr != "" {
			if lokasiID, err := strconv.ParseUint(lokasiStr, 10, 32); err == nil {
				lokasiIDUint := uint(lokasiID)
				asset.LokasiID = &lokasiIDUint
			} else {
				return nil, 0, fmt.Errorf("row %d: invalid location ID: %s", i+2, row[7])
			}
		}

		// Parse kategori ID
		if kategoriStr := strings.TrimSpace(row[8]); kategoriStr != "" {
			if kategoriID, err := uuid.Parse(kategoriStr); err == nil {
				asset.CategoryID = kategoriID
			} else {
				return nil, 0, fmt.Errorf("row %d: invalid category ID: %s", i+2, row[8])
			}
		}
		asset.AsalPengadaan = strings.TrimSpace(row[9])
		asset.Status = strings.TrimSpace(row[10])
		asset.Keterangan = strings.TrimSpace(row[11])

		// Generate asset code automatically with small delay for uniqueness
		asset.Kode = h.generateAssetCode()
		time.Sleep(1 * time.Microsecond) // Ensure unique timestamps

		assets = append(assets, asset)
	}

	return assets, importCount, nil
}

// generateAssetCode generates a new asset code automatically
func (h *AssetHandler) generateAssetCode() string {
	// Generate a unique code with timestamp and random component
	timestamp := time.Now().UnixNano()
	randomPart := rand.Intn(9999)                                  // Add random number 0-9999
	return fmt.Sprintf("AST%d%04d", timestamp/1000000, randomPart) // Use milliseconds + random
}
