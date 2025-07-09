package repository

import (
	"en-inventory/internal/database"
	"en-inventory/internal/domain"
	"fmt"

	"gorm.io/gorm"
)

type DatabaseAgnosticLocationRepository struct {
	db           *gorm.DB
	queryBuilder *database.QueryBuilder
}

func NewDatabaseAgnosticLocationRepository(db *gorm.DB, dialect string) *DatabaseAgnosticLocationRepository {
	return &DatabaseAgnosticLocationRepository{
		db:           db,
		queryBuilder: database.NewQueryBuilder(dialect),
	}
}

// Create adds a new location to the database
func (r *DatabaseAgnosticLocationRepository) Create(location *domain.Location) error {
	return r.db.Create(location).Error
}

// Update updates an existing location in the database
func (r *DatabaseAgnosticLocationRepository) Update(id uint, location *domain.Location) error {
	return r.db.Model(&domain.Location{ID: id}).Updates(location).Error
}

// Delete removes a location from the database
func (r *DatabaseAgnosticLocationRepository) Delete(id uint) error {
	// First check if there are assets using this location
	var count int64
	r.db.Model(&domain.Asset{}).Where("lokasi_id = ?", id).Count(&count)
	if count > 0 {
		return fmt.Errorf("cannot delete location with ID %d because it is used by %d assets", id, count)
	}

	return r.db.Delete(&domain.Location{ID: id}).Error
}

// GetByID retrieves a location by its ID
func (r *DatabaseAgnosticLocationRepository) GetByID(id uint) (*domain.Location, error) {
	var location domain.Location
	err := r.db.First(&location, id).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// GetByCode retrieves a location by its code
func (r *DatabaseAgnosticLocationRepository) GetByCode(code string) (*domain.Location, error) {
	var location domain.Location
	err := r.db.Where("code = ?", code).First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// List retrieves all locations with pagination
func (r *DatabaseAgnosticLocationRepository) List(page, pageSize int) ([]domain.Location, int, error) {
	var locations []domain.Location
	var total int64

	// Get total count
	if err := r.db.Table("locations").Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with database-agnostic ordering
	offset := (page - 1) * pageSize
	orderBy := r.queryBuilder.BuildCaseInsensitiveOrderBy("code", "ASC")

	result := r.db.Table("locations").
		Order(orderBy).
		Offset(offset).
		Limit(pageSize).
		Find(&locations)

	if result.Error != nil {
		return nil, 0, result.Error
	}

	return locations, int(total), nil
}

// Search locations by name or code using database-agnostic text search
func (r *DatabaseAgnosticLocationRepository) Search(query string, page, pageSize int) (*[]domain.Location, int64, error) {
	var locations []domain.Location
	var count int64

	offset := (page - 1) * pageSize

	// Build database-agnostic full-text search query
	searchFields := []string{"name", "code", "description", "building", "floor", "room"}
	searchQuery := r.queryBuilder.BuildFullTextSearchQuery(r.db.Table("locations"), searchFields, query)

	// Count total results
	searchQuery.Count(&count)

	// Get the matching locations with case-insensitive ordering
	orderBy := r.queryBuilder.BuildCaseInsensitiveOrderBy("code", "ASC")
	err := searchQuery.
		Offset(offset).
		Limit(pageSize).
		Order(orderBy).
		Find(&locations).Error

	if err != nil {
		return &locations, count, err
	}

	return &locations, count, err
}
