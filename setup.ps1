# INORG Employee Management System - Quick Start Guide

Write-Host "🚀 INORG Employee Management System Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js v18 or higher." -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is running
Write-Host "`nChecking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ PostgreSQL not found or not in PATH" -ForegroundColor Yellow
    Write-Host "  Please ensure PostgreSQL is installed and running" -ForegroundColor Yellow
}

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes...`n" -ForegroundColor Gray

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Backend dependencies installed`n" -ForegroundColor Green

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location client
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✓ Frontend dependencies installed`n" -ForegroundColor Green
Set-Location ..

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found. Please configure your environment:" -ForegroundColor Yellow
    Write-Host "  1. Update DATABASE_URL in .env file" -ForegroundColor Gray
    Write-Host "  2. Change JWT_SECRET to a secure random string`n" -ForegroundColor Gray
} else {
    Write-Host "✓ .env file exists`n" -ForegroundColor Green
}

Write-Host "🗄️  Database Setup" -ForegroundColor Yellow
Write-Host "==================`n" -ForegroundColor Yellow

$setupDb = Read-Host "Would you like to run database migrations now? (y/n)"
if ($setupDb -eq "y" -or $setupDb -eq "Y") {
    Write-Host "`nGenerating Prisma client..." -ForegroundColor Cyan
    npm run prisma:generate
    
    Write-Host "`nRunning database migrations..." -ForegroundColor Cyan
    npm run prisma:migrate
    
    Write-Host "✓ Database setup complete`n" -ForegroundColor Green
    
    $openStudio = Read-Host "Would you like to open Prisma Studio to add initial data? (y/n)"
    if ($openStudio -eq "y" -or $openStudio -eq "Y") {
        Write-Host "`nOpening Prisma Studio..." -ForegroundColor Cyan
        Write-Host "You can add departments and create an admin user" -ForegroundColor Gray
        npm run prisma:studio
    }
} else {
    Write-Host "Skipping database setup. Run manually with:" -ForegroundColor Gray
    Write-Host "  npm run prisma:generate" -ForegroundColor Gray
    Write-Host "  npm run prisma:migrate`n" -ForegroundColor Gray
}

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Green

Write-Host "To start the development server:" -ForegroundColor Cyan
Write-Host "  npm run dev`n" -ForegroundColor White

Write-Host "The application will be available at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000`n" -ForegroundColor White

Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Ensure PostgreSQL database 'inorg_db' exists" -ForegroundColor Gray
Write-Host "  2. Update .env with your database credentials" -ForegroundColor Gray
Write-Host "  3. Run 'npm run dev' to start the application" -ForegroundColor Gray
Write-Host "  4. Create departments via Prisma Studio or API" -ForegroundColor Gray
Write-Host "  5. Register your first user at /register`n" -ForegroundColor Gray

Write-Host "📖 For more information, see README.md" -ForegroundColor Cyan
