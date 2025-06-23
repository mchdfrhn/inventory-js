package usecase

import (
	"en-inventory/internal/domain"
	"fmt"

	"github.com/google/uuid"
)

type assetUsecase struct {
	assetRepo    domain.AssetRepository
	categoryRepo domain.AssetCategoryRepository
	locationRepo domain.LocationRepository
}

func NewAssetUsecase(assetRepo domain.AssetRepository, categoryRepo domain.AssetCategoryRepository, locationRepo domain.LocationRepository) domain.AssetUsecase {
	return &assetUsecase{
		assetRepo:    assetRepo,
		categoryRepo: categoryRepo,
		locationRepo: locationRepo,
	}
}

// generateAssetCode generates asset code based on location, category, procurement source, year, and sequence
func (u *assetUsecase) generateAssetCode(asset *domain.Asset) (string, error) {
	// A = Location code (3 digits) - default 001 if not found
	locationCode := "001"
	if asset.LokasiID != nil {
		location, err := u.locationRepo.GetByID(*asset.LokasiID)
		if err == nil && location.Code != "" {
			locationCode = fmt.Sprintf("%03s", location.Code)
		}
	}

	// B = Category code (2 digits) - default 10 if not found
	categoryCode := "10"
	if asset.CategoryID != uuid.Nil {
		category, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err == nil && category.Code != "" {
			categoryCode = fmt.Sprintf("%02s", category.Code)
		}
	}

	// C = Procurement source code (1 digit)
	procurementMap := map[string]string{
		"pembelian":        "1",
		"bantuan":          "2",
		"hibah":            "3",
		"sumbangan":        "4",
		"produksi_sendiri": "5",
	}
	procurementCode := procurementMap[asset.AsalPengadaan]
	if procurementCode == "" {
		procurementCode = "1" // default
	}
	// D = Procurement year (2 digits)
	year := asset.TanggalPerolehan.Year()
	yearCode := fmt.Sprintf("%02d", year%100) // E = Sequence number (3 digits) - find highest existing sequence + 1
	// Get all assets ordered by created_at DESC (newest first)
	allAssets, err := u.assetRepo.List(map[string]interface{}{})
	if err != nil {
		return "", err
	} // Find the next available sequence number by checking for gaps (fill missing numbers)
	// Based only on the last 3 digits (sequence number) of all asset codes
	existingSequences := make(map[int]bool)
	var sequenceCode string

	// If no assets exist, start from 001
	if len(allAssets) == 0 {
		sequenceCode = fmt.Sprintf("%03d", 1)
	} else {
		// Collect all existing sequence numbers from all asset codes
		for _, existingAsset := range allAssets {
			code := existingAsset.Kode

			// For bulk assets (those with "-XXX" suffix), extract sequence from parent code
			if len(code) > 4 && code[len(code)-4] == '-' {
				// Extract the parent code (everything before the last "-XXX")
				parentCode := code[:len(code)-4]
				if len(parentCode) >= 3 {
					lastThreeDigits := parentCode[len(parentCode)-3:]
					var sequence int
					if n, err := fmt.Sscanf(lastThreeDigits, "%d", &sequence); err == nil && n == 1 {
						existingSequences[sequence] = true
					}
				}
			} else {
				// For normal asset codes, extract last 3 digits
				if len(code) >= 3 {
					lastThreeDigits := code[len(code)-3:]
					var sequence int
					if n, err := fmt.Sscanf(lastThreeDigits, "%d", &sequence); err == nil && n == 1 {
						existingSequences[sequence] = true
					}
				}
			}
		}

		// Find the first available sequence number starting from 1
		nextSequence := 1
		for existingSequences[nextSequence] {
			nextSequence++
		}
		sequenceCode = fmt.Sprintf("%03d", nextSequence)
	}

	return fmt.Sprintf("%s.%s.%s.%s.%s", locationCode, categoryCode, procurementCode, yearCode, sequenceCode), nil
}

func (u *assetUsecase) CreateAsset(asset *domain.Asset) error {
	// Validate category exists
	if asset.CategoryID != uuid.Nil {
		_, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err != nil {
			return err
		}
	}

	// Generate asset code if not provided or empty
	if asset.Kode == "" {
		code, err := u.generateAssetCode(asset)
		if err != nil {
			return err
		}
		asset.Kode = code
	}

	return u.assetRepo.Create(asset)
}

func (u *assetUsecase) CreateBulkAsset(asset *domain.Asset, quantity int) ([]domain.Asset, error) {
	// Validate category exists
	if asset.CategoryID != uuid.Nil {
		_, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err != nil {
			return nil, err
		}
	}
	// Generate sequential asset codes for bulk creation
	codes, err := u.generateBulkAssetCodes(asset, quantity)
	if err != nil {
		return nil, err
	}
	// Generate bulk ID for grouping
	bulkID := uuid.New()

	// Create assets array
	assets := make([]domain.Asset, quantity)
	for i := 0; i < quantity; i++ {
		// Copy the original asset
		assets[i] = *asset
		assets[i].ID = uuid.New()
		assets[i].BulkID = &bulkID
		assets[i].BulkSequence = i + 1
		assets[i].BulkTotalCount = quantity
		assets[i].IsBulkParent = (i == 0) // First asset is the parent

		// Use the pre-generated sequential codes
		assets[i].Kode = codes[i]
	}

	err = u.assetRepo.CreateBulk(assets)
	if err != nil {
		return nil, err
	}

	return assets, nil
}

