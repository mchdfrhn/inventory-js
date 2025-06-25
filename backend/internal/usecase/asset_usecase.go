package usecase

import (
	"en-inventory/internal/domain"
	"fmt"

	"github.com/google/uuid"
)

type assetUsecase struct {
	assetRepo       domain.AssetRepository
	categoryRepo    domain.AssetCategoryRepository
	locationRepo    domain.LocationRepository
	auditLogUsecase domain.AuditLogUsecase
}

func NewAssetUsecase(assetRepo domain.AssetRepository, categoryRepo domain.AssetCategoryRepository, locationRepo domain.LocationRepository, auditLogUsecase domain.AuditLogUsecase) domain.AssetUsecase {
	return &assetUsecase{
		assetRepo:       assetRepo,
		categoryRepo:    categoryRepo,
		locationRepo:    locationRepo,
		auditLogUsecase: auditLogUsecase,
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

	// Create the asset
	err := u.assetRepo.Create(asset)
	if err != nil {
		return err
	}

	// Log the creation activity
	if u.auditLogUsecase != nil {
		u.auditLogUsecase.LogActivity(
			"asset",
			asset.ID,
			"create",
			nil,
			asset,
			fmt.Sprintf("Asset '%s' created with code '%s'", asset.Nama, asset.Kode),
			nil,
		)
	}

	return nil
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
	// Validate asset exists and get current data
	existingAsset, err := u.assetRepo.GetByID(asset.ID)
	if err != nil {
		return err
	}

	fmt.Printf("=== DEBUG UpdateAsset START ===\n")
	fmt.Printf("Asset ID: %s\n", asset.ID.String())
	fmt.Printf("Asset Name: %s -> %s\n", existingAsset.Nama, asset.Nama)
	fmt.Printf("Existing BulkID: %v\n", existingAsset.BulkID)
	fmt.Printf("Existing IsBulkParent: %t\n", existingAsset.IsBulkParent)
	fmt.Printf("Existing BulkTotalCount: %d\n", existingAsset.BulkTotalCount)

	// Validate category exists if provided
	if asset.CategoryID != uuid.Nil {
		_, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err != nil {
			return err
		}
	}

	// Preserve kode and quantity to prevent manual editing
	asset.Kode = existingAsset.Kode
	asset.Quantity = existingAsset.Quantity

	// Check if structural components changed that affect the asset code
	needsCodeRegeneration := false

	// Check location change
	if (asset.LokasiID == nil && existingAsset.LokasiID != nil) ||
		(asset.LokasiID != nil && existingAsset.LokasiID == nil) ||
		(asset.LokasiID != nil && existingAsset.LokasiID != nil && *asset.LokasiID != *existingAsset.LokasiID) {
		needsCodeRegeneration = true
	}

	// Check category change
	if asset.CategoryID != existingAsset.CategoryID {
		needsCodeRegeneration = true
	}

	// Check procurement source change
	if asset.AsalPengadaan != existingAsset.AsalPengadaan {
		needsCodeRegeneration = true
	}

	// Check procurement year change
	if asset.TanggalPerolehan.Year() != existingAsset.TanggalPerolehan.Year() {
		needsCodeRegeneration = true
	}

	fmt.Printf("needsCodeRegeneration: %t\n", needsCodeRegeneration)

	// Regenerate code if structural components changed
	if needsCodeRegeneration {
		// For bulk assets, only regenerate if this is the bulk parent
		if existingAsset.BulkID != nil && !existingAsset.IsBulkParent {
			// For non-parent bulk assets, don't regenerate - they should follow the parent
			// This prevents breaking the bulk sequence
			fmt.Printf("Skipping code regeneration for non-parent bulk asset\n")
		} else {
			// Extract the current sequence number to preserve it
			currentSequence := u.extractSequenceFromCode(existingAsset.Kode)

			// Generate new code with the same sequence but updated structural components
			newCode, err := u.generateAssetCodeWithSequence(asset, currentSequence)
			if err != nil {
				return err
			}
			asset.Kode = newCode

			// If this is a bulk parent, update all related bulk assets
			if existingAsset.BulkID != nil && existingAsset.IsBulkParent {
				fmt.Printf("Calling updateBulkAssetsCodes due to code regeneration\n")
				err = u.updateBulkAssetsCodes(existingAsset.BulkID, asset, currentSequence)
				if err != nil {
					return err
				}
			}
		}
	}

	// Update the asset first
	fmt.Printf("Updating main asset...\n")
	err = u.assetRepo.Update(asset)
	if err != nil {
		fmt.Printf("Error updating main asset: %v\n", err)
		return err
	}
	fmt.Printf("Main asset updated successfully\n")

	// ALWAYS update bulk assets if this is a bulk parent, regardless of code regeneration
	if existingAsset.BulkID != nil && existingAsset.IsBulkParent {
		fmt.Printf("Asset is bulk parent, BulkID=%s, needsCodeRegeneration=%t\n", existingAsset.BulkID.String(), needsCodeRegeneration)

		// If code was regenerated, we already updated all bulk assets above
		// If not, we need to update them now with the new data
		if !needsCodeRegeneration {
			fmt.Printf("Calling updateBulkAssetsData for BulkID=%s\n", existingAsset.BulkID.String())
			err = u.updateBulkAssetsData(existingAsset.BulkID, asset)
			if err != nil {
				fmt.Printf("Error in updateBulkAssetsData: %v\n", err)
				return err
			}
		} else {
			fmt.Printf("Code regeneration was done, bulk assets already updated\n")
		}
	} else {
		fmt.Printf("Asset is NOT bulk parent, BulkID=%v, IsBulkParent=%t\n", existingAsset.BulkID, existingAsset.IsBulkParent)
	}

	// Log the update activity
	if u.auditLogUsecase != nil {
		u.auditLogUsecase.LogActivity(
			"asset",
			asset.ID,
			"update",
			existingAsset,
			asset,
			fmt.Sprintf("Asset '%s' updated", asset.Nama),
			nil,
		)
	}

	fmt.Printf("=== DEBUG UpdateAsset END ===\n")
	return nil
}

func (u *assetUsecase) DeleteAsset(id uuid.UUID) error {
	// Get asset data before deletion for audit log
	existingAsset, err := u.assetRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Delete the asset
	err = u.assetRepo.Delete(id)
	if err != nil {
		return err
	}

	// Log the deletion activity
	if u.auditLogUsecase != nil {
		u.auditLogUsecase.LogActivity(
			"asset",
			id,
			"delete",
			existingAsset,
			nil,
			fmt.Sprintf("Asset '%s' with code '%s' deleted", existingAsset.Nama, existingAsset.Kode),
			nil,
		)
	}

	return nil
}

// DeleteBulkAssets menghapus semua asset dalam satu bulk berdasarkan bulk_id
func (u *assetUsecase) DeleteBulkAssets(bulkID uuid.UUID) error {
	// Get bulk assets before deletion for audit log
	bulkAssets, err := u.assetRepo.GetBulkAssets(bulkID)
	if err != nil {
		return err
	}

	// Delete the bulk assets
	err = u.assetRepo.DeleteBulkAssets(bulkID)
	if err != nil {
		return err
	}

	// Log the bulk deletion activity
	if u.auditLogUsecase != nil && len(bulkAssets) > 0 {
		// Log for each asset in the bulk
		for _, asset := range bulkAssets {
			u.auditLogUsecase.LogActivity(
				"asset",
				asset.ID,
				"delete",
				asset,
				nil,
				fmt.Sprintf("Asset '%s' with code '%s' deleted as part of bulk deletion", asset.Nama, asset.Kode),
				map[string]string{"bulk_id": bulkID.String()},
			)
		}

		// Log the bulk operation itself
		if len(bulkAssets) > 0 {
			parentAsset := bulkAssets[0]
			if parentAsset.IsBulkParent {
				u.auditLogUsecase.LogActivity(
					"asset",
					parentAsset.ID,
					"bulk_delete",
					nil,
					nil,
					fmt.Sprintf("Bulk delete operation: %d assets deleted", len(bulkAssets)),
					map[string]string{"bulk_id": bulkID.String(), "count": fmt.Sprintf("%d", len(bulkAssets))},
				)
			}
		}
	}

	return nil
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

// extractSequenceFromCode extracts the 3-digit sequence number from asset code
func (u *assetUsecase) extractSequenceFromCode(kode string) int {
	// For bulk assets (those with "-XXX" suffix), extract sequence from parent code
	if len(kode) > 4 && kode[len(kode)-4] == '-' {
		// Extract the parent code (everything before the last "-XXX")
		parentCode := kode[:len(kode)-4]
		if len(parentCode) >= 3 {
			lastThreeDigits := parentCode[len(parentCode)-3:]
			var sequence int
			if n, err := fmt.Sscanf(lastThreeDigits, "%d", &sequence); err == nil && n == 1 {
				return sequence
			}
		}
	} else {
		// For normal asset codes, extract last 3 digits
		if len(kode) >= 3 {
			lastThreeDigits := kode[len(kode)-3:]
			var sequence int
			if n, err := fmt.Sscanf(lastThreeDigits, "%d", &sequence); err == nil && n == 1 {
				return sequence
			}
		}
	}
	return 0
}

// generateAssetCodeWithSequence generates asset code with a specific sequence number
func (u *assetUsecase) generateAssetCodeWithSequence(asset *domain.Asset, sequence int) (string, error) {
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
	yearCode := fmt.Sprintf("%02d", year%100)

	// E = Use the provided sequence number
	sequenceCode := fmt.Sprintf("%03d", sequence)

	return fmt.Sprintf("%s.%s.%s.%s.%s", locationCode, categoryCode, procurementCode, yearCode, sequenceCode), nil
}

// updateBulkAssetsCodes updates all assets in a bulk group with new codes
func (u *assetUsecase) updateBulkAssetsCodes(bulkID *uuid.UUID, templateAsset *domain.Asset, startSequence int) error {
	// Get all bulk assets
	bulkAssets, err := u.assetRepo.GetBulkAssets(*bulkID)
	if err != nil {
		return err
	}

	fmt.Printf("DEBUG: updateBulkAssetsCodes called with bulkID=%s, found %d assets\n", bulkID.String(), len(bulkAssets))
	fmt.Printf("DEBUG: Template asset name: %s, startSequence: %d\n", templateAsset.Nama, startSequence)

	// Update each bulk asset's code
	for i, bulkAsset := range bulkAssets {
		newSequence := startSequence + i
		newCode, err := u.generateAssetCodeWithSequence(templateAsset, newSequence)
		if err != nil {
			return err
		}

		fmt.Printf("DEBUG: Updating bulk asset %d: %s -> %s, code: %s -> %s\n", i+1, bulkAsset.Nama, templateAsset.Nama, bulkAsset.Kode, newCode)

		// Create updated asset with new code and apply ALL changes from template
		updatedAsset := bulkAsset

		// Update code with new sequence
		updatedAsset.Kode = newCode

		// Apply all field changes from template asset (except ID, bulk info, and auto-calculated fields)
		updatedAsset.Nama = templateAsset.Nama
		updatedAsset.Spesifikasi = templateAsset.Spesifikasi
		updatedAsset.Satuan = templateAsset.Satuan
		updatedAsset.TanggalPerolehan = templateAsset.TanggalPerolehan
		updatedAsset.HargaPerolehan = templateAsset.HargaPerolehan
		updatedAsset.UmurEkonomisTahun = templateAsset.UmurEkonomisTahun
		updatedAsset.Keterangan = templateAsset.Keterangan
		updatedAsset.Lokasi = templateAsset.Lokasi
		updatedAsset.LokasiID = templateAsset.LokasiID
		updatedAsset.AsalPengadaan = templateAsset.AsalPengadaan
		updatedAsset.CategoryID = templateAsset.CategoryID
		updatedAsset.Status = templateAsset.Status

		// Note: Quantity, BulkID, BulkSequence, IsBulkParent, BulkTotalCount
		// are preserved from the original asset to maintain bulk integrity
		// Auto-calculated fields (UmurEkonomisBulan, AkumulasiPenyusutan, NilaiSisa)
		// will be recalculated by the repository Update method

		err = u.assetRepo.Update(&updatedAsset)
		if err != nil {
			fmt.Printf("DEBUG: Error updating asset %s: %v\n", updatedAsset.Kode, err)
			return err
		}
		fmt.Printf("DEBUG: Successfully updated asset %s\n", updatedAsset.Kode)
	}

	fmt.Printf("DEBUG: updateBulkAssetsCodes completed successfully for %d assets\n", len(bulkAssets))
	return nil
}

// updateBulkAssetsData updates all assets in a bulk group with new data (without code regeneration)
func (u *assetUsecase) updateBulkAssetsData(bulkID *uuid.UUID, templateAsset *domain.Asset) error {
	// Get all bulk assets
	bulkAssets, err := u.assetRepo.GetBulkAssets(*bulkID)
	if err != nil {
		return err
	}

	fmt.Printf("DEBUG: updateBulkAssetsData called with bulkID=%s, found %d assets\n", bulkID.String(), len(bulkAssets))
	fmt.Printf("DEBUG: Template asset name: %s\n", templateAsset.Nama)

	// Update each bulk asset's data (preserving codes and bulk structure)
	for i, bulkAsset := range bulkAssets {
		fmt.Printf("DEBUG: Updating bulk asset %d: %s -> %s\n", i+1, bulkAsset.Nama, templateAsset.Nama)

		// Create updated asset, preserving codes and bulk info
		updatedAsset := bulkAsset

		// Apply all field changes from template asset (except ID, codes, and bulk info)
		updatedAsset.Nama = templateAsset.Nama
		updatedAsset.Spesifikasi = templateAsset.Spesifikasi
		updatedAsset.Satuan = templateAsset.Satuan
		updatedAsset.TanggalPerolehan = templateAsset.TanggalPerolehan
		updatedAsset.HargaPerolehan = templateAsset.HargaPerolehan
		updatedAsset.UmurEkonomisTahun = templateAsset.UmurEkonomisTahun
		updatedAsset.Keterangan = templateAsset.Keterangan
		updatedAsset.Lokasi = templateAsset.Lokasi
		updatedAsset.LokasiID = templateAsset.LokasiID
		updatedAsset.AsalPengadaan = templateAsset.AsalPengadaan
		updatedAsset.CategoryID = templateAsset.CategoryID
		updatedAsset.Status = templateAsset.Status

		// Note: Kode, Quantity, BulkID, BulkSequence, IsBulkParent, BulkTotalCount
		// are preserved from the original asset to maintain bulk integrity
		// Auto-calculated fields (UmurEkonomisBulan, AkumulasiPenyusutan, NilaiSisa)
		// will be recalculated by the repository Update method

		err = u.assetRepo.Update(&updatedAsset)
		if err != nil {
			fmt.Printf("DEBUG: Error updating asset %s: %v\n", updatedAsset.Kode, err)
			return err
		}
		fmt.Printf("DEBUG: Successfully updated asset %s\n", updatedAsset.Kode)
	}

	fmt.Printf("DEBUG: updateBulkAssetsData completed successfully for %d assets\n", len(bulkAssets))
	return nil
}
