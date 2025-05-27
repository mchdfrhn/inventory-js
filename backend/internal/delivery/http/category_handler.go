package http

import (
	"en-inventory/internal/delivery/http/dto"
	"en-inventory/internal/domain"
	"encoding/csv"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	categoryUsecase domain.AssetCategoryUsecase
}

func NewCategoryHandler(r *gin.Engine, cu domain.AssetCategoryUsecase) {
	handler := &CategoryHandler{
		categoryUsecase: cu,
	}
	api := r.Group("/api/v1")
	{
		categories := api.Group("/categories")
		{
			categories.POST("", handler.CreateCategory)
			categories.PUT("/:id", handler.UpdateCategory)
			categories.DELETE("/:id", handler.DeleteCategory)
			categories.GET("/:id", handler.GetCategory)
			categories.GET("", handler.ListCategories)
			categories.POST("/import", handler.Import)
		}
	}
}

func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	category := req.ToCategory()
	if err := h.categoryUsecase.CreateCategory(category); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to create category: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.Response{
		Status:  "success",
		Message: "Category created successfully",
		Data:    category,
	})
}

func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid ID format",
		})
		return
	}

	var req dto.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	category := req.ToCategory(id)
	if err := h.categoryUsecase.UpdateCategory(category); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Status:  "error",
				Message: "Category not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to update category: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "Category updated successfully",
		Data:    category,
	})
}

func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid ID format",
		})
		return
	}

	if err := h.categoryUsecase.DeleteCategory(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Status:  "error",
				Message: "Category not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to delete category: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "Category deleted successfully",
	})
}

func (h *CategoryHandler) GetCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Status:  "error",
			Message: "Invalid ID format",
		})
		return
	}

	category, err := h.categoryUsecase.GetCategory(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Status:  "error",
				Message: "Category not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Status:  "error",
			Message: "Failed to get category: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "Category retrieved successfully",
		Data:    category,
	})
}

func (h *CategoryHandler) ListCategories(c *gin.Context) {
	var pagination dto.PaginationQuery
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
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

	categories, total, err := h.categoryUsecase.ListCategoriesPaginated(pagination.Page, pagination.PageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Status:  "error",
			Message: "Failed to fetch categories: " + err.Error(),
		})
		return
	}

	totalPages := (total + pagination.PageSize - 1) / pagination.PageSize

	response := dto.PaginatedResponse{
		Status:  "success",
		Message: "Categories retrieved successfully",
		Data:    categories,
	}
	response.Pagination.CurrentPage = pagination.Page
	response.Pagination.PageSize = pagination.PageSize
	response.Pagination.TotalItems = total
	response.Pagination.TotalPages = totalPages
	response.Pagination.HasPrevious = pagination.Page > 1
	response.Pagination.HasNext = pagination.Page < totalPages

	c.JSON(http.StatusOK, response)
}

// Import handles POST request to import categories from CSV file
func (h *CategoryHandler) Import(c *gin.Context) {
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
	var categories []domain.AssetCategory
	var importCount int

	if strings.HasSuffix(strings.ToLower(filename), ".csv") {
		categories, importCount, err = h.processCSVFile(file)
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

	// Import categories to database
	successCount := 0
	var errors []string

	for _, category := range categories {
		if err := h.categoryUsecase.CreateCategory(&category); err != nil {
			errors = append(errors, "Failed to import category '"+category.Name+"': "+err.Error())
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

// processCSVFile processes CSV file and returns categories
func (h *CategoryHandler) processCSVFile(file multipart.File) ([]domain.AssetCategory, int, error) {
	reader := csv.NewReader(file)

	// Read header line
	headers, err := reader.Read()
	if err != nil {
		return nil, 0, err
	}

	// Validate headers
	expectedHeaders := []string{"code", "name", "description"}
	if len(headers) < len(expectedHeaders) {
		return nil, 0, errors.New("invalid CSV format. Expected headers: " + strings.Join(expectedHeaders, ", "))
	}

	var categories []domain.AssetCategory
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
		// Parse category data
		if len(record) >= 3 {
			category := domain.AssetCategory{
				Code:        strings.TrimSpace(record[0]),
				Name:        strings.TrimSpace(record[1]),
				Description: strings.TrimSpace(record[2]),
			}

			// Validate required fields
			if category.Code != "" && category.Name != "" {
				categories = append(categories, category)
			}
		}
	}

	return categories, rowCount, nil
}
