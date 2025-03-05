# front/react-stat/Dockerfile
# ---------- build stage ----------
    FROM node:20 AS build
    WORKDIR /app
    
    # Копируем package.json и package-lock.json
    COPY package*.json ./
    
    # Устанавливаем зависимости
    RUN npm install
    
    # Копируем весь проект и собираем
    COPY . .
    RUN npm run build
    
    # ---------- production stage ----------
    FROM nginx:alpine
    # Копируем собранную статику из предыдущего stage
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Nginx внутри контейнера слушает 80 порт по умолчанию
    EXPOSE 80
    
    # Запускаем Nginx в "переднем" режиме (чтобы контейнер не завершался)
    CMD ["nginx", "-g", "daemon off;"]
    