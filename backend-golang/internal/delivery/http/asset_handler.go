package http

import (
	"en-inventory/internal/delivery/http/dto"
	"en-inventory/internal/domain"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
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
			assets.POST("/bulk", handler.CreateBulkAsset)
			assets.GET("/bulk/:bulk_id", handler.GetBulkAssets)
			assets.PUT("/bulk/:bulk_id", handler.UpdateBulkAssets)
			assets.DELETE("/bulk/:bulk_id", handler.DeleteBulkAssets)
			assets.GET("/with-bulk", handler.ListAssetsWithBulk)
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
	fmt.Printf("=== UpdateAsset Handler Called ===\n")
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
	fmt.Printf("Update request for asset ID: %s\n", id.String())

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

	// IMPORTANT: Preserve bulk information from existing asset
	// This is crucial for bulk asset updates to work properly
	existingAsset, err := h.assetUsecase.GetAsset(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dto.ValidationError{
				Status:  "error",
				Message: "Asset not found",
				Details: []dto.ErrorDetail{{
					Field:   "id",
					Message: "Asset with this ID does not exist",
				}},
			})
		} else {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Status:  "error",
				Message: "Failed to get asset: " + err.Error(),
			})
		}
		return
	}

	// Preserve bulk fields from existing asset
	asset.BulkID = existingAsset.BulkID
	asset.BulkSequence = existingAsset.BulkSequence
	asset.IsBulkParent = existingAsset.IsBulkParent
	asset.BulkTotalCount = existingAsset.BulkTotalCount

	// Jika asset ini merupakan bagian dari bulk, update seluruh bulk
	if existingAsset.BulkID != nil {
		// Update semua asset dalam bulk dengan data yang sama
		fmt.Printf("Updating bulk assets with BulkID: %s\n", existingAsset.BulkID.String())
		err = h.assetUsecase.UpdateBulkAssets(*existingAsset.BulkID, asset)
	} else {
		// Update hanya asset individual
		fmt.Printf("Updating individual asset: %s\n", id.String())
		err = h.assetUsecase.UpdateAsset(asset)
	}

	if err != nil {
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

	// Tentukan message berdasarkan apakah ini update bulk atau individual
	var message string
	var updateCount int = 1
	if existingAsset.BulkID != nil {
		message = fmt.Sprintf("Bulk asset berhasil diperbarui! %d unit telah diupdate.", existingAsset.BulkTotalCount)
		updateCount = existingAsset.BulkTotalCount
	} else {
		message = "Asset berhasil diperbarui!"
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: message,
		Data: gin.H{
			"asset":        asset,
			"is_bulk":      existingAsset.BulkID != nil,
			"update_count": updateCount,
		},
	})
}

// UpdateBulkAssets updates all assets in a bulk group
func (h *AssetHandler) UpdateBulkAssets(c *gin.Context) {
	fmt.Printf("=== UpdateBulkAssets Handler Called ===\n")
	bulkID, err := uuid.Parse(c.Param("bulk_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ValidationError{
			Status:  "error",
			Message: "Invalid bulk ID format",
			Details: []dto.ErrorDetail{{
				Field:   "bulk_id",
				Message: "Must be a valid UUID format",
			}},
		})
		return
	}
	fmt.Printf("Update request for bulk ID: %s\n", bulkID.String())

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

	// Ambil salah satu asset dari bulk untuk mendapatkan data
	bulkAssets, err := h.assetUsecase.GetBulkAssets(bulkID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to get bulk assets: " + err.Error(),
		})
		return
	}

	if len(bulkAssets) == 0 {
		c.JSON(http.StatusNotFound, dto.ValidationError{
			Status:  "error",
			Message: "Bulk assets not found",
			Details: []dto.ErrorDetail{{
				Field:   "bulk_id",
				Message: "No assets found with this bulk ID",
			}},
		})
		return
	}

	// Gunakan ID dari asset parent untuk konversi
	parentAsset := bulkAssets[0]
	for _, asset := range bulkAssets {
		if asset.IsBulkParent {
			parentAsset = asset
			break
		}
	}

	asset, err := req.ToAsset(parentAsset.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Update semua asset dalam bulk
	fmt.Printf("Updating all assets in bulk ID: %s\n", bulkID.String())
	if err := h.assetUsecase.UpdateBulkAssets(bulkID, asset); err != nil {
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
				Message: "An error occurred while updating the bulk assets. Please try again later.",
			}},
		})
		return
	}

	bulkCount := len(bulkAssets)
	message := fmt.Sprintf("Bulk asset berhasil diperbarui! %d unit telah diupdate.", bulkCount)

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: message,
		Data: gin.H{
			"bulk_id":      bulkID,
			"update_count": bulkCount,
			"is_bulk":      true,
		},
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

