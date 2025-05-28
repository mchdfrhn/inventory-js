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

		// Parse tanggal perolehan (row[3])
		if tanggal, err := time.Parse("2006-01-02", strings.TrimSpace(row[3])); err == nil {
			asset.TanggalPerolehan = tanggal
		} else {
			return nil, 0, fmt.Errorf("row %d: invalid date format (expected YYYY-MM-DD): %s", i+2, row[3])
		}

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
		// Generate asset code automatically using the same logic as frontend
		assetCode, err := h.generateAssetCodeWithDetails(asset)
		if err != nil {
			return nil, 0, fmt.Errorf("row %d: failed to generate asset code: %v", i+2, err)
		}
		asset.Kode = assetCode

		assets = append(assets, asset)
	}

	return assets, importCount, nil
}

// generateAssetCodeWithDetails generates asset code using the same logic as frontend
func (h *AssetHandler) generateAssetCodeWithDetails(asset domain.Asset) (string, error) {
	// Get all existing assets to determine next sequence number
	allAssets, err := h.assetUsecase.GetAllAssets()
	if err != nil {
		return "", fmt.Errorf("failed to get existing assets: %v", err)
	}

	// Get location code (default to "001" if not found)
	locationCode := "001"
	if asset.LokasiID != nil {
		location, err := h.assetUsecase.GetLocationByID(*asset.LokasiID)
		if err == nil && location != nil && location.Code != "" {
			locationCode = location.Code
		}
	}

	// Get category code (default to "10" if not found)
	categoryCode := "10"
	category, err := h.assetUsecase.GetCategoryByID(asset.CategoryID)
	if err == nil && category != nil && category.Code != "" {
		categoryCode = category.Code
	}

	// Map procurement source to code
	procurementMap := map[string]string{
		"1": "1", // Pembelian
		"2": "2", // Bantuan
		"3": "3", // STTST -> should be 4 per frontend, but using 3 as provided
		"4": "4", // Hibah
		// Support both string and numeric formats
		"Pembelian": "1",
		"Bantuan":   "2",
		"STTST":     "3",
		"Hibah":     "4",
	}
	procurementCode := "1" // default
	if code, exists := procurementMap[asset.AsalPengadaan]; exists {
		procurementCode = code
	}

	// Format components
	A := fmt.Sprintf("%03s", locationCode)                      // 3 digits
	B := fmt.Sprintf("%02s", categoryCode)                      // 2 digits
	C := procurementCode                                        // 1 digit
	D := fmt.Sprintf("%02d", asset.TanggalPerolehan.Year()%100) // 2 digits (year)

	// Find highest existing sequence number
	maxSequence := 0
	for _, existingAsset := range allAssets {
		if existingAsset.Kode != "" {
			parts := strings.Split(existingAsset.Kode, ".")
			if len(parts) == 5 {
				if seq, err := strconv.Atoi(parts[4]); err == nil && seq > maxSequence {
					maxSequence = seq
				}
			}
		}
	}

	E := fmt.Sprintf("%03d", maxSequence+1) // 3 digits sequence

	return fmt.Sprintf("%s.%s.%s.%s.%s", A, B, C, D, E), nil
}
