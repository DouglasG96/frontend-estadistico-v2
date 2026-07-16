# ======================================================
# Stage 1: Build — compila la app Vite + PWA
# ======================================================
FROM node:20-alpine AS builder

# Seguridad: non-root user desde el build
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

WORKDIR /app
COPY package*.json ./

# Instalar solo dependencias de producción + dev necesarias para build
RUN npm ci && npm cache clean --force

# Copiar el código fuente y construir
COPY --chown=appuser:nodejs . .
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    NODE_ENV=production
RUN npm run build

# ======================================================
# Stage 2: Run — nginx con los assets compilados
# ======================================================
FROM nginx:1.27-alpine AS runner

# Seguridad: quitar paquetes innecesarios
RUN apk add --no-cache dumb-init gettext && \
    rm -rf /var/cache/apk/*

# Remover config por defecto
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copiar config personalizada (template con ${BACKEND_URL})
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los assets compilados desde el builder
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Crear directorio para logs con permisos correctos
RUN touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown -R nginx:nginx /var/log/nginx /var/cache/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Correr como non-root (nginx user)
USER nginx

EXPOSE 80

ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]