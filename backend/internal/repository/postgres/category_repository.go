package postgres

import (
	"en-inventory/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type assetCategoryRepository struct {
	db *gorm.DB
}

func NewAssetCategoryRepository(db *gorm.DB) domain.AssetCategoryRepository {
	return &assetCategoryRepository{db: db}
}

func (r *assetCategoryRepository) Create(category *domain.AssetCategory) error {
	if category.ID == uuid.Nil {
		category.ID = uuid.New()
	}
	return r.db.Create(category).Error
}

func (r *assetCategoryRepository) Update(category *domain.AssetCategory) error {
	return r.db.Save(category).Error
}

func (r *assetCategoryRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.AssetCategory{}, id).Error
}

func (r *assetCategoryRepository) GetByID(id uuid.UUID) (*domain.AssetCategory, error) {
	var category domain.AssetCategory
	err := r.db.First(&category, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *assetCategoryRepository) GetByCode(code string) (*domain.AssetCategory, error) {
	var category domain.AssetCategory
	err := r.db.Where("code = ?", code).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *assetCategoryRepository) List() ([]domain.AssetCategory, error) {
	var categories []domain.AssetCategory
	err := r.db.Order("code ASC").Find(&categories).Error
	return categories, err
}

func (r *assetCategoryRepository) ListPaginated(page, pageSize int) ([]domain.AssetCategory, int, error) {
	var categories []domain.AssetCategory
	var total int64

	// Get total count
	if err := r.db.Model(&domain.AssetCategory{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated records ordered by code ASC
	offset := (page - 1) * pageSize
	err := r.db.Order("code ASC").Offset(offset).Limit(pageSize).Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	return categories, int(total), nil
}
