package http

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"en-inventory/internal/domain"
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
