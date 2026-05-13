@echo off
title SportMap

echo Starting SportMap...

:: Backend
start "SportMap Backend" cmd /k "cd /d "%~dp0backend\src\SportMap.API" && dotnet run"

:: Frontend
start "SportMap Frontend" cmd /k "cd /d "%~dp0frontend" && ng serve"

:: Wait for frontend to be ready then open browser
echo Waiting for Angular to compile...
timeout /t 12 /nobreak >nul
start "" "http://localhost:4200"

echo Both servers are starting. Check the terminal windows for details.