// DeleteBulkAssets menghapus semua asset dalam bulk berdasarkan bulk_id
func (h *AssetHandler) DeleteBulkAssets(c *gin.Context) {
	bulkID, err := uuid.Parse(c.Param("bulk_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid bulk ID format",
		})
		return
	}

	if err := h.assetUsecase.DeleteBulkAssets(bulkID); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to delete bulk assets: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "All bulk assets deleted successfully",
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

	// Import assets to database following CSV order
	successCount := 0
	var errors []string

	// Get the starting sequence for the entire import batch
	totalAssetCount := 0
	for _, asset := range assets {
		if asset.Quantity > 1 {
			// Check if satuan is eligible for bulk creation
			bulkEligibleUnits := []string{"unit", "pcs", "set", "buah"}
			isEligible := false
			for _, eligible := range bulkEligibleUnits {
				if strings.EqualFold(asset.Satuan, eligible) {
					isEligible = true
					break
				}
			}
			if isEligible {
				totalAssetCount += asset.Quantity // Bulk assets count as quantity
			} else {
				totalAssetCount += 1 // Non-bulk eligible, treat as single
			}
		} else {
			totalAssetCount += 1 // Single asset
		}
	}

	// Reserve sequence range for the entire batch
	startSequence, err := h.assetUsecase.GetNextAvailableSequenceRange(totalAssetCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to allocate sequence range: " + err.Error(),
		})
		return
	}

	currentSequence := startSequence

	// Process assets in CSV order (one by one) with sequential numbering
	for _, asset := range assets {
		if asset.Quantity > 1 {
			// Check if satuan is eligible for bulk creation
			bulkEligibleUnits := []string{"unit", "pcs", "set", "buah"}
			isEligible := false
			for _, eligible := range bulkEligibleUnits {
				if strings.EqualFold(asset.Satuan, eligible) {
					isEligible = true
					break
				}
			}

			if isEligible {
				// Create bulk asset with sequential sequence
				bulkResult, err := h.assetUsecase.CreateBulkAssetWithSequence(&asset, asset.Quantity, currentSequence)
				if err != nil {
					errors = append(errors, fmt.Sprintf("Failed to import bulk asset '%s': %s", asset.Nama, err.Error()))
				} else {
					successCount += len(bulkResult)
					currentSequence += asset.Quantity // Move sequence forward by quantity
				}
			} else {
				// Treat as single asset even if quantity > 1 for non-bulk eligible units
				if err := h.assetUsecase.CreateAssetWithSequence(&asset, currentSequence); err != nil {
					errors = append(errors, fmt.Sprintf("Failed to import asset '%s': %s", asset.Nama, err.Error()))
				} else {
					successCount++
					currentSequence++ // Move sequence forward by 1
				}
			}
		} else {
			// Create single asset with sequential sequence
			if err := h.assetUsecase.CreateAssetWithSequence(&asset, currentSequence); err != nil {
				errors = append(errors, fmt.Sprintf("Failed to import asset '%s': %s", asset.Nama, err.Error()))
			} else {
				successCount++
				currentSequence++ // Move sequence forward by 1
			}
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

// parseFlexibleDate attempts to parse date in multiple formats
func parseFlexibleDate(dateStr string) (time.Time, error) {
	dateStr = strings.TrimSpace(dateStr)

	// Try YYYY-MM-DD format first
	if date, err := time.Parse("2006-01-02", dateStr); err == nil {
		return date, nil
	}

	// Try DD/MM/YYYY format
	if date, err := time.Parse("02/01/2006", dateStr); err == nil {
		return date, nil
	}

	// Try DD-MM-YYYY format (dash separator)
	if date, err := time.Parse("02-01-2006", dateStr); err == nil {
		return date, nil
	}

	return time.Time{}, fmt.Errorf("unsupported date format: %s (supported: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)", dateStr)
}

// processAssetCSVFile processes uploaded CSV file and returns assets
func (h *AssetHandler) processAssetCSVFile(file io.Reader) ([]domain.Asset, int, error) {
	// Read the entire file content first to detect separator
	content, err := io.ReadAll(file)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to read file content: %v", err)
	}

	// Auto-detect CSV separator from first line
	firstLine := strings.Split(string(content), "\n")[0]

	reader := csv.NewReader(strings.NewReader(string(content)))

	// Detect separator: prioritize semicolon if found, otherwise use comma
	if strings.Contains(firstLine, ";") {
		reader.Comma = ';'
	} else {
		reader.Comma = ','
	}

	records, err := reader.ReadAll()
	if err != nil {
		return nil, 0, fmt.Errorf("failed to read CSV file: %v", err)
	}

	if len(records) == 0 {
		return nil, 0, fmt.Errorf("CSV file is empty")
	}
	// Validate headers (format baru dengan kode kategori dan lokasi)
	expectedHeaders := []string{"Nama Aset*", "Kode Kategori*", "Spesifikasi", "Tanggal Perolehan*", "Jumlah*", "Satuan", "Harga Perolehan*", "Umur Ekonomis", "Kode Lokasi*", "ID Asal Pengadaan*", "Status"}
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
			Nama:        strings.TrimSpace(row[0]), // Nama Aset*
			Spesifikasi: strings.TrimSpace(row[2]), // Spesifikasi
		}
		// Parse tanggal perolehan (row[3]) - support both YYYY-MM-DD and DD/MM/YYYY formats
		tanggalStr := strings.TrimSpace(row[3])
		tanggal, err := parseFlexibleDate(tanggalStr)
		if err != nil {
			return nil, 0, fmt.Errorf("row %d: invalid date format (expected YYYY-MM-DD or DD/MM/YYYY): %s", i+2, row[3])
		}
		asset.TanggalPerolehan = tanggal

		// Parse quantity (row[4])
		if quantity, err := strconv.Atoi(strings.TrimSpace(row[4])); err == nil {
			asset.Quantity = quantity
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid quantity value: %s", i+2, row[4])
		}

		asset.Satuan = strings.TrimSpace(row[5]) // Satuan

		// Parse harga perolehan (row[6])
		if harga, err := strconv.ParseFloat(strings.TrimSpace(row[6]), 64); err == nil {
			asset.HargaPerolehan = harga
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid price value: %s", i+2, row[6])
		}

		// Parse umur ekonomis tahun (row[7])
		if umur, err := strconv.Atoi(strings.TrimSpace(row[7])); err == nil {
			asset.UmurEkonomisTahun = umur
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid economic life value: %s", i+2, row[7])
		}
		// Parse kode lokasi (row[8]) - cari lokasi berdasarkan kode
		if kodeLokasiStr := strings.TrimSpace(row[8]); kodeLokasiStr != "" {
			// Cari lokasi berdasarkan kode
			location, err := h.assetUsecase.GetLocationByCode(kodeLokasiStr)
			if err != nil || location == nil {
				return nil, 0, fmt.Errorf("row %d: location with code '%s' not found", i+2, kodeLokasiStr)
			}
			asset.LokasiID = &location.ID
		}

		// Parse kode kategori (row[1]) - cari kategori berdasarkan kode
		if kodeKategoriStr := strings.TrimSpace(row[1]); kodeKategoriStr != "" {
			// Cari kategori berdasarkan kode
			category, err := h.assetUsecase.GetCategoryByCode(kodeKategoriStr)
			if err != nil || category == nil {
				return nil, 0, fmt.Errorf("row %d: category with code '%s' not found", i+2, kodeKategoriStr)
			}
			asset.CategoryID = category.ID
		}

		asset.AsalPengadaan = strings.TrimSpace(row[9]) // ID Asal Pengadaan*
		asset.Status = strings.TrimSpace(row[10])       // Status

		// Don't generate asset code here - let usecase handle it with proper sequence
		// This ensures sequential numbering works correctly
		asset.Kode = "" // Will be generated by usecase

		assets = append(assets, asset)
	}

	return assets, importCount, nil
}

