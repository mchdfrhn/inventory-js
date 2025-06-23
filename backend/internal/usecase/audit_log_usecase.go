package usecase

import (
	"en-inventory/internal/domain"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type auditLogUsecase struct {
	auditLogRepo domain.AuditLogRepository
}

func NewAuditLogUsecase(auditLogRepo domain.AuditLogRepository) domain.AuditLogUsecase {
	return &auditLogUsecase{
		auditLogRepo: auditLogRepo,
	}
}

func (u *auditLogUsecase) LogActivity(entityType string, entityID uuid.UUID, action string, oldValues, newValues interface{}, description string, metadata map[string]string) error {
	log := &domain.AuditLog{
		EntityType:  entityType,
		EntityID:    entityID,
		Action:      action,
		Description: description,
	}

	// Convert old values to JSON
	if oldValues != nil {
		oldJSON, err := json.Marshal(oldValues)
		if err != nil {
			return fmt.Errorf("failed to marshal old values: %w", err)
		}
		log.OldValues = string(oldJSON)
	}

	// Convert new values to JSON
	if newValues != nil {
		newJSON, err := json.Marshal(newValues)
		if err != nil {
			return fmt.Errorf("failed to marshal new values: %w", err)
		}
		log.NewValues = string(newJSON)
	}

	// Generate changes description
	if oldValues != nil && newValues != nil {
		changes := u.generateChanges(oldValues, newValues)
		changesJSON, err := json.Marshal(changes)
		if err != nil {
			return fmt.Errorf("failed to marshal changes: %w", err)
		}
		log.Changes = string(changesJSON)
	}

	// Add metadata if provided
	if metadata != nil {
		if ipAddress, ok := metadata["ip_address"]; ok {
			log.IPAddress = ipAddress
		}
		if userAgent, ok := metadata["user_agent"]; ok {
			log.UserAgent = userAgent
		}
		if userID, ok := metadata["user_id"]; ok {
			log.UserID = &userID
		}
	}

	return u.auditLogRepo.Create(log)
}

func (u *auditLogUsecase) GetActivityHistory(entityType string, entityID uuid.UUID) ([]domain.AuditLog, error) {
	return u.auditLogRepo.GetByEntityID(entityType, entityID)
}

func (u *auditLogUsecase) GetActivityLogs(filter map[string]interface{}, page, pageSize int) ([]domain.AuditLog, int, error) {
	return u.auditLogRepo.ListPaginated(filter, page, pageSize)
}

func (u *auditLogUsecase) CleanupOldLogs(retentionDays int) error {
	cutoffDate := time.Now().AddDate(0, 0, -retentionDays)
	return u.auditLogRepo.DeleteOldLogs(cutoffDate)
}

// generateChanges compares old and new values to generate a list of changes
func (u *auditLogUsecase) generateChanges(oldValues, newValues interface{}) map[string]interface{} {
	changes := make(map[string]interface{})

	// Convert to map for comparison
	oldMap := u.interfaceToMap(oldValues)
	newMap := u.interfaceToMap(newValues)

	// Find changed fields
	for key, newVal := range newMap {
		if oldVal, exists := oldMap[key]; exists {
			if !u.areEqual(oldVal, newVal) {
				changes[key] = map[string]interface{}{
					"from": oldVal,
					"to":   newVal,
				}
			}
		} else {
			// New field
			changes[key] = map[string]interface{}{
				"from": nil,
				"to":   newVal,
			}
		}
	}

	// Find removed fields
	for key, oldVal := range oldMap {
		if _, exists := newMap[key]; !exists {
			changes[key] = map[string]interface{}{
				"from": oldVal,
				"to":   nil,
			}
		}
	}

	return changes
}

// interfaceToMap converts interface{} to map[string]interface{}
func (u *auditLogUsecase) interfaceToMap(data interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	// Convert to JSON and back to get a clean map
	jsonData, err := json.Marshal(data)
	if err != nil {
		return result
	}

	json.Unmarshal(jsonData, &result)
	return result
}

// areEqual compares two values for equality
func (u *auditLogUsecase) areEqual(a, b interface{}) bool {
	aJSON, _ := json.Marshal(a)
	bJSON, _ := json.Marshal(b)
	return string(aJSON) == string(bJSON)
}
