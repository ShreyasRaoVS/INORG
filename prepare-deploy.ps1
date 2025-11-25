# Pre-Deployment Checklist
Write-Host "🚀 INORG ERP - Beta Deployment Preparation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "✓ Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion) {
    Write-Host "  Node.js: $nodeVersion ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js not found! Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "✓ Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
if ($npmVersion) {
    Write-Host "  npm: $npmVersion ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Check if .env exists
Write-Host "✓ Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "  .env file found ✓" -ForegroundColor Green
} else {
    Write-Host "  ⚠ .env file not found! Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "  ⚠ Please update .env with your production values!" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "" 
Write-Host "✓ Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the application
Write-Host ""
Write-Host "✓ Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Build successful ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Check Prisma client
Write-Host ""
Write-Host "✓ Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate

# Display checklist
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📋 Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Before deploying to production, ensure:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [ ] Updated .env with production DATABASE_URL" -ForegroundColor White
Write-Host "  [ ] Updated .env with production REDIS_URL" -ForegroundColor White
Write-Host "  [ ] Changed JWT_SECRET to a strong random string" -ForegroundColor White
Write-Host "  [ ] Updated CORS_ORIGIN with your production URLs" -ForegroundColor White
Write-Host "  [ ] Tested the build locally with: npm start" -ForegroundColor White
Write-Host "  [ ] Pushed latest code to Git repository" -ForegroundColor White
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🌐 Deployment Options" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose your hosting provider:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Railway (Recommended)" -ForegroundColor Green
Write-Host "     • Free tier available" -ForegroundColor Gray
Write-Host "     • Auto-deploy from Git" -ForegroundColor Gray
Write-Host "     • Built-in PostgreSQL & Redis" -ForegroundColor Gray
Write-Host "     • URL: https://railway.app" -ForegroundColor Cyan
Write-Host ""

Write-Host "  2. Render" -ForegroundColor Green
Write-Host "     • Free tier available" -ForegroundColor Gray
Write-Host "     • Easy database setup" -ForegroundColor Gray
Write-Host "     • Auto-deploy from Git" -ForegroundColor Gray
Write-Host "     • URL: https://render.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "  3. Heroku" -ForegroundColor Green
Write-Host "     • Popular choice" -ForegroundColor Gray
Write-Host "     • CLI tools available" -ForegroundColor Gray
Write-Host "     • Add-ons for PostgreSQL & Redis" -ForegroundColor Gray
Write-Host "     • URL: https://heroku.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "  4. DigitalOcean App Platform" -ForegroundColor Green
Write-Host "     • \$5/month starter" -ForegroundColor Gray
Write-Host "     • Managed databases" -ForegroundColor Gray
Write-Host "     • Good performance" -ForegroundColor Gray
Write-Host "     • URL: https://digitalocean.com/products/app-platform" -ForegroundColor Cyan
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📚 Next Steps" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Read BETA_DEPLOYMENT.md for detailed instructions" -ForegroundColor White
Write-Host "2. Choose a hosting provider and create account" -ForegroundColor White
Write-Host "3. Connect your Git repository" -ForegroundColor White
Write-Host "4. Add environment variables" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Pre-deployment checks complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your application is ready for deployment! 🎉" -ForegroundColor Green
Write-Host ""
