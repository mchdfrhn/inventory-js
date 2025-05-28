package http

import (
	"encoding/csv"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"en-inventory/internal/domain"

	"github.com/gin-gonic/gin"
)

type LocationHandler struct {
	LocationUseCase domain.LocationUseCase
}

func NewLocationHandler(r *gin.Engine, locationUseCase domain.LocationUseCase) {
	handler := &LocationHandler{
		LocationUseCase: locationUseCase,
	}
	api := r.Group("/api/v1")
	{
		locations := api.Group("/locations")
		{
			locations.POST("", handler.Create)
			locations.POST("/import", handler.Import)
			locations.GET("", handler.List)
			locations.GET("/search", handler.Search) // Must come before /:id route
			locations.GET("/:id", handler.GetByID)
			locations.PUT("/:id", handler.Update)
			locations.DELETE("/:id", handler.Delete)
		}
	}
}

// Create handles POST request to create a new location
func (h *LocationHandler) Create(c *gin.Context) {
	var location domain.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	if err := h.LocationUseCase.Create(&location); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create location: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Location created successfully",
		"data":    location,
	})
}

// List handles GET request to retrieve all locations with pagination
func (h *LocationHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	locations, total, err := h.LocationUseCase.List(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to retrieve locations: " + err.Error(),
		})
		return
	}

	totalPages := (total + pageSize - 1) / pageSize
	hasPrevious := page > 1
	hasNext := page < totalPages

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Locations retrieved successfully",
		"data":    locations,
		"pagination": gin.H{
			"current_page": page,
			"page_size":    pageSize,
			"total_items":  total,
			"total_pages":  totalPages,
			"has_previous": hasPrevious,
			"has_next":     hasNext,
		},
	})
}

// GetByID handles GET request to retrieve a location by its ID
func (h *LocationHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid ID format",
		})
		return
	}

	location, err := h.LocationUseCase.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Location not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Location retrieved successfully",
		"data":    location,
	})
}

// Update handles PUT request to update an existing location
func (h *LocationHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid ID format",
		})
		return
	}
	var location domain.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	if err := h.LocationUseCase.Update(uint(id), &location); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update location: " + err.Error(),
		})
		return
	}

	// Fetch the updated location
	updatedLocation, err := h.LocationUseCase.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Location updated but failed to retrieve updated data",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Location updated successfully",
		"data":    updatedLocation,
	})
}

// Delete handles DELETE request to remove a location
func (h *LocationHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid ID format",
		})
		return
	}

	if err := h.LocationUseCase.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete location: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Location deleted successfully",
	})
}

// Search handles GET request to search for locations
func (h *LocationHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Search query is required",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	locations, total, err := h.LocationUseCase.Search(query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to search locations: " + err.Error(),
		})
		return
	}

	totalPages := (int(total) + pageSize - 1) / pageSize
	hasPrevious := page > 1
	hasNext := page < totalPages

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Locations search completed",
		"data":    locations,
		"pagination": gin.H{
			"current_page": page,
			"page_size":    pageSize,
			"total_items":  total,
			"total_pages":  totalPages,
			"has_previous": hasPrevious,
			"has_next":     hasNext,
		},
	})
}

// Import handles POST request to import locations from CSV/Excel file
func (h *LocationHandler) Import(c *gin.Context) {
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
	if !strings.HasSuffix(strings.ToLower(filename), ".csv") &&
		!strings.HasSuffix(strings.ToLower(filename), ".xlsx") &&
		!strings.HasSuffix(strings.ToLower(filename), ".xls") {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Unsupported file format. Please use CSV, XLS, or XLSX files.",
		})
		return
	}

	// For now, we'll handle CSV files. Excel files would need additional processing
	var locations []domain.Location
	var importCount int

	if strings.HasSuffix(strings.ToLower(filename), ".csv") {
		locations, importCount, err = h.processCSVFile(file)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Excel file support not implemented yet. Please use CSV format.",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Failed to process file: " + err.Error(),
		})
		return
	}

	// Import locations to database
	successCount := 0
	var errors []string

	for _, location := range locations {
		if err := h.LocationUseCase.Create(&location); err != nil {
			errors = append(errors, "Failed to import location '"+location.Name+"': "+err.Error())
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

// processCSVFile processes CSV file and returns locations
func (h *LocationHandler) processCSVFile(file multipart.File) ([]domain.Location, int, error) {
	reader := csv.NewReader(file)
	// Auto-detect CSV separator by reading the first line
	firstLineBytes := make([]byte, 1024)
	n, _ := file.Read(firstLineBytes)
	firstLine := string(firstLineBytes[:n])

	// Reset file position to beginning
	file.Seek(0, 0)

	// Detect separator: prioritize semicolon if found, otherwise use comma
	if strings.Contains(firstLine, ";") {
		reader.Comma = ';'
	} else {
		reader.Comma = ','
	}

	// Read header line
	headers, err := reader.Read()
	if err != nil {
		return nil, 0, err
	}

	// Validate headers - support both English and Indonesian headers
	expectedEnglishHeaders := []string{"code", "name", "building", "floor", "room", "description"}
	expectedIndonesianHeaders := []string{"Kode*", "Nama*", "Gedung", "Lantai", "Ruangan", "Deskripsi"}

	// Check if it matches English headers
	isEnglishFormat := len(headers) >= len(expectedEnglishHeaders)
	if isEnglishFormat {
		for i, header := range expectedEnglishHeaders {
			if i < len(headers) {
				cleanHeader := strings.ToLower(strings.TrimSpace(headers[i]))
				expectedHeader := strings.ToLower(header)
				if cleanHeader != expectedHeader {
					isEnglishFormat = false
					break
				}
			}
		}
	}
	// Check if it matches Indonesian headers
	isIndonesianFormat := len(headers) >= len(expectedIndonesianHeaders)
	if isIndonesianFormat {
		for i, header := range expectedIndonesianHeaders {
			if i < len(headers) {
				cleanHeader := strings.TrimSpace(headers[i])
				expectedHeader := strings.TrimSpace(header)
				if cleanHeader != expectedHeader {
					isIndonesianFormat = false
					break
				}
			}
		}
	}

	// If neither format matches, return error
	if !isEnglishFormat && !isIndonesianFormat {
		return nil, 0, errors.New("invalid CSV format. Expected headers (Indonesian): " + strings.Join(expectedIndonesianHeaders, ", ") + " or (English): " + strings.Join(expectedEnglishHeaders, ", "))
	}

	var locations []domain.Location
	rowCount := 0

	// Read data rows
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, 0, err
		}

		rowCount++

		// Skip empty rows
		if len(record) == 0 || (len(record) == 1 && strings.TrimSpace(record[0]) == "") {
			continue
		}
		// Parse location data
		if len(record) >= 6 {
			location := domain.Location{
				Code:        strings.TrimSpace(record[0]),
				Name:        strings.TrimSpace(record[1]),
				Building:    strings.TrimSpace(record[2]),
				Floor:       strings.TrimSpace(record[3]),
				Room:        strings.TrimSpace(record[4]),
				Description: strings.TrimSpace(record[5]),
			}

			// Validate required fields
			if location.Code != "" && location.Name != "" {
				locations = append(locations, location)
			}
		}
	}

	return locations, rowCount, nil
}
