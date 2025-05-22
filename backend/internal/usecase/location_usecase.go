package usecase

import (
	"en-inventory/internal/domain"
)

type locationUseCase struct {
	locationRepo domain.LocationRepository
}

// NewLocationUseCase creates a new location use case
func NewLocationUseCase(locationRepo domain.LocationRepository) domain.LocationUseCase {
	return &locationUseCase{
		locationRepo: locationRepo,
	}
}

// Create adds a new location
func (u *locationUseCase) Create(location *domain.Location) error {
	return u.locationRepo.Create(location)
}

// Update updates an existing location
func (u *locationUseCase) Update(id uint, location *domain.Location) error {
	return u.locationRepo.Update(id, location)
}

// Delete removes a location
func (u *locationUseCase) Delete(id uint) error {
	return u.locationRepo.Delete(id)
}

// GetByID retrieves a location by its ID
func (u *locationUseCase) GetByID(id uint) (*domain.Location, error) {
	return u.locationRepo.GetByID(id)
}

// List retrieves all locations with pagination
func (u *locationUseCase) List(page, pageSize int) ([]domain.Location, int, error) {
	return u.locationRepo.List(page, pageSize)
}

// Search locations by name or code
func (u *locationUseCase) Search(query string, page, pageSize int) (*[]domain.Location, int64, error) {
	return u.locationRepo.Search(query, page, pageSize)
}
