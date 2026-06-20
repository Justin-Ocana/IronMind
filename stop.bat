@echo off
title IronMind — Stop

echo.
echo  Parando IronMind...
docker compose down
echo.
echo  Todos los servicios detenidos.
echo.
pause
