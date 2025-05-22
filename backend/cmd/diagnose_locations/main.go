package main

import (
	"fmt"
	"log"
	"time"

	"en-inventory/internal/domain"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Connect to database with hardcoded credentials
	dsn := "host=localhost user=inventory password=inventory dbname=inventory_db port=5432 sslmode=disable TimeZone=Asia/Jakarta"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected to database...")

	// Show database schema of locations table
	var result map[string]interface{}
	if err := db.Raw("SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'locations'").Find(&result).Error; err != nil {
		log.Fatalf("Failed to get table schema: %v", err)
	}
	fmt.Println("Locations table schema:", result)

	// Count locations
	var count int64
	if err := db.Model(&domain.Location{}).Count(&count).Error; err != nil {
		log.Fatalf("Failed to count locations: %v", err)
	}
	fmt.Printf("Total locations in database: %d\n", count)

	// Get all locations directly using SQL
	type LocationRow struct {
		ID          uint
		Name        string
		Code        string
		Description string
		CreatedAt   time.Time
		UpdatedAt   time.Time
	}

	var locationsSQL []LocationRow
	if err := db.Raw("SELECT id, name, code, description, created_at, updated_at FROM locations").Scan(&locationsSQL).Error; err != nil {
		log.Fatalf("Failed to fetch locations with SQL: %v", err)
	}
	fmt.Printf("Locations from SQL (%d records):\n", len(locationsSQL))
	for i, loc := range locationsSQL {
		fmt.Printf("%d. ID: %d, Name: %s, Code: %s\n", i+1, loc.ID, loc.Name, loc.Code)
	}

	// Get all locations using GORM
	var locations []domain.Location
	if err := db.Find(&locations).Error; err != nil {
		log.Fatalf("Failed to fetch locations with GORM: %v", err)
	}
	fmt.Printf("Locations from GORM (%d records):\n", len(locations))
	for i, loc := range locations {
		fmt.Printf("%d. ID: %d, Name: %s, Code: %s\n", i+1, loc.ID, loc.Name, loc.Code)
	}

	// Check location repository via API emulation
	fmt.Println("\nTesting location repository...")
	locationRepo := &LocationRepository{db: db}
	results, total, err := locationRepo.List(1, 10)
	if err != nil {
		log.Fatalf("Repository list failed: %v", err)
	}
	fmt.Printf("Total from repository: %d, returned results: %d\n", total, len(results))
}

// LocationRepository is a copy of the actual repository for debugging
type LocationRepository struct {
	db *gorm.DB
}

func (r *LocationRepository) List(page, pageSize int) ([]domain.Location, int, error) {
	var locations []domain.Location
	var total int64

	// Debug: Print query parameters
	fmt.Printf("Listing locations: page=%d, pageSize=%d\n", page, pageSize)

	// Get total count
	if err := r.db.Model(&domain.Location{}).Count(&total).Error; err != nil {
		fmt.Printf("Error getting total count: %v\n", err)
		return nil, 0, err
	}

	fmt.Printf("Total locations found: %d\n", total)

	// Get paginated results with order
	offset := (page - 1) * pageSize
	result := r.db.Table("locations").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&locations)

	if result.Error != nil {
		fmt.Printf("Error getting locations: %v\n", result.Error)
		return nil, 0, result.Error
	}

	fmt.Printf("Retrieved %d locations\n", len(locations))
	for i, loc := range locations {
		fmt.Printf("Location %d: ID=%d, Name=%s\n", i+1, loc.ID, loc.Name)
	}

	return locations, int(total), nil
}
