package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuditLog struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	EntityType  string    `json:"entity_type" gorm:"size:100;not null;index"`
	EntityID    uuid.UUID `json:"entity_id" gorm:"type:uuid;not null;index"`
	Action      string    `json:"action" gorm:"size:50;not null;index"`
	Changes     string    `json:"changes" gorm:"type:text"`
	OldValues   string    `json:"old_values" gorm:"type:text"`
	NewValues   string    `json:"new_values" gorm:"type:text"`
	UserID      *string   `json:"user_id" gorm:"size:100;index"`
	IPAddress   string    `json:"ip_address" gorm:"size:45"`
	UserAgent   string    `json:"user_agent" gorm:"type:text"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime;index"`
}

func (a *AuditLog) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	a.CreatedAt = time.Now()
	return nil
}

// TableName specifies the table name for GORM
func (AuditLog) TableName() string {
	return "audit_logs"
}
