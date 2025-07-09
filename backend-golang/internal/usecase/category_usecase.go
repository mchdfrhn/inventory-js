package usecase

import (
	"en-inventory/internal/domain"

	"github.com/google/uuid"
)

type assetCategoryUsecase struct {
	categoryRepo domain.AssetCategoryRepository
}

func NewAssetCategoryUsecase(categoryRepo domain.AssetCategoryRepository) domain.AssetCategoryUsecase {
	return &assetCategoryUsecase{
		categoryRepo: categoryRepo,
	}
}

func (u *assetCategoryUsecase) CreateCategory(category *domain.AssetCategory) error {
	return u.categoryRepo.Create(category)
}

func (u *assetCategoryUsecase) UpdateCategory(category *domain.AssetCategory) error {
	_, err := u.categoryRepo.GetByID(category.ID)
	if err != nil {
		return err
	}
	return u.categoryRepo.Update(category)
}

func (u *assetCategoryUsecase) DeleteCategory(id uuid.UUID) error {
	return u.categoryRepo.Delete(id)
}

func (u *assetCategoryUsecase) GetCategory(id uuid.UUID) (*domain.AssetCategory, error) {
	return u.categoryRepo.GetByID(id)
}

func (u *assetCategoryUsecase) ListCategories() ([]domain.AssetCategory, error) {
	return u.categoryRepo.List()
}

func (u *assetCategoryUsecase) ListCategoriesPaginated(page, pageSize int) ([]domain.AssetCategory, int, error) {
	return u.categoryRepo.ListPaginated(page, pageSize)
}
