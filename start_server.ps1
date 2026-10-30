# APAAR ONE - Unified Platform Launcher
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "          APAAR ONE: National Student Data Management Platform       " -ForegroundColor Yellow
Write-Host "          AICTE Regulation Bureau - SIH 2026 Problem Statement 26263 " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Unified FastAPI Server on http://127.0.0.1:8000 ..." -ForegroundColor Green
Write-Host "Serving both REST API (/api) and Built Production PWA (/)..." -ForegroundColor White
Write-Host ""

$pythonPath = "C:\Users\SURYAASWIN\AppData\Local\Programs\Python\Python313\python.exe"
if (-not (Test-Path $pythonPath)) {
    $pythonPath = "python"
}

Set-Location "$PSScriptRoot\backend"
& $pythonPath run.py
