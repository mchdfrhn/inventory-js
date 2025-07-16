@echo off
REM STTPU Inventory Database Migration Script for Windows

echo 🚀 STTPU Inventory Database Migration
echo ====================================

REM Load environment variables from .env file
if exist .env (
    for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#"') do set %%a=%%b
)

if "%1"=="up" goto migrate
if "%1"=="migrate" goto migrate
if "%1"=="status" goto status
if "%1"=="create" goto create
if "%1"=="seed" goto seed
if "%1"=="setup" goto setup
goto usage

:migrate
echo 📝 Running database migrations...
npm run migrate
if %errorlevel% equ 0 (
    echo ✅ Migrations completed successfully
) else (
    echo ❌ Migration failed
    exit /b 1
)
goto end

:status
echo 📊 Migration Status:
npm run migrate:status
goto end

:create
if "%2"=="" (
    echo ❌ Please provide migration name
    echo Usage: migrate.bat create migration_name
    exit /b 1
)
echo 📝 Creating new migration: %2
npm run migrate:create %2
goto end

:seed
echo 🌱 Seeding database with sample data...
npm run seed
if %errorlevel% equ 0 (
    echo ✅ Database seeded successfully
) else (
    echo ❌ Seeding failed
    exit /b 1
)
goto end

:setup
echo 🔧 Setting up database...
call :migrate
call :seed
echo ✅ Database setup completed
goto end

:usage
echo Usage: %0 {up^|status^|create^|seed^|setup}
echo.
echo Commands:
echo   up/migrate  - Run pending migrations
echo   status      - Show migration status
echo   create      - Create new migration
echo   seed        - Seed database with sample data
echo   setup       - Run migrations and seed data
exit /b 1

:end
