@echo off
title APAAR ONE - AICTE SIH 2026 Platform
echo =====================================================================
echo           APAAR ONE: National Student Data Management Platform
echo           AICTE Regulation Bureau - SIH 2026 Problem Statement 26263
echo =====================================================================
echo.
echo Launching unified server on http://localhost:8000 ...
echo Both REST API (/api) and Unified Frontend SPA (/) will be served.
echo.
cd /d "%~dp0backend"
"C:\Users\SURYAASWIN\AppData\Local\Programs\Python\Python313\python.exe" run.py
pause
