package http

import (
	"en-inventory/internal/delivery/http/dto"
	"en-inventory/internal/domain"
	"errors"
	"net/http"

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
