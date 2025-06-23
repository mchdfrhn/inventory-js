package postgres

import (
	"en-inventory/internal/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type auditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) domain.AuditLogRepository {
	return &auditLogRepository{
		db: db,
	}
}

func (r *auditLogRepository) Create(log *domain.AuditLog) error {
	if log.ID == uuid.Nil {
		log.ID = uuid.New()
	}
	log.CreatedAt = time.Now()

	return r.db.Create(log).Error
}

func (r *auditLogRepository) List(filter map[string]interface{}) ([]domain.AuditLog, error) {
	var logs []domain.AuditLog

	query := r.db.Model(&domain.AuditLog{})

	// Apply filters
	if entityType, ok := filter["entity_type"]; ok {
		query = query.Where("entity_type = ?", entityType)
	}
	if entityID, ok := filter["entity_id"]; ok {
		query = query.Where("entity_id = ?", entityID)
	}
	if action, ok := filter["action"]; ok {
		query = query.Where("action = ?", action)
	}
	if userID, ok := filter["user_id"]; ok {
		query = query.Where("user_id = ?", userID)
	}
	if fromDate, ok := filter["from_date"]; ok {
		query = query.Where("created_at >= ?", fromDate)
	}
	if toDate, ok := filter["to_date"]; ok {
		query = query.Where("created_at <= ?", toDate)
	}

	err := query.Order("created_at DESC").Find(&logs).Error
	return logs, err
}

func (r *auditLogRepository) ListPaginated(filter map[string]interface{}, page, pageSize int) ([]domain.AuditLog, int, error) {
	var logs []domain.AuditLog
	var total int64

	query := r.db.Model(&domain.AuditLog{})

	// Apply filters
	if entityType, ok := filter["entity_type"]; ok {
		query = query.Where("entity_type = ?", entityType)
	}
	if entityID, ok := filter["entity_id"]; ok {
		query = query.Where("entity_id = ?", entityID)
	}
	if action, ok := filter["action"]; ok {
		query = query.Where("action = ?", action)
	}
	if userID, ok := filter["user_id"]; ok {
		query = query.Where("user_id = ?", userID)
	}
	if fromDate, ok := filter["from_date"]; ok {
		query = query.Where("created_at >= ?", fromDate)
	}
	if toDate, ok := filter["to_date"]; ok {
		query = query.Where("created_at <= ?", toDate)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&logs).Error

	return logs, int(total), err
}

func (r *auditLogRepository) GetByEntityID(entityType string, entityID uuid.UUID) ([]domain.AuditLog, error) {
	var logs []domain.AuditLog

	err := r.db.Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").
		Find(&logs).Error

	return logs, err
}

func (r *auditLogRepository) DeleteOldLogs(beforeDate time.Time) error {
	return r.db.Where("created_at < ?", beforeDate).Delete(&domain.AuditLog{}).Error
}
