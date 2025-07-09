package database

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
)

// QueryBuilder provides database-agnostic query building methods
type QueryBuilder struct {
	dialect string
}

// NewQueryBuilder creates a new query builder for the specified dialect
func NewQueryBuilder(dialect string) *QueryBuilder {
	return &QueryBuilder{
		dialect: dialect,
	}
}

// BuildTextSearchQuery builds a text search query based on the database dialect
func (qb *QueryBuilder) BuildTextSearchQuery(db *gorm.DB, field, searchTerm string) *gorm.DB {
	switch qb.dialect {
	case "postgres":
		return db.Where(fmt.Sprintf("%s ILIKE ?", field), "%"+searchTerm+"%")
	case "mysql":
		return db.Where(fmt.Sprintf("MATCH(%s) AGAINST(? IN BOOLEAN MODE)", field), searchTerm+"*")
	case "sqlite":
		return db.Where(fmt.Sprintf("%s LIKE ? COLLATE NOCASE", field), "%"+searchTerm+"%")
	default:
		// Fallback to LIKE for unknown dialects
		return db.Where(fmt.Sprintf("%s LIKE ?", field), "%"+searchTerm+"%")
	}
}

// BuildFullTextSearchQuery builds a full-text search query for multiple fields
func (qb *QueryBuilder) BuildFullTextSearchQuery(db *gorm.DB, fields []string, searchTerm string) *gorm.DB {
	switch qb.dialect {
	case "postgres":
		// Use PostgreSQL's full-text search with to_tsvector
		searchVector := fmt.Sprintf("to_tsvector('indonesian', %s)", strings.Join(fields, " || ' ' || "))
		return db.Where(fmt.Sprintf("%s @@ plainto_tsquery('indonesian', ?)", searchVector), searchTerm)
	case "mysql":
		// Use MySQL's MATCH...AGAINST for full-text search
		fieldList := strings.Join(fields, ", ")
		return db.Where(fmt.Sprintf("MATCH(%s) AGAINST(? IN BOOLEAN MODE)", fieldList), searchTerm+"*")
	case "sqlite":
		// SQLite doesn't have built-in full-text search, so use LIKE on multiple fields
		query := db
		for i, field := range fields {
			if i == 0 {
				query = query.Where(fmt.Sprintf("%s LIKE ? COLLATE NOCASE", field), "%"+searchTerm+"%")
			} else {
				query = query.Or(fmt.Sprintf("%s LIKE ? COLLATE NOCASE", field), "%"+searchTerm+"%")
			}
		}
		return query
	default:
		// Fallback for unknown dialects
		query := db
		for i, field := range fields {
			if i == 0 {
				query = query.Where(fmt.Sprintf("%s LIKE ?", field), "%"+searchTerm+"%")
			} else {
				query = query.Or(fmt.Sprintf("%s LIKE ?", field), "%"+searchTerm+"%")
			}
		}
		return query
	}
}

// BuildDateRangeQuery builds a date range query
func (qb *QueryBuilder) BuildDateRangeQuery(db *gorm.DB, field, startDate, endDate string) *gorm.DB {
	switch qb.dialect {
	case "postgres":
		return db.Where(fmt.Sprintf("%s::date BETWEEN ? AND ?", field), startDate, endDate)
	case "mysql":
		return db.Where(fmt.Sprintf("DATE(%s) BETWEEN ? AND ?", field), startDate, endDate)
	case "sqlite":
		return db.Where(fmt.Sprintf("date(%s) BETWEEN ? AND ?", field), startDate, endDate)
	default:
		return db.Where(fmt.Sprintf("%s BETWEEN ? AND ?", field), startDate, endDate)
	}
}

// BuildLimitOffsetQuery builds a pagination query
func (qb *QueryBuilder) BuildLimitOffsetQuery(db *gorm.DB, limit, offset int) *gorm.DB {
	switch qb.dialect {
	case "postgres", "mysql", "sqlite":
		return db.Limit(limit).Offset(offset)
	default:
		return db.Limit(limit).Offset(offset)
	}
}

// BuildCaseInsensitiveOrderBy builds a case-insensitive order by clause
func (qb *QueryBuilder) BuildCaseInsensitiveOrderBy(field, direction string) string {
	switch qb.dialect {
	case "postgres":
		return fmt.Sprintf("LOWER(%s) %s", field, direction)
	case "mysql":
		return fmt.Sprintf("%s COLLATE utf8mb4_unicode_ci %s", field, direction)
	case "sqlite":
		return fmt.Sprintf("%s COLLATE NOCASE %s", field, direction)
	default:
		return fmt.Sprintf("%s %s", field, direction)
	}
}
