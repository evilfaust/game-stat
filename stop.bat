@echo off
echo ===============================
echo Остановка проекта: STOP
echo ===============================

:: Переходим в папку проекта
cd /d D:\APP\stat\

echo Останавливаю контейнеры...
docker-compose down

echo Останавливаю Docker Desktop...
taskkill /IM "Docker Desktop.exe" /F >nul 2>&1

echo ===============================
echo Контейнеры остановлены. Docker выключен.
echo ===============================
pause
