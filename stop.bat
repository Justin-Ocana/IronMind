@echo off
title IronMind — Stop

echo.
echo  Parando IronMind...
taskkill /fi "WindowTitle eq IronMind — Backend*" /f >nul 2>&1
taskkill /fi "WindowTitle eq IronMind — Frontend*" /f >nul 2>&1
echo  Servicios detenidos.
echo.
pause
