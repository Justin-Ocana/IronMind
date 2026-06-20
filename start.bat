@echo off
title IronMind

echo.
echo  IronMind — Iniciando...
echo.

:: Copiar .env si no existe
if not exist .env (
    echo  Creando .env desde .env.example...
    copy .env.example .env >nul
    echo  .env creado. Puedes editarlo antes de continuar.
    echo.
)

:: Verificar Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Docker no esta corriendo. Abrelo y vuelve a intentarlo.
    pause
    exit /b 1
)

:: Levantar servicios
echo  Levantando servicios con Docker Compose...
echo  (Primera vez puede tardar 2-3 minutos descargando imagenes)
echo.
docker compose up --build -d

if errorlevel 1 (
    echo.
    echo  Error al levantar los servicios. Revisa los logs con:
    echo    docker compose logs
    pause
    exit /b 1
)

:: Esperar a que el backend arranque
echo.
echo  Esperando a que los servicios esten listos...
timeout /t 8 /nobreak >nul

:: Abrir navegador
echo  Abriendo IronMind en el navegador...
start http://localhost:5173

echo.
echo  IronMind esta corriendo:
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:8000/api/v1/
echo    Admin    : http://localhost:8000/admin/
echo.
echo  Para ver los logs en tiempo real:
echo    docker compose logs -f
echo.
echo  Para parar todo:
echo    docker compose down
echo.
pause
