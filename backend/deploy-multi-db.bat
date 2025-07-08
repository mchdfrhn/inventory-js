@echo off
setlocal enabledelayedexpansion

REM Multi-Database Deployment Script for STTPU Inventory Management System
REM This script allows easy deployment with different database backends on Windows

echo 🚀 STTPU Inventory Management System - Multi-Database Deployment
echo ==================================================================

REM Default values
set DATABASE_TYPE=postgres
set BUILD_APP=false
set RUN_MIGRATIONS=false

REM Parse command line arguments
:parse_args
if "%1"=="" goto start_deployment
if "%1"=="postgres" (
    set DATABASE_TYPE=postgres
    shift
    goto parse_args
)
if "%1"=="mysql" (
    set DATABASE_TYPE=mysql
    shift
    goto parse_args
)
if "%1"=="sqlite" (
    set DATABASE_TYPE=sqlite
    shift
    goto parse_args
)
if "%1"=="--build" (
    set BUILD_APP=true
    shift
    goto parse_args
)
if "%1"=="--migrate" (
    set RUN_MIGRATIONS=true
    shift
    goto parse_args
)
if "%1"=="--help" (
    goto show_usage
)
echo Unknown option: %1
goto show_usage

:show_usage
echo Usage: %0 [DATABASE_TYPE] [OPTIONS]
echo.
echo Database Types:
echo   postgres    - Deploy with PostgreSQL (default)
echo   mysql       - Deploy with MySQL
echo   sqlite      - Deploy with SQLite
echo.
echo Options:
echo   --build     - Build the application before deployment
echo   --migrate   - Run database migrations
echo   --help      - Show this help message
echo.
echo Examples:
echo   %0 postgres --build
echo   %0 mysql --migrate
echo   %0 sqlite
exit /b 1

:start_deployment
echo 📋 Deployment Configuration:
echo    Database Type: !DATABASE_TYPE!
echo    Build App: !BUILD_APP!
echo    Run Migrations: !RUN_MIGRATIONS!
echo.

REM Set configuration file based on database type
if "!DATABASE_TYPE!"=="postgres" (
    set CONFIG_FILE=config.yaml
    echo 🐘 Using PostgreSQL configuration
)
if "!DATABASE_TYPE!"=="mysql" (
    set CONFIG_FILE=config.mysql.yaml
    echo 🐬 Using MySQL configuration
    if not exist "!CONFIG_FILE!" (
        echo ❌ MySQL configuration file not found: !CONFIG_FILE!
        echo Please copy and modify config.mysql.yaml
        exit /b 1
    )
)
if "!DATABASE_TYPE!"=="sqlite" (
    set CONFIG_FILE=config.sqlite.yaml
    echo 📁 Using SQLite configuration
    if not exist "!CONFIG_FILE!" (
        echo ❌ SQLite configuration file not found: !CONFIG_FILE!
        echo Please copy and modify config.sqlite.yaml
        exit /b 1
    )
)

REM Backup current config and use the selected one
if not "!CONFIG_FILE!"=="config.yaml" (
    echo 📝 Backing up current config.yaml to config.yaml.backup
    if exist config.yaml copy config.yaml config.yaml.backup >nul 2>&1
    
    echo 📝 Using !CONFIG_FILE! as config.yaml
    copy "!CONFIG_FILE!" config.yaml >nul
)

REM Build application if requested
if "!BUILD_APP!"=="true" (
    echo 🔨 Building application...
    go mod tidy
    go build -o inventory-server.exe cmd/main.go
    if errorlevel 1 (
        echo ❌ Build failed
        exit /b 1
    )
    echo ✅ Build completed successfully
)

REM Check if executable exists
if not exist "inventory-server.exe" (
    echo 🔨 Executable not found, building application...
    go mod tidy
    go build -o inventory-server.exe cmd/main.go
    if errorlevel 1 (
        echo ❌ Build failed
        exit /b 1
    )
)

echo.
echo 🎉 Deployment preparation completed!
echo.
echo To start the server:
echo    inventory-server.exe
echo.
echo 📊 Health check will be available at: http://localhost:8080/health
echo 📖 API documentation: Check the API endpoints after startup
echo.
echo Database Information:
if "!DATABASE_TYPE!"=="postgres" (
    echo    Type: PostgreSQL
    echo    Default Port: 5432
    echo    Make sure PostgreSQL server is running
)
if "!DATABASE_TYPE!"=="mysql" (
    echo    Type: MySQL
    echo    Default Port: 3306
    echo    Make sure MySQL server is running
)
if "!DATABASE_TYPE!"=="sqlite" (
    echo    Type: SQLite
    echo    Database file: inventaris.db
    echo    No external server required
)

echo.
echo 🔧 Developed by: Mochammad Farhan Ali
echo 🏢 Organization: STTPU
echo 📅 Version: v1.0.0

endlocal
