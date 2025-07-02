package usecase

import (
	"en-inventory/internal/domain"
	"fmt"
	"strconv"
	"strings"

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

// Key fix for sequence issue
func (u *assetUsecase) GetNextAvailableSequenceRange(count int) (int, error) {
	allAssets, err := u.assetRepo.List(map[string]interface{}{})
	if err != nil {
		return 0, err
	}

	existingSequences := make(map[int]bool)
	for _, asset := range allAssets {
		code := asset.Kode
		// Parse asset code format: 001.10.1.24.001
		if len(code) > 0 {
			parts := strings.Split(code, ".")
			if len(parts) == 5 {
				// Last part is the sequence number
				if sequence, err := strconv.Atoi(parts[4]); err == nil {
					existingSequences[sequence] = true
				}
			}
		}
	}

	start := 1
	for {
		canAllocate := true
		for i := 0; i < count; i++ {
			if existingSequences[start+i] {
				canAllocate = false
				break
			}
		}
		if canAllocate {
			return start, nil
		}
		start++
	}
}

func (u *assetUsecase) CreateAssetWithSequence(asset *domain.Asset, sequence int) error {
	code, err := u.generateAssetCodeWithSequence(asset, sequence)
	if err != nil {
		return err
	}
	asset.Kode = code
	asset.ID = uuid.New()
	return u.assetRepo.Create(asset)
}

func (u *assetUsecase) CreateBulkAssetWithSequence(asset *domain.Asset, quantity int, startSequence int) ([]domain.Asset, error) {
	bulkID := uuid.New()
	assets := make([]domain.Asset, quantity)
	for i := 0; i < quantity; i++ {
		assets[i] = *asset
		assets[i].ID = uuid.New()
		assets[i].BulkID = &bulkID
		assets[i].BulkSequence = i + 1
		assets[i].BulkTotalCount = quantity
		assets[i].IsBulkParent = (i == 0)
		assets[i].Quantity = 1
		code, err := u.generateAssetCodeWithSequence(asset, startSequence+i)
		if err != nil {
			return nil, err
		}
		assets[i].Kode = code
	}
	return assets, u.assetRepo.CreateBulk(assets)
}

func (u *assetUsecase) generateAssetCodeWithSequence(asset *domain.Asset, sequence int) (string, error) {
	locationCode := "001"
	if asset.LokasiID != nil {
		location, err := u.locationRepo.GetByID(*asset.LokasiID)
		if err == nil && location.Code != "" {
			locationCode = fmt.Sprintf("%03s", location.Code)
		}
	}

	categoryCode := "10"
	if asset.CategoryID != uuid.Nil {
		category, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err == nil && category.Code != "" {
			categoryCode = fmt.Sprintf("%02s", category.Code)
		}
	}

	procurementMap := map[string]string{
		"pembelian": "1", "bantuan": "2", "hibah": "3",
		"sumbangan": "4", "produksi_sendiri": "5",
	}
	procurementCode := procurementMap[asset.AsalPengadaan]
	if procurementCode == "" {
		procurementCode = "1"
	}

	year := asset.TanggalPerolehan.Year()
	yearCode := fmt.Sprintf("%02d", year%100)
	sequenceCode := fmt.Sprintf("%03d", sequence)

	return fmt.Sprintf("%s.%s.%s.%s.%s", locationCode, categoryCode, procurementCode, yearCode, sequenceCode), nil
}

func (u *assetUsecase) CreateAsset(asset *domain.Asset) error {
	sequence, err := u.GetNextAvailableSequenceRange(1)
	if err != nil {
		return err
	}
	return u.CreateAssetWithSequence(asset, sequence)
}

func (u *assetUsecase) CreateBulkAsset(asset *domain.Asset, quantity int) ([]domain.Asset, error) {
	startSequence, err := u.GetNextAvailableSequenceRange(quantity)
	if err != nil {
		return nil, err
	}
	return u.CreateBulkAssetWithSequence(asset, quantity, startSequence)
}

// Required interface methods
func (u *assetUsecase) UpdateAsset(asset *domain.Asset) error { return u.assetRepo.Update(asset) }
func (u *assetUsecase) DeleteAsset(id uuid.UUID) error        { return u.assetRepo.Delete(id) }
func (u *assetUsecase) DeleteBulkAssets(bulkID uuid.UUID) error {
	return u.assetRepo.DeleteBulkAssets(bulkID)
}
func (u *assetUsecase) GetAsset(id uuid.UUID) (*domain.Asset, error) { return u.assetRepo.GetByID(id) }
func (u *assetUsecase) GetBulkAssets(bulkID uuid.UUID) ([]domain.Asset, error) {
	return u.assetRepo.GetBulkAssets(bulkID)
}
func (u *assetUsecase) ListAssets(filter map[string]interface{}) ([]domain.Asset, error) {
	return u.assetRepo.List(filter)
}
func (u *assetUsecase) ListAssetsPaginated(filter map[string]interface{}, page, pageSize int) ([]domain.Asset, int, error) {
	return u.assetRepo.ListPaginated(filter, page, pageSize)
}
func (u *assetUsecase) ListAssetsWithBulk(filter map[string]interface{}, page, pageSize int) ([]domain.Asset, int, error) {
	return u.assetRepo.ListPaginatedWithBulk(filter, page, pageSize)
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