// CreateBulkAsset creates multiple assets with unique codes
func (h *AssetHandler) CreateBulkAsset(c *gin.Context) {
	var req dto.BulkAssetRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	if req.Quantity <= 1 {
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: "Quantity must be greater than 1 for bulk creation",
		})
		return
	}

	// Check if satuan is eligible for bulk creation
	// Only allow bulk creation for discrete units, not measurement units
	bulkEligibleUnits := []string{"unit", "pcs", "set", "buah"}
	isEligible := false
	for _, eligible := range bulkEligibleUnits {
		if req.Asset.Satuan == eligible {
			isEligible = true
			break
		}
	}

	if !isEligible {
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: fmt.Sprintf("Bulk asset creation is not allowed for satuan '%s'. Only allowed for: unit, pcs, set, buah", req.Asset.Satuan),
		})
		return
	}

	// Validate asset data
	if err := validator.New().Struct(req.Asset); err != nil {
		var validationErrors []string
		for _, e := range err.(validator.ValidationErrors) {
			validationErrors = append(validationErrors, fmt.Sprintf("Field '%s' validation failed: %s", e.Field(), e.Tag()))
		}
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: "Validation failed: " + strings.Join(validationErrors, ", "),
		})
		return
	}

	// Convert DTO to domain model using the ToAsset method
	domainAsset, err := req.Asset.ToAsset()
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: "Invalid asset data: " + err.Error(),
		})
		return
	}

	// Create bulk assets using the usecase
	assets, err := h.assetUsecase.CreateBulkAsset(domainAsset, req.Quantity)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dto.Response{
				Status:  "error",
				Message: "Related record not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.Response{
			Status:  "error",
			Message: "Failed to create bulk assets: " + err.Error(),
		})
		return
	}

	// Convert to DTOs
	var assetDTOs []dto.AssetResponse
	for _, asset := range assets {
		assetDTO := dto.AssetResponse{
			ID:                  asset.ID,
			Kode:                asset.Kode,
			Nama:                asset.Nama,
			Spesifikasi:         asset.Spesifikasi,
			Quantity:            asset.Quantity,
			Satuan:              asset.Satuan,
			TanggalPerolehan:    asset.TanggalPerolehan,
			HargaPerolehan:      asset.HargaPerolehan,
			UmurEkonomisTahun:   asset.UmurEkonomisTahun,
			UmurEkonomisBulan:   asset.UmurEkonomisBulan,
			AkumulasiPenyusutan: asset.AkumulasiPenyusutan,
			NilaiSisa:           asset.NilaiSisa,
			Keterangan:          asset.Keterangan,
			Lokasi:              asset.Lokasi,
			LokasiID:            asset.LokasiID,
			AsalPengadaan:       asset.AsalPengadaan,
			CategoryID:          asset.CategoryID,
			Status:              asset.Status,
			BulkID:              asset.BulkID,
			BulkSequence:        asset.BulkSequence,
			IsBulkParent:        asset.IsBulkParent,
			BulkTotalCount:      asset.BulkTotalCount,
			CreatedAt:           asset.CreatedAt,
			UpdatedAt:           asset.UpdatedAt,
		}

		// Include category information if available
		if asset.Category.ID != uuid.Nil {
			assetDTO.Category = &dto.CategoryResponse{
				ID:          asset.Category.ID,
				Code:        asset.Category.Code,
				Name:        asset.Category.Name,
				Description: asset.Category.Description,
				CreatedAt:   asset.Category.CreatedAt,
				UpdatedAt:   asset.Category.UpdatedAt,
			}
		}

		// Include location information if available
		if asset.LocationInfo != nil {
			assetDTO.LocationInfo = &dto.LocationResponse{
				ID:          asset.LocationInfo.ID,
				Name:        asset.LocationInfo.Name,
				Code:        asset.LocationInfo.Code,
				Description: asset.LocationInfo.Description,
				Building:    asset.LocationInfo.Building,
				Floor:       asset.LocationInfo.Floor,
				Room:        asset.LocationInfo.Room,
				CreatedAt:   asset.LocationInfo.CreatedAt,
				UpdatedAt:   asset.LocationInfo.UpdatedAt,
			}
		}

		assetDTOs = append(assetDTOs, assetDTO)
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{
		Status:  "success",
		Message: fmt.Sprintf("Successfully created %d assets", len(assets)),
		Data:    assetDTOs,
	})
}

