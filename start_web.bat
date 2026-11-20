@echo off
cd /d "%~dp0"
title SentinelOps Web Platform Runner
echo ============================================================
echo    SENTINELOPS OBSERVABILITY PLATFORM
echo    Starting Localhost Development Servers
echo ============================================================
echo.

echo [1/3] Starting FastAPI SaaS Backend on http://localhost:8000 ...
start "SentinelOps-Backend" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe -m uvicorn saas.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Local Telemetry Collector Daemon ...
start "SentinelOps-Collector" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe -m collector.cli start --saas-endpoint http://localhost:8000 --simulation-mode normal"

timeout /t 2 /nobreak > nul

echo [3/3] Starting Next.js Web Dashboard on http://localhost:3000 ...
start "SentinelOps-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- -p 3000"

timeout /t 4 /nobreak > nul

echo.
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo ============================================================
echo  SentinelOps is now running locally:
echo    Web App:        http://localhost:3000
echo    Sign In:        admin@sentinelops.io / SentinelAdmin2026!
echo    SaaS API:       http://localhost:8000
echo    Swagger Docs:   http://localhost:8000/docs
echo ============================================================
echo  Keep the opened command windows running to maintain the servers.
pause
