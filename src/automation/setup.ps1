# HypeAI Content Automation Setup Script
# This script sets up the automation system on Windows

Write-Host "🚀 HypeAI Content Automation Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 14+ first." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "backups" | Out-Null
Write-Host "✅ Directories created" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check for .env file
if (!(Test-Path .env)) {
    Write-Host "⚠️  No .env file found. Creating from example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file and add your API credentials!" -ForegroundColor Yellow
    Write-Host "   Twitter, Telegram, and Discord credentials are required." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    Write-Host ""
}

# Install PM2 globally (optional)
$installPM2 = Read-Host "Install PM2 for production deployment? (y/n)"
if ($installPM2 -eq "y") {
    Write-Host "📦 Installing PM2..." -ForegroundColor Yellow
    npm install -g pm2
    npm install -g pm2-windows-startup
    pm2-startup install
    Write-Host "✅ PM2 installed" -ForegroundColor Green
    Write-Host ""
}

# Setup Windows Task Scheduler (optional)
$setupScheduler = Read-Host "Setup Windows Task Scheduler for automation? (y/n)"
if ($setupScheduler -eq "y") {
    Write-Host "📅 Setting up Task Scheduler..." -ForegroundColor Yellow

    $scriptPath = (Get-Location).Path
    $nodePath = (Get-Command node).Source

    # Create task for daily reminder
    $action = New-ScheduledTaskAction -Execute $nodePath -Argument "$scriptPath\calendar-manager.js remind" -WorkingDirectory $scriptPath
    $trigger = New-ScheduledTaskTrigger -Daily -At 8am
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType ServiceAccount
    Register-ScheduledTask -TaskName "HypeAI Daily Reminder" -Action $action -Trigger $trigger -Principal $principal -Force

    Write-Host "✅ Task Scheduler configured" -ForegroundColor Green
    Write-Host "   - Daily reminders at 8 AM" -ForegroundColor Gray
    Write-Host ""
}

# Test posting (optional)
$testPost = Read-Host "Run test post to verify credentials? (y/n)"
if ($testPost -eq "y") {
    Write-Host "🧪 Testing multi-platform posting..." -ForegroundColor Yellow
    node multi-publisher.js test
    Write-Host ""
}

Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your API credentials"
Write-Host "2. Start scheduler: node content-scheduler.js start"
Write-Host "3. Open admin panel: python -m http.server 8080"
Write-Host "4. Or use PM2: pm2 start ecosystem.config.js"
Write-Host ""
Write-Host "Documentation: README.md"
Write-Host "Support: https://github.com/hypeai/automation"
Write-Host ""