// GetBulkAssets gets all assets in a bulk group
func (h *AssetHandler) GetBulkAssets(c *gin.Context) {
	bulkIDStr := c.Param("bulk_id")
	bulkID, err := uuid.Parse(bulkIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: "Invalid bulk ID format",
		})
		return
	}

	assets, err := h.assetUsecase.GetBulkAssets(bulkID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Status:  "error",
			Message: "Failed to get bulk assets: " + err.Error(),
		})
		return
	}

	// Convert to DTOs
	var assetDTOs []dto.AssetResponse
	for _, asset := range assets {
		assetDTO := dto.AssetResponse{
			ID:                  asset.ID,
			Kode:                asset.Kode,
			Nama:                asset.Nama,
			Spesifikasi:         asset.Spesifikasi,
			Quantity:            asset.Quantity,
			Satuan:              asset.Satuan,
			TanggalPerolehan:    asset.TanggalPerolehan,
			HargaPerolehan:      asset.HargaPerolehan,
			UmurEkonomisTahun:   asset.UmurEkonomisTahun,
			UmurEkonomisBulan:   asset.UmurEkonomisBulan,
			AkumulasiPenyusutan: asset.AkumulasiPenyusutan,
			NilaiSisa:           asset.NilaiSisa,
			Keterangan:          asset.Keterangan,
			Lokasi:              asset.Lokasi,
			LokasiID:            asset.LokasiID,
			AsalPengadaan:       asset.AsalPengadaan,
			CategoryID:          asset.CategoryID,
			Status:              asset.Status,
			BulkID:              asset.BulkID,
			BulkSequence:        asset.BulkSequence,
			IsBulkParent:        asset.IsBulkParent,
			BulkTotalCount:      asset.BulkTotalCount,
			CreatedAt:           asset.CreatedAt,
			UpdatedAt:           asset.UpdatedAt,
		}

		// Include category information if available
		if asset.Category.ID != uuid.Nil {
			assetDTO.Category = &dto.CategoryResponse{
				ID:          asset.Category.ID,
				Code:        asset.Category.Code,
				Name:        asset.Category.Name,
				Description: asset.Category.Description,
				CreatedAt:   asset.Category.CreatedAt,
				UpdatedAt:   asset.Category.UpdatedAt,
			}
		}

		// Include location information if available
		if asset.LocationInfo != nil {
			assetDTO.LocationInfo = &dto.LocationResponse{
				ID:          asset.LocationInfo.ID,
				Name:        asset.LocationInfo.Name,
				Code:        asset.LocationInfo.Code,
				Description: asset.LocationInfo.Description,
				Building:    asset.LocationInfo.Building,
				Floor:       asset.LocationInfo.Floor,
				Room:        asset.LocationInfo.Room,
				CreatedAt:   asset.LocationInfo.CreatedAt,
				UpdatedAt:   asset.LocationInfo.UpdatedAt,
			}
		}

		assetDTOs = append(assetDTOs, assetDTO)
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Status:  "success",
		Message: "Bulk assets retrieved successfully",
		Data:    assetDTOs,
	})
}

