package domain

import (
	"time"
)

// Location represents a physical location where assets can be stored
type Location struct {
	ID          uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string    `json:"name" gorm:"size:255;not null;unique"`
	Code        string    `json:"code" gorm:"size:50;not null;unique"`
	Description string    `json:"description" gorm:"type:text"`
	Building    string    `json:"building" gorm:"size:255"`
	Floor       string    `json:"floor" gorm:"size:50"`
	Room        string    `json:"room" gorm:"size:100"`
	Assets      []Asset   `json:"assets,omitempty" gorm:"foreignkey:LokasiID"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (Location) TableName() string {
	return "locations"
}

// LocationRepository defines methods to interact with locations in database
type LocationRepository interface {
	Create(location *Location) error
	Update(id uint, location *Location) error
	Delete(id uint) error
	GetByID(id uint) (*Location, error)
	List(page, pageSize int) ([]Location, int, error)
	Search(query string, page, pageSize int) (*[]Location, int64, error)
}

// LocationUseCase defines business logic for location management
type LocationUseCase interface {
	Create(location *Location) error
	Update(id uint, location *Location) error
	Delete(id uint) error
	GetByID(id uint) (*Location, error)
	List(page, pageSize int) ([]Location, int, error)
	Search(query string, page, pageSize int) (*[]Location, int64, error)
}
