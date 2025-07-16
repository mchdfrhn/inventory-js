#!/bin/bash

# Database migration script for STTPU Inventory

echo "🚀 STTPU Inventory Database Migration"
echo "===================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Function to run migrations
run_migrations() {
    echo "📝 Running database migrations..."
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations completed successfully"
    else
        echo "❌ Migration failed"
        exit 1
    fi
}

# Function to show migration status
show_status() {
    echo "📊 Migration Status:"
    npm run migrate:status
}

# Function to create new migration
create_migration() {
    if [ -z "$1" ]; then
        echo "❌ Please provide migration name"
        echo "Usage: ./migrate.sh create <migration_name>"
        exit 1
    fi
    
    echo "📝 Creating new migration: $1"
    npm run migrate:create $1
}

# Function to seed database
seed_database() {
    echo "🌱 Seeding database with sample data..."
    npm run seed
    
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully"
    else
        echo "❌ Seeding failed"
        exit 1
    fi
}

# Handle command line arguments
case "$1" in
    "up"|"migrate")
        run_migrations
        ;;
    "status")
        show_status
        ;;
    "create")
        create_migration "$2"
        ;;
    "seed")
        seed_database
        ;;
    "setup")
        echo "🔧 Setting up database..."
        run_migrations
        seed_database
        echo "✅ Database setup completed"
        ;;
    *)
        echo "Usage: $0 {up|status|create|seed|setup}"
        echo ""
        echo "Commands:"
        echo "  up/migrate  - Run pending migrations"
        echo "  status      - Show migration status"
        echo "  create      - Create new migration"
        echo "  seed        - Seed database with sample data"
        echo "  setup       - Run migrations and seed data"
        exit 1
        ;;
esac
