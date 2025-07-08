@echo off
REM Deploy script for STTPU Inventory Backend (Windows)

echo Starting deployment process...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: docker-compose is not installed.
    pause
    exit /b 1
)

REM Environment setup
echo Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env file from .env.example
    echo WARNING: Please review and update .env file with your configuration
)

REM Build and start services
echo Building and starting services...
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if backend is healthy
echo Checking backend health...
set /a max_attempts=30
set /a attempt=1

:health_check_loop
curl -f http://localhost:8080/health >nul 2>&1
if %errorlevel%==0 (
    echo Backend is healthy!
    goto :health_check_done
) else (
    echo Waiting for backend... (attempt %attempt%/%max_attempts%)
    timeout /t 5 /nobreak >nul
    set /a attempt+=1
    if %attempt% leq %max_attempts% goto :health_check_loop
)

echo ERROR: Backend health check failed. Please check logs.
docker-compose logs backend
pause
exit /b 1

:health_check_done

REM Run migrations
echo Running database migrations...
docker-compose exec backend npm run migrate

REM Optionally seed database
set /p seed_choice="Do you want to seed the database with sample data? (y/N): "
if /i "%seed_choice%"=="y" (
    echo Seeding database...
    docker-compose exec backend npm run seed
)

REM Show service status
echo Service status:
docker-compose ps

REM Show useful information
echo.
echo Deployment completed successfully!
echo.
echo Service URLs:
echo   Backend API: http://localhost:8080
echo   Health Check: http://localhost:8080/health
echo   API Documentation: http://localhost:8080/api/v1
echo.
echo Useful commands:
echo   View logs: docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart services: docker-compose restart
echo   View backend logs: docker-compose logs -f backend
echo.
echo Don't forget to:
echo   1. Update .env file with production values
echo   2. Configure SSL certificates for production
echo   3. Set up backup strategy for database
echo   4. Configure monitoring and alerting
echo.
pause
