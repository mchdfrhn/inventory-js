#!/bin/bash

# Script untuk memvalidasi migrasi database sebelum instalasi
# Usage: ./validate_migrations.sh

echo "🔍 Validasi Migrasi Database untuk Inventory System"
echo "=================================================="

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) tidak ditemukan"
    echo "   Install PostgreSQL client terlebih dahulu"
    exit 1
fi

# Create test database
DB_NAME="inventory_migration_test"
DB_USER="postgres"

echo "📋 Membuat database test: $DB_NAME"
psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

if [ $? -ne 0 ]; then
    echo "❌ Gagal membuat database test"
    exit 1
fi

echo "✅ Database test berhasil dibuat"

# Function to run migration and check result
run_migration() {
    local file=$1
    local num=$(basename "$file" | cut -d'_' -f1)
    
    echo "🔄 Menjalankan migrasi: $file"
    
    psql -U $DB_USER -d $DB_NAME -f "$file" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrasi $num berhasil"
        return 0
    else
        echo "❌ Migrasi $num gagal"
        psql -U $DB_USER -d $DB_NAME -f "$file"
        return 1
    fi
}

# Run migrations in order
echo ""
echo "🚀 Menjalankan migrasi secara berurutan..."
echo "----------------------------------------"

MIGRATION_FILES=(
    "migrations/000001_create_complete_schema.up.sql"
    "migrations/000002_insert_default_data.up.sql"
)

failed=0
for file in "${MIGRATION_FILES[@]}"; do
    if [ -f "$file" ]; then
        run_migration "$file"
        if [ $? -ne 0 ]; then
            failed=1
            break
        fi
    else
        echo "❌ File migrasi tidak ditemukan: $file"
        failed=1
        break
    fi
done

echo ""
if [ $failed -eq 0 ]; then
    echo "🎉 Semua migrasi berhasil dijalankan!"
    echo ""
    echo "📊 Validasi struktur database:"
    echo "-----------------------------"
    
    # Check table existence
    tables=("asset_categories" "assets" "locations" "audit_logs")
    for table in "${tables[@]}"; do
        count=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='$table';" | tr -d ' ')
        if [ "$count" -eq 1 ]; then
            echo "✅ Tabel $table: OK"
        else
            echo "❌ Tabel $table: TIDAK DITEMUKAN"
        fi
    done
    
    echo ""
    echo "🔗 Validasi foreign key constraints:"
    echo "-----------------------------------"
    
    # Check foreign keys
    fk_count=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY';" | tr -d ' ')
    echo "✅ Total foreign key constraints: $fk_count"
    
    # Check specific foreign keys
    psql -U $DB_USER -d $DB_NAME -c "SELECT tc.table_name, tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE constraint_type = 'FOREIGN KEY';"
    
    echo ""
    echo "📈 Validasi indexes:"
    echo "------------------"
    
    idx_count=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';" | tr -d ' ')
    echo "✅ Total indexes: $idx_count"
    
else
    echo "💥 Migrasi gagal! Periksa error di atas."
fi

echo ""
echo "🧹 Membersihkan database test..."
psql -U $DB_USER -c "DROP DATABASE $DB_NAME;" > /dev/null 2>&1
echo "✅ Database test dihapus"

echo ""
if [ $failed -eq 0 ]; then
    echo "🎊 MIGRASI SIAP UNTUK INSTALASI DI TEMPAT LAIN!"
    exit 0
else
    echo "⚠️  PERBAIKI MASALAH MIGRASI SEBELUM INSTALASI!"
    exit 1
fi
