# Etapa 1: Construcción con Node.js
FROM node:18-alpine as build
ARG BUILD_ENV
RUN echo "👉 ARG = $BUILD_ENV"
ENV ENVIRONMENT $BUILD_ENV
# Directorio de trabajo dentro del contenedor
WORKDIR /app
# Copia el package.json y package-lock.json (si tienes)
COPY package*.json ./
# Instala las dependencias
RUN npm install
# Copia todo el código fuente de tu proyecto Angular
COPY . .
# Ejecuta la construcción de la aplicación Angular
RUN echo "👉 BUILD_CMD = $ENVIRONMENT"
RUN npm run build:$ENVIRONMENT
# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copia los archivos construidos desde la etapa anterior (build)
COPY --from=build /app/dist/kore-acc/browser /usr/share/nginx/html
# Exponer el puerto 80 (para acceso HTTP)
EXPOSE 80
# Mantener Nginx en primer plano (esto es necesario en Docker)
CMD ["nginx", "-g", "daemon off;"]
