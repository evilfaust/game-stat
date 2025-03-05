# Используем официальный образ Python 3.12.4
FROM python:3.12.4-slim

# Устанавливаем зависимости системы
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем pip нужной версии
RUN python -m pip install --upgrade pip setuptools==75.8.2

# Создаём рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем только указанные зависимости
RUN pip install --no-cache-dir -r requirements.txt

RUN pip uninstall -y awpy

RUN pip install awpy==2.0.0b4 --no-deps

# RUN pip install usd-core>=24.8,<25.0

# Копируем всё приложение
COPY . .

# Указываем команду по умолчанию
CMD ["python", "app.py"]
