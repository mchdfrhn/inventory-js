package usecase

import (
	"en-inventory/internal/domain"

	"github.com/google/uuid"
)

type assetUsecase struct {
	assetRepo    domain.AssetRepository
	categoryRepo domain.AssetCategoryRepository
}

func NewAssetUsecase(assetRepo domain.AssetRepository, categoryRepo domain.AssetCategoryRepository) domain.AssetUsecase {
	return &assetUsecase{
		assetRepo:    assetRepo,
		categoryRepo: categoryRepo,
	}
}

func (u *assetUsecase) CreateAsset(asset *domain.Asset) error {
	// Validate category exists
	if asset.CategoryID != uuid.Nil {
		_, err := u.categoryRepo.GetByID(asset.CategoryID)
		if err != nil {
			return err
		}
	}
	return u.assetRepo.Create(asset)
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
