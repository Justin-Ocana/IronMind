@echo off
title IronMind — Docker

echo.
echo  IronMind — Iniciando con Docker (PostgreSQL + Redis + Celery)
echo.

docker info >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Docker no esta corriendo.
    pause & exit /b 1
)

if not exist .env (
    copy .env.example .env >nul
)

docker compose up --build -d
timeout /t 10 /nobreak >nul
start http://localhost:5173

echo.
echo  Corriendo en Docker:
echo    Frontend  →  http://localhost:5173
echo    Backend   →  http://localhost:8000/api/v1/
echo.
pause
