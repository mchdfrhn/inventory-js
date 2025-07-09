package http

import (
	"en-inventory/internal/delivery/http/dto"
	"en-inventory/internal/domain"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuditLogHandler struct {
	auditLogUsecase domain.AuditLogUsecase
}

func NewAuditLogHandler(r *gin.Engine, au domain.AuditLogUsecase) {
	handler := &AuditLogHandler{
		auditLogUsecase: au,
	}

	api := r.Group("/api/v1")
	{
		auditLogs := api.Group("/audit-logs")
		{
			auditLogs.GET("", handler.ListAuditLogs)
			auditLogs.GET("/entity/:entity_type/:entity_id", handler.GetEntityHistory)
		}
	}
}

func (h *AuditLogHandler) ListAuditLogs(c *gin.Context) {
	var req dto.AuditLogListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ValidationError{
			Status:  "error",
			Message: "Invalid query parameters",
			Details: []dto.ErrorDetail{{Field: "query", Message: err.Error()}},
		})
		return
	}

	// Set default pagination values
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 10
	}
	if req.PageSize > 100 {
		req.PageSize = 100 // Limit maximum page size
	}

	// Build filter map
	filter := make(map[string]interface{})
	if req.EntityType != "" {
		filter["entity_type"] = req.EntityType
	}
	if req.EntityID != "" {
		if entityUUID, err := uuid.Parse(req.EntityID); err == nil {
			filter["entity_id"] = entityUUID
		}
	}
	if req.Action != "" {
		filter["action"] = req.Action
	}
	if req.UserID != "" {
		filter["user_id"] = req.UserID
	}
	if !req.FromDate.IsZero() {
		filter["from_date"] = req.FromDate
	}
	if !req.ToDate.IsZero() {
		filter["to_date"] = req.ToDate
	}

	logs, total, err := h.auditLogUsecase.GetActivityLogs(filter, req.Page, req.PageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Status:  "error",
			Message: "Failed to retrieve audit logs: " + err.Error(),
		})
		return
	}

	// Convert to DTOs
	var logDTOs []dto.AuditLogResponse
	for _, log := range logs {
		logDTO := dto.AuditLogResponse{
			ID:          log.ID,
			EntityType:  log.EntityType,
			EntityID:    log.EntityID,
			Action:      log.Action,
			UserID:      log.UserID,
			IPAddress:   log.IPAddress,
			UserAgent:   log.UserAgent,
			Description: log.Description,
			CreatedAt:   log.CreatedAt,
		}

		// Parse JSON fields if they exist
		if log.Changes != "" {
			var changes interface{}
			if err := json.Unmarshal([]byte(log.Changes), &changes); err == nil {
				logDTO.Changes = changes
			}
		}
		if log.OldValues != "" {
			var oldValues interface{}
			if err := json.Unmarshal([]byte(log.OldValues), &oldValues); err == nil {
				logDTO.OldValues = oldValues
			}
		}
		if log.NewValues != "" {
			var newValues interface{}
			if err := json.Unmarshal([]byte(log.NewValues), &newValues); err == nil {
				logDTO.NewValues = newValues
			}
		}

		logDTOs = append(logDTOs, logDTO)
	}
	// Calculate pagination info
	totalPages := (total + req.PageSize - 1) / req.PageSize

	response := dto.PaginatedResponse{
		Status:  "success",
		Message: "Audit logs retrieved successfully",
		Data:    logDTOs,
	}
	response.Pagination.CurrentPage = req.Page
	response.Pagination.PageSize = req.PageSize
	response.Pagination.TotalItems = total
	response.Pagination.TotalPages = totalPages
	response.Pagination.HasPrevious = req.Page > 1
	response.Pagination.HasNext = req.Page < totalPages

	c.JSON(http.StatusOK, response)
}

func (h *AuditLogHandler) GetEntityHistory(c *gin.Context) {
	entityType := c.Param("entity_type")
	entityIDStr := c.Param("entity_id")

	if entityType == "" {
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: "Entity type is required",
		})
		return
	}

	entityID, err := uuid.Parse(entityIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Status:  "error",
			Message: "Invalid entity ID format",
		})
		return
	}

	logs, err := h.auditLogUsecase.GetActivityHistory(entityType, entityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Status:  "error",
			Message: "Failed to retrieve entity history: " + err.Error(),
		})
		return
	}

	// Convert to DTOs
	var logDTOs []dto.AuditLogResponse
	for _, log := range logs {
		logDTO := dto.AuditLogResponse{
			ID:          log.ID,
			EntityType:  log.EntityType,
			EntityID:    log.EntityID,
			Action:      log.Action,
			UserID:      log.UserID,
			IPAddress:   log.IPAddress,
			UserAgent:   log.UserAgent,
			Description: log.Description,
			CreatedAt:   log.CreatedAt,
		}

		// Parse JSON fields if they exist
		if log.Changes != "" {
			var changes interface{}
			if err := json.Unmarshal([]byte(log.Changes), &changes); err == nil {
				logDTO.Changes = changes
			}
		}
		if log.OldValues != "" {
			var oldValues interface{}
			if err := json.Unmarshal([]byte(log.OldValues), &oldValues); err == nil {
				logDTO.OldValues = oldValues
			}
		}
		if log.NewValues != "" {
			var newValues interface{}
			if err := json.Unmarshal([]byte(log.NewValues), &newValues); err == nil {
				logDTO.NewValues = newValues
			}
		}

		logDTOs = append(logDTOs, logDTO)
	}

	c.JSON(http.StatusOK, dto.Response{
		Status:  "success",
		Message: "Entity activity history retrieved successfully",
		Data:    logDTOs,
	})
}

// Helper function to get client IP address
func (h *AuditLogHandler) getClientIP(c *gin.Context) string {
	clientIP := c.ClientIP()
	if clientIP == "" {
		clientIP = c.GetHeader("X-Forwarded-For")
		if clientIP == "" {
			clientIP = c.GetHeader("X-Real-IP")
			if clientIP == "" {
				clientIP = c.Request.RemoteAddr
			}
		}
	}
	return clientIP
}

// Helper function to get user agent
func (h *AuditLogHandler) getUserAgent(c *gin.Context) string {
	return c.GetHeader("User-Agent")
}
