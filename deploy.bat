@echo off
setlocal

:: STTPU Inventory System Deployment Script for Windows
:: Usage: deploy.bat [environment]
:: Environment: development, production, docker

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=development

set PROJECT_NAME=STTPU Inventory System

echo 🚀 Starting deployment for %PROJECT_NAME%
echo 📦 Environment: %ENVIRONMENT%
echo ==================================

if "%ENVIRONMENT%"=="development" (
    echo 🔧 Setting up development environment...
    
    :: Copy environment files
    if not exist "backend\.env" (
        copy "backend\.env.example" "backend\.env" >nul 2>&1 || copy ".env.example" "backend\.env" >nul 2>&1
        echo ✅ Created backend\.env from example
    )
    
    if not exist "frontend\.env" (
        copy "frontend\.env.example" "frontend\.env" >nul 2>&1 || copy ".env.example" "frontend\.env" >nul 2>&1
        echo ✅ Created frontend\.env from example
    )
    
    :: Start database
    echo 🐘 Starting PostgreSQL database...
    cd backend
    docker-compose up -d postgres
    
    :: Wait for database to be ready
    echo ⏳ Waiting for database to be ready...
    timeout /t 10 /nobreak >nul
    
    :: Run migrations
    echo 🗄️ Running database migrations...
    go run cmd\migrate\main.go
    
    :: Install frontend dependencies
    echo 📦 Installing frontend dependencies...
    cd ..\frontend
    npm install
    
    echo ✅ Development environment setup complete!
    echo 🔗 Backend: http://localhost:8080
    echo 🔗 Frontend: http://localhost:5173
    echo.
    echo To start the services:
    echo Backend: cd backend ^&^& go run cmd\main.go
    echo Frontend: cd frontend ^&^& npm run dev
    
) else if "%ENVIRONMENT%"=="production" (
    echo 🏭 Setting up production environment...
    
    :: Check if production env files exist
    if not exist "backend\.env.production" (
        echo ❌ backend\.env.production not found!
        echo Please create backend\.env.production file first
        exit /b 1
    )
    
    if not exist "frontend\.env.production" (
        echo ❌ frontend\.env.production not found!
        echo Please create frontend\.env.production file first
        exit /b 1
    )
    
    :: Copy production env files
    copy "backend\.env.production" "backend\.env" >nul
    copy "frontend\.env.production" "frontend\.env" >nul
    
    :: Build and deploy with docker
    echo 🐳 Building and deploying with Docker...
    docker-compose -f docker-compose.full.yml --env-file .env.docker up -d --build
    
    echo ✅ Production deployment complete!
    echo 🔗 Application: http://localhost:3000
    
) else if "%ENVIRONMENT%"=="docker" (
    echo 🐳 Setting up Docker environment...
    
    :: Use docker environment file
    if not exist ".env.docker" (
        echo ❌ .env.docker not found!
        exit /b 1
    )
    
    :: Deploy with docker compose
    docker-compose -f docker-compose.full.yml --env-file .env.docker up -d --build
    
    echo ✅ Docker deployment complete!
    echo 🔗 Application: http://localhost:3000
    echo 🔗 API: http://localhost:8080
    echo 🐘 Database: localhost:5432
    
) else (
    echo ❌ Unknown environment: %ENVIRONMENT%
    echo Available environments: development, production, docker
    exit /b 1
)

echo.
echo 🎉 Deployment completed successfully!
echo 📋 Next steps:
echo 1. Check application logs: docker-compose logs -f
echo 2. Access the application at the URLs shown above
echo 3. Monitor system resources and performance

endlocal
