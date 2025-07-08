# Installation Guide - Inventory System

## Quick Installation untuk Tempat Lain

### 1. Prerequisites
- PostgreSQL 12+ 
- Go 1.19+
- Node.js 16+

### 2. Database Setup
```bash
# Create database
createdb inventory_system

# Set database credentials in config.yaml
```

### 3. Run Migrations (2 Files Only!)
```bash
# Method 1: Using golang-migrate
migrate -path ./migrations -database "postgres://user:pass@localhost/inventory_system?sslmode=disable" up

# Method 2: Manual execution
psql -U username -d inventory_system -f migrations/000001_create_complete_schema.up.sql
psql -U username -d inventory_system -f migrations/000002_insert_default_data.up.sql
```

### 4. Validate Installation
```bash
./validate_migrations.sh
```

### 5. Run Application
```bash
# Backend
go run cmd/main.go

# Frontend
cd ../frontend
npm install
npm run dev
```

## Schema Overview

### Tables Created:
1. **asset_categories** - Categories for assets (Elektronik, Furniture, etc.)
2. **locations** - Physical locations (Buildings, floors, rooms)
3. **assets** - Main asset table with complete information
4. **audit_logs** - Track all changes

### Key Features:
- ✅ Complete schema in 1 migration
- ✅ All indexes for performance
- ✅ Foreign key constraints
- ✅ Automatic timestamps
- ✅ Soft delete support
- ✅ Bulk asset support
- ✅ Audit trail
- ✅ Default data included

### Performance Optimizations:
- 15+ indexes for fast queries
- Composite indexes for complex searches
- Proper foreign key relationships
- Automatic updated_at triggers

## Rollback (if needed)
```bash
# Rollback default data
psql -U username -d inventory_system -f migrations/000002_insert_default_data.down.sql

# Rollback complete schema
psql -U username -d inventory_system -f migrations/000001_create_complete_schema.down.sql
```

## Production Notes:
- Review default data before production
- Customize location codes for your organization
- Set up proper backup strategy
- Monitor index usage and optimize as needed
