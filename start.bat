@echo off
title IronMind

echo.
echo  IronMind - Iniciando en modo local
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Python no encontrado. Instala Python 3.11+
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js no encontrado. Instala Node 20+
    pause
    exit /b 1
)

if not exist "backend\.venv" (
    echo  Creando entorno virtual Python...
    python -m venv backend\.venv
)

echo  Instalando dependencias Python...
call backend\.venv\Scripts\activate.bat
pip install -q -r backend\requirements\base.txt

echo  Generando migraciones y cargando datos...
set IRONMIND_SETTINGS=config.settings.local
cd backend
python startup.py
cd ..

if not exist "frontend\node_modules" (
    echo  Instalando dependencias Node...
    cd frontend
    npm install --silent
    cd ..
)

echo  Iniciando Backend...
set ROOT=%~dp0
start "IronMind Backend" cmd /k "cd /d %ROOT%backend && .venv\Scripts\activate && set DJANGO_SETTINGS_MODULE=config.settings.local && python manage.py runserver 8000"

echo  Iniciando Frontend...
start "IronMind Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo  Esperando que los servidores arranquen...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo  IronMind corriendo:
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:8000/api/v1/
echo    Admin    : http://localhost:8000/admin/
echo.
echo  Cierra las ventanas de terminal para parar.
echo.
pause