#!/bin/bash

# Database migration script for STTPU Inventory Backend

echo "🚀 STTPU Inventory Database Migration"
echo "===================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure your database settings."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '#' | awk '/=/ {print $1}')

# Function to run migrations
run_migrations() {
    echo "📝 Running database migrations..."
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations completed successfully"
    else
        echo "❌ Migration failed"
        echo "Please check your database configuration in .env file"
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

# Handle command line arguments
case "$1" in
    "up"|"migrate"|"")
        run_migrations
        ;;
    "status")
        show_status
        ;;
    "create")
        create_migration "$2"
        ;;
    "setup")
        echo "🔧 Setting up database..."
        run_migrations
        echo "✅ Database setup completed (including demo data)"
        ;;
    "help"|"-h"|"--help")
                echo "❌ Unknown command: $1"
        echo "Use '$0 help' to see available commands"
        echo ""
        echo "Commands:"
        echo "  up/migrate  - Run pending migrations (default)"
        echo "  status      - Show migration status"
        echo "  create      - Create new migration"
        echo "  setup       - Run all migrations (includes demo data)"
        echo "  help        - Show this help message"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' to see available commands"
        exit 1
        ;;
esac
