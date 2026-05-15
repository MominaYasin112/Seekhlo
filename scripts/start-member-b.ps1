# Start Member B services (ML + Code Runner) and frontend
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "Building Docker sandbox image (one-time)..." -ForegroundColor Cyan
docker build -t seekhlo-code-runner ./code-runner 2>$null

Write-Host "Starting ML (8001) and Code Runner (8002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ml-service'; pip install -q -r requirements.txt; uvicorn main:app --reload --port 8001"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\code-runner'; pip install -q -r requirements.txt; uvicorn main:app --reload --port 8002"
Start-Sleep -Seconds 2

Write-Host "Starting frontend (5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Open http://localhost:5173" -ForegroundColor Green
Write-Host "Demo login: test@test.com / 123456" -ForegroundColor Green