// ListAssetsWithBulk lists assets with bulk support (only showing bulk parents)
func (h *AssetHandler) ListAssetsWithBulk(c *gin.Context) {
	page := 1
	pageSize := 10

	if p := c.Query("page"); p != "" {
		if parsedPage, err := strconv.Atoi(p); err == nil && parsedPage > 0 {
			page = parsedPage
		}
	}

	if ps := c.Query("page_size"); ps != "" {
		if parsedPageSize, err := strconv.Atoi(ps); err == nil && parsedPageSize > 0 && parsedPageSize <= 100 {
			pageSize = parsedPageSize
		}
	}
	filter := make(map[string]interface{})
	assets, total, err := h.assetUsecase.ListAssetsWithBulk(filter, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Status:  "error",
			Message: "Failed to list assets: " + err.Error(),
		})
		return
	}

	// Convert to DTOs
	var assetDTOs []dto.AssetResponse
	for _, asset := range assets {
		assetDTO := dto.AssetResponse{
			ID:                  asset.ID,
			Kode:                asset.Kode,
			Nama:                asset.Nama,
			Spesifikasi:         asset.Spesifikasi,
			Quantity:            asset.Quantity,
			Satuan:              asset.Satuan,
			TanggalPerolehan:    asset.TanggalPerolehan,
			HargaPerolehan:      asset.HargaPerolehan,
			UmurEkonomisTahun:   asset.UmurEkonomisTahun,
			UmurEkonomisBulan:   asset.UmurEkonomisBulan,
			AkumulasiPenyusutan: asset.AkumulasiPenyusutan,
			NilaiSisa:           asset.NilaiSisa,
			Keterangan:          asset.Keterangan,
			Lokasi:              asset.Lokasi,
			LokasiID:            asset.LokasiID,
			AsalPengadaan:       asset.AsalPengadaan,
			CategoryID:          asset.CategoryID,
			Status:              asset.Status,
			BulkID:              asset.BulkID,
			BulkSequence:        asset.BulkSequence,
			IsBulkParent:        asset.IsBulkParent,
			BulkTotalCount:      asset.BulkTotalCount,
			CreatedAt:           asset.CreatedAt,
			UpdatedAt:           asset.UpdatedAt,
		}

		// Include category information
		if asset.Category.ID != uuid.Nil {
			assetDTO.Category = &dto.CategoryResponse{
				ID:          asset.Category.ID,
				Code:        asset.Category.Code,
				Name:        asset.Category.Name,
				Description: asset.Category.Description,
				CreatedAt:   asset.Category.CreatedAt,
				UpdatedAt:   asset.Category.UpdatedAt,
			}
		}

		// Include location information if available
		if asset.LocationInfo != nil {
			assetDTO.LocationInfo = &dto.LocationResponse{
				ID:          asset.LocationInfo.ID,
				Name:        asset.LocationInfo.Name,
				Code:        asset.LocationInfo.Code,
				Description: asset.LocationInfo.Description,
				Building:    asset.LocationInfo.Building,
				Floor:       asset.LocationInfo.Floor,
				Room:        asset.LocationInfo.Room,
				CreatedAt:   asset.LocationInfo.CreatedAt,
				UpdatedAt:   asset.LocationInfo.UpdatedAt,
			}
		}

		assetDTOs = append(assetDTOs, assetDTO)
	}

	totalPages := (total + pageSize - 1) / pageSize
	c.JSON(http.StatusOK, dto.PaginatedResponse{
		Status:  "success",
		Message: "Assets with bulk support retrieved successfully",
		Data:    assetDTOs,
		Pagination: struct {
			CurrentPage int  `json:"current_page"`
			PageSize    int  `json:"page_size"`
			TotalItems  int  `json:"total_items"`
			TotalPages  int  `json:"total_pages"`
			HasPrevious bool `json:"has_previous"`
			HasNext     bool `json:"has_next"`
		}{
			CurrentPage: page,
			PageSize:    pageSize,
			TotalItems:  total,
			TotalPages:  totalPages,
			HasPrevious: page > 1,
			HasNext:     page < totalPages,
		},
	})
}
