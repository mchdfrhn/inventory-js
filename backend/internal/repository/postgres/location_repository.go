package postgres

import (
	"en-inventory/internal/domain"
	"fmt"

	"gorm.io/gorm"
)

type LocationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) *LocationRepository {
	return &LocationRepository{db: db}
}

// Create adds a new location to the database
func (r *LocationRepository) Create(location *domain.Location) error {
	return r.db.Create(location).Error
}

// Update updates an existing location in the database
func (r *LocationRepository) Update(id uint, location *domain.Location) error {
	return r.db.Model(&domain.Location{ID: id}).Updates(location).Error
}

// Delete removes a location from the database
func (r *LocationRepository) Delete(id uint) error {
	// First check if there are assets using this location
	var count int64
	r.db.Model(&domain.Asset{}).Where("lokasi_id = ?", id).Count(&count)
	if count > 0 {
		return fmt.Errorf("cannot delete location with ID %d because it is used by %d assets", id, count)
	}

	return r.db.Delete(&domain.Location{ID: id}).Error
}

// GetByID retrieves a location by its ID
func (r *LocationRepository) GetByID(id uint) (*domain.Location, error) {
	var location domain.Location
	err := r.db.First(&location, id).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// GetByCode retrieves a location by its code
func (r *LocationRepository) GetByCode(code string) (*domain.Location, error) {
	var location domain.Location
	err := r.db.Where("code = ?", code).First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// List retrieves all locations with pagination
func (r *LocationRepository) List(page, pageSize int) ([]domain.Location, int, error) {
	var locations []domain.Location
	var total int64

	// Get total count
	if err := r.db.Table("locations").Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results ordered by code DESC
	offset := (page - 1) * pageSize
	result := r.db.Table("locations").
		Order("code DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&locations)

	if result.Error != nil {
		return nil, 0, result.Error
	}

	return locations, int(total), nil
}

// Search locations by name or code
func (r *LocationRepository) Search(query string, page, pageSize int) (*[]domain.Location, int64, error) {
	var locations []domain.Location
	var count int64

	offset := (page - 1) * pageSize
	searchQuery := "%" + query + "%"
	// Use table name explicitly and ILIKE for case-insensitive search in PostgreSQL including building, floor and room
	whereClause := "name ILIKE ? OR code ILIKE ? OR description ILIKE ? OR building ILIKE ? OR floor ILIKE ? OR room ILIKE ?"
	r.db.Table("locations").
		Where(whereClause, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery).
		Count(&count)

	// Get the matching locations ordered by code DESC
	err := r.db.Table("locations").
		Where(whereClause, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery).
		Offset(offset).
		Limit(pageSize).
		Order("code DESC").
		Find(&locations).Error

	if err != nil {
		return &locations, count, err
	}

	return &locations, count, err
}
