# ======================================================
# Stage 1: Build — compila la app Vite + PWA
# ======================================================
FROM node:20-alpine AS builder

RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY --chown=appuser:nodejs . .

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    NODE_ENV=production
RUN npm run build

# ======================================================
# Stage 2: Run — nginx con los assets compilados
# ======================================================
FROM nginx:1.27-alpine AS runner

# Instalar herramientas necesarias
RUN apk add --no-cache dumb-init gettext && \
    rm -rf /var/cache/apk/*

# Remover config default
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar entrypoint y config template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copiar assets compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear directorio de cache escribible por nginx
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/run /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]