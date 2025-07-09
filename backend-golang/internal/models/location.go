package models

import (
	"time"

	"gorm.io/gorm"
)

// Location represents a physical location where assets can be stored or used
type Location struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" binding:"required"`
	Code        string    `json:"code" binding:"required"`
	Description string    `json:"description"`
	Building    string    `json:"building"`
	Floor       string    `json:"floor"`
	Room        string    `json:"room"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// BeforeCreate is a GORM hook that runs before creating a new location
func (l *Location) BeforeCreate(tx *gorm.DB) error {
	l.CreatedAt = time.Now()
	l.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate is a GORM hook that runs before updating an existing location
func (l *Location) BeforeUpdate(tx *gorm.DB) error {
	l.UpdatedAt = time.Now()
	return nil
}
