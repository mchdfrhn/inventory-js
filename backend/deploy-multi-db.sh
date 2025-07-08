#!/bin/bash

# Multi-Database Deployment Script for STTPU Inventory Management System
# This script allows easy deployment with different database backends

set -e

echo "🚀 STTPU Inventory Management System - Multi-Database Deployment"
echo "=================================================================="

# Function to display usage
usage() {
    echo "Usage: $0 [DATABASE_TYPE] [OPTIONS]"
    echo ""
    echo "Database Types:"
    echo "  postgres    - Deploy with PostgreSQL (default)"
    echo "  mysql       - Deploy with MySQL"
    echo "  sqlite      - Deploy with SQLite"
    echo ""
    echo "Options:"
    echo "  --build     - Build the application before deployment"
    echo "  --migrate   - Run database migrations"
    echo "  --help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 postgres --build"
    echo "  $0 mysql --migrate"
    echo "  $0 sqlite"
    exit 1
}

# Default values
DATABASE_TYPE="postgres"
BUILD_APP=false
RUN_MIGRATIONS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        postgres|mysql|sqlite)
            DATABASE_TYPE="$1"
            shift
            ;;
        --build)
            BUILD_APP=true
            shift
            ;;
        --migrate)
            RUN_MIGRATIONS=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

echo "📋 Deployment Configuration:"
echo "   Database Type: $DATABASE_TYPE"
echo "   Build App: $BUILD_APP"
echo "   Run Migrations: $RUN_MIGRATIONS"
echo ""

# Set configuration file based on database type
case $DATABASE_TYPE in
    postgres)
        CONFIG_FILE="config.yaml"
        echo "🐘 Using PostgreSQL configuration"
        ;;
    mysql)
        CONFIG_FILE="config.mysql.yaml"
        echo "🐬 Using MySQL configuration"
        if [ ! -f "$CONFIG_FILE" ]; then
            echo "❌ MySQL configuration file not found: $CONFIG_FILE"
            echo "Please copy and modify config.mysql.yaml"
            exit 1
        fi
        ;;
    sqlite)
        CONFIG_FILE="config.sqlite.yaml"
        echo "📁 Using SQLite configuration"
        if [ ! -f "$CONFIG_FILE" ]; then
            echo "❌ SQLite configuration file not found: $CONFIG_FILE"
            echo "Please copy and modify config.sqlite.yaml"
            exit 1
        fi
        ;;
    *)
        echo "❌ Unsupported database type: $DATABASE_TYPE"
        usage
        ;;
esac

# Backup current config and use the selected one
if [ "$CONFIG_FILE" != "config.yaml" ]; then
    echo "📝 Backing up current config.yaml to config.yaml.backup"
    cp config.yaml config.yaml.backup 2>/dev/null || true
    
    echo "📝 Using $CONFIG_FILE as config.yaml"
    cp "$CONFIG_FILE" config.yaml
fi

# Build application if requested
if [ "$BUILD_APP" = true ]; then
    echo "🔨 Building application..."
    go mod tidy
    go build -o inventory-server cmd/main.go
    echo "✅ Build completed successfully"
fi

# Run migrations if requested
if [ "$RUN_MIGRATIONS" = true ]; then
    echo "🗄️  Running database migrations..."
    # The application will automatically run migrations on startup
    echo "✅ Migrations will be executed on application startup"
fi

# Check if executable exists
if [ ! -f "inventory-server" ] && [ ! -f "inventory-server.exe" ]; then
    echo "🔨 Executable not found, building application..."
    go mod tidy
    go build -o inventory-server cmd/main.go
fi

echo ""
echo "🎉 Deployment preparation completed!"
echo ""
echo "To start the server:"
echo "   ./inventory-server     (Linux/macOS)"
echo "   ./inventory-server.exe (Windows)"
echo ""
echo "📊 Health check will be available at: http://localhost:8080/health"
echo "📖 API documentation: Check the API endpoints after startup"
echo ""
echo "Database Information:"
case $DATABASE_TYPE in
    postgres)
        echo "   Type: PostgreSQL"
        echo "   Default Port: 5432"
        echo "   Make sure PostgreSQL server is running"
        ;;
    mysql)
        echo "   Type: MySQL"
        echo "   Default Port: 3306"
        echo "   Make sure MySQL server is running"
        ;;
    sqlite)
        echo "   Type: SQLite"
        echo "   Database file: inventaris.db"
        echo "   No external server required"
        ;;
esac

echo ""
echo "🔧 Developed by: Mochammad Farhan Ali"
echo "🏢 Organization: STTPU"
echo "📅 Version: v1.0.0"
