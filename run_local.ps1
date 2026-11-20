# SentinelOps PowerShell Localhost Launcher
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SENTINELOPS OBSERVABILITY PLATFORM - LOCALHOST LAUNCHER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
Set-Location $root

Write-Host "`n[1/3] Starting FastAPI SaaS Backend on port 8000..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", ".venv\Scripts\python.exe -m uvicorn saas.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory $root

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Local Telemetry Collector..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", ".venv\Scripts\python.exe -m collector.cli start --saas-endpoint http://localhost:8000 --simulation-mode normal" -WorkingDirectory $root

Start-Sleep -Seconds 2

Write-Host "[3/3] Starting Next.js Web Frontend on port 3000..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd frontend && npm run dev -- -p 3000" -WorkingDirectory $root

Start-Sleep -Seconds 4

Write-Host "`nOpening http://localhost:3000 in your browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host "`nAll servers launched successfully!" -ForegroundColor Green
Write-Host "  Web Dashboard:  http://localhost:3000"
Write-Host "  Credentials:    admin@sentinelops.io / SentinelAdmin2026!"
Write-Host "  Backend API:    http://localhost:8000"
Write-Host "  Swagger Docs:   http://localhost:8000/docs"
