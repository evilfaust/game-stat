@echo off
echo ===============================
echo Запуск проекта: START
echo ===============================

:: Проверяем, запущен ли Docker. Если нет - пытаемся поднять Docker Desktop
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker не запущен. Запускаю Docker Desktop...
    start "Docker Desktop" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Ожидаю инициализацию Docker...
    :: Ждём 15 секунд, чтобы Docker успел стартовать
    timeout /t 15 >nul
)

:: Переходим в папку проекта
cd /d D:\APP\stat\

echo Обновляю проект из GitHub...
git pull

echo Строю контейнеры...
docker-compose build

echo Запускаю контейнеры...
docker-compose up -d

echo Открываю http://localhost:3005 в браузере.
start "" http://localhost:3005

echo ===============================
echo Проект успешно запущен!
echo ===============================
pause
