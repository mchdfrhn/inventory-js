package domain

import (
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	EntityType  string    `json:"entity_type" gorm:"size:100;not null"` // "asset", "category", "location"
	EntityID    uuid.UUID `json:"entity_id" gorm:"type:uuid;not null"`
	Action      string    `json:"action" gorm:"size:50;not null"` // "create", "update", "delete"
	Changes     string    `json:"changes" gorm:"type:text"`       // JSON string of changes
	OldValues   string    `json:"old_values" gorm:"type:text"`    // JSON string of old values
	NewValues   string    `json:"new_values" gorm:"type:text"`    // JSON string of new values
	UserID      *string   `json:"user_id" gorm:"size:100"`        // For future user tracking
	IPAddress   string    `json:"ip_address" gorm:"size:45"`      // IPv4/IPv6 address
	UserAgent   string    `json:"user_agent" gorm:"type:text"`    // Browser info
	Description string    `json:"description" gorm:"type:text"`   // Human readable description
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// TableName specifies the table name for GORM
func (AuditLog) TableName() string {
	return "audit_logs"
}

type AuditLogRepository interface {
	Create(log *AuditLog) error
	List(filter map[string]interface{}) ([]AuditLog, error)
	ListPaginated(filter map[string]interface{}, page, pageSize int) ([]AuditLog, int, error)
	GetByEntityID(entityType string, entityID uuid.UUID) ([]AuditLog, error)
	DeleteOldLogs(beforeDate time.Time) error // For cleanup
}

type AuditLogUsecase interface {
	LogActivity(entityType string, entityID uuid.UUID, action string, oldValues, newValues interface{}, description string, metadata map[string]string) error
	GetActivityHistory(entityType string, entityID uuid.UUID) ([]AuditLog, error)
	GetActivityLogs(filter map[string]interface{}, page, pageSize int) ([]AuditLog, int, error)
	CleanupOldLogs(retentionDays int) error
}
