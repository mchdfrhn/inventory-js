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

// List retrieves all locations with pagination
func (r *LocationRepository) List(page, pageSize int) ([]domain.Location, int, error) {
	var locations []domain.Location
	var total int64

	// Debug: Print query parameters
	fmt.Printf("DEBUG: Listing locations: page=%d, pageSize=%d\n", page, pageSize)

	// First get raw SQL data to verify what's in the database
	var rawLocations []map[string]interface{}
	if err := r.db.Table("locations").Find(&rawLocations).Error; err != nil {
		fmt.Printf("DEBUG: Error with raw query: %v\n", err)
	} else {
		fmt.Printf("DEBUG: Raw location data: %d records found\n", len(rawLocations))
		for i, loc := range rawLocations {
			if i < 5 { // Only print first 5 for brevity
				fmt.Printf("DEBUG: Raw location %d: %v\n", i+1, loc)
			}
		}
	}

	// Get total count (using Table explicitly to ensure correct table name)
	if err := r.db.Table("locations").Count(&total).Error; err != nil {
		fmt.Printf("DEBUG: Error getting total count: %v\n", err)
		return nil, 0, err
	}

	fmt.Printf("DEBUG: Total locations found: %d\n", total)

	// Get paginated results with order (using Table explicitly)
	offset := (page - 1) * pageSize
	result := r.db.Table("locations").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&locations)

	if result.Error != nil {
		fmt.Printf("DEBUG: Error getting locations: %v\n", result.Error)
		return nil, 0, result.Error
	}

	fmt.Printf("DEBUG: Retrieved %d locations\n", len(locations))
	for i, loc := range locations {
		fmt.Printf("DEBUG: Location %d: ID=%d, Name=%s, Code=%s\n", i+1, loc.ID, loc.Name, loc.Code)
	}

	// Additional check to ensure we're returning data
	if len(locations) == 0 && total > 0 {
		fmt.Printf("DEBUG: WARNING - Found %d locations in DB but returning empty array!\n", total)
	}

	return locations, int(total), nil
}

// Search locations by name or code
func (r *LocationRepository) Search(query string, page, pageSize int) (*[]domain.Location, int64, error) {
	var locations []domain.Location
	var count int64

	// Debug search parameters
	fmt.Printf("DEBUG: Searching locations: query=%s, page=%d, pageSize=%d\n", query, page, pageSize)

	offset := (page - 1) * pageSize
	searchQuery := "%" + query + "%"
	// Use table name explicitly and ILIKE for case-insensitive search in PostgreSQL including building, floor and room
	whereClause := "name ILIKE ? OR code ILIKE ? OR description ILIKE ? OR building ILIKE ? OR floor ILIKE ? OR room ILIKE ?"
	r.db.Table("locations").
		Where(whereClause, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery).
		Count(&count)

	fmt.Printf("DEBUG: Search found %d matching locations\n", count)

	// Get the matching locations
	err := r.db.Table("locations").
		Where(whereClause, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery).
		Offset(offset).
		Limit(pageSize).
		Order("created_at desc").
		Find(&locations).Error

	if err != nil {
		fmt.Printf("DEBUG: Error during search: %v\n", err)
		return &locations, count, err
	}

	// Debug the results
	for i, loc := range locations {
		fmt.Printf("DEBUG: Search result %d: ID=%d, Name=%s, Code=%s\n", i+1, loc.ID, loc.Name, loc.Code)
	}

	return &locations, count, err
}