// generateBulkAssetCodes generates sequential asset codes for bulk creation
func (u *assetUsecase) generateBulkAssetCodes(asset *domain.Asset, quantity int) ([]string, error) {
	// A = Location code (3 digits) - default 001 if not found
	locationCode := "001"
	if asset.LokasiID != nil {
		location, err := u.locationRepo.GetByID(*asset.LokasiID)
		if err == nil && location.Code != "" {
			locationCode = fmt.Sprintf("%03s", location.Code)
		}
	}

	// B = Category code (2 digits) - default 10 if not found
	categoryCode := "10"
	if asset.CategoryID != uuid.Nil {
		category, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err == nil && category.Code != "" {
			categoryCode = fmt.Sprintf("%02s", category.Code)
		}
	}

	// C = Procurement source code (1 digit)
	procurementMap := map[string]string{
		"pembelian":        "1",
		"bantuan":          "2",
		"hibah":            "3",
		"sumbangan":        "4",
		"produksi_sendiri": "5",
	}
	procurementCode, exists := procurementMap[asset.AsalPengadaan]
	if !exists {
		procurementCode = "1" // default to pembelian
	}

	// D = Procurement year (2 digits)
	year := asset.TanggalPerolehan.Year()
	yearCode := fmt.Sprintf("%02d", year%100)

	// E = Get all assets to find available sequences
	allAssets, err := u.assetRepo.List(map[string]interface{}{})
	if err != nil {
		return nil, err
	}
	// Find consecutive available sequence numbers
	existingSequences := make(map[int]bool)

	// Collect all existing sequence numbers from all asset codes
	for _, existingAsset := range allAssets {
		code := existingAsset.Kode

		// For bulk assets (those with "-XXX" suffix), extract sequence from parent code
		if len(code) > 4 && code[len(code)-4] == '-' {
			// Extract the parent code (everything before the last "-XXX")
			parentCode := code[:len(code)-4]
			if len(parentCode) >= 3 {
				lastThreeDigits := parentCode[len(parentCode)-3:]
				var sequence int
				if n, err := fmt.Sscanf(lastThreeDigits, "%d", &sequence); err == nil && n == 1 {
					existingSequences[sequence] = true
				}
			}
		} else {
			// For normal asset codes, extract last 3 digits
			if len(code) >= 3 {
				lastThreeDigits := code[len(code)-3:]
				var sequence int
				if n, err := fmt.Sscanf(lastThreeDigits, "%d", &sequence); err == nil && n == 1 {
					existingSequences[sequence] = true
				}
			}
		}
	}

	// Find consecutive available sequences
	nextSequence := 1
	for {
		// Check if we have enough consecutive sequences available
		available := true
		for i := 0; i < quantity; i++ {
			if existingSequences[nextSequence+i] {
				available = false
				break
			}
		}

		if available {
			break
		}

		nextSequence++
	}

	// Generate codes for the bulk
	codes := make([]string, quantity)
	for i := 0; i < quantity; i++ {
		sequenceCode := fmt.Sprintf("%03d", nextSequence+i)
		codes[i] = fmt.Sprintf("%s.%s.%s.%s.%s", locationCode, categoryCode, procurementCode, yearCode, sequenceCode)
	}

	return codes, nil
}

func (u *assetUsecase) UpdateAsset(asset *domain.Asset) error {
	// Validate asset exists
	_, err := u.assetRepo.GetByID(asset.ID)
	if err != nil {
		return err
	}

	// Validate category exists if provided
	if asset.CategoryID != uuid.Nil {
		_, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err != nil {
			return err
		}
	}

	return u.assetRepo.Update(asset)
}

func (u *assetUsecase) DeleteAsset(id uuid.UUID) error {
	return u.assetRepo.Delete(id)
}

func (u *assetUsecase) GetAsset(id uuid.UUID) (*domain.Asset, error) {
	return u.assetRepo.GetByID(id)
}

func (u *assetUsecase) ListAssets(filter map[string]interface{}) ([]domain.Asset, error) {
	return u.assetRepo.List(filter)
}

func (u *assetUsecase) ListAssetsPaginated(filter map[string]interface{}, page, pageSize int) ([]domain.Asset, int, error) {
	// Validate category exists if category_id is in filter
	if categoryID, ok := filter["category_id"]; ok {
		_, err := u.categoryRepo.GetByID(categoryID.(uuid.UUID))
		if err != nil {
			return nil, 0, err
		}
	}

	return u.assetRepo.ListPaginated(filter, page, pageSize)
}

func (u *assetUsecase) GetAllAssets() ([]domain.Asset, error) {
	return u.assetRepo.List(map[string]interface{}{})
}

func (u *assetUsecase) GetLocationByID(id uint) (*domain.Location, error) {
	return u.locationRepo.GetByID(id)
}

func (u *assetUsecase) GetCategoryByID(id uuid.UUID) (*domain.AssetCategory, error) {
	return u.categoryRepo.GetByID(id)
}

func (u *assetUsecase) GetLocationByCode(code string) (*domain.Location, error) {
	return u.locationRepo.GetByCode(code)
}

func (u *assetUsecase) GetCategoryByCode(code string) (*domain.AssetCategory, error) {
	return u.categoryRepo.GetByCode(code)
}

func (u *assetUsecase) GetBulkAssets(bulkID uuid.UUID) ([]domain.Asset, error) {
	return u.assetRepo.GetBulkAssets(bulkID)
}

func (u *assetUsecase) ListAssetsWithBulk(filter map[string]interface{}, page, pageSize int) ([]domain.Asset, int, error) {
	// Validate category exists if category_id is in filter
	if categoryID, ok := filter["category_id"]; ok {
		_, err := u.categoryRepo.GetByID(categoryID.(uuid.UUID))
		if err != nil {
			return nil, 0, err
		}
	}

	return u.assetRepo.ListPaginatedWithBulk(filter, page, pageSize)
}
