@echo off
echo ===============================
echo Обновление проекта: UPDATE
echo ===============================

:: Проверяем, запущен ли Docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker не запущен. Запускаю Docker Desktop...
    start "Docker Desktop" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Ожидаю инициализацию Docker...
    timeout /t 15 >nul
)

:: Переходим в папку проекта
cd /d D:\APP\stat\

echo Обновляю проект из GitHub...
git pull

echo Пересобираю контейнеры...
docker-compose build

echo ===============================
echo Обновление завершено!
echo ===============================
pause
