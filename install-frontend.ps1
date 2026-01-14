# Installation script for Fluxa Offline frontend dependencies (Windows)

Write-Host "🚀 Installing Fluxa Offline Frontend Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Check if pnpm is installed
$pnpmInstalled = $null -ne (Get-Command pnpm -ErrorAction SilentlyContinue)

if (-not $pnpmInstalled) {
    Write-Host "❌ pnpm is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ pnpm found" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host ""
Write-Host "⚙️  Adding Tailwind CSS dependencies..." -ForegroundColor Cyan
pnpm add -D tailwindcss postcss autoprefixer

Write-Host ""
Write-Host "✨ Frontend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. pnpm dev          - Start development server"
Write-Host "  2. pnpm build        - Build for production"
Write-Host "  3. pnpm tauri dev    - Run Tauri development"
Write-Host ""
Write-Host "🎨 Theme: 'Abidjan Cyber-Griot'" -ForegroundColor Magenta
Write-Host "🔐 Security: Rust Ed25519 + BLE" -ForegroundColor Green
Write-Host ""
