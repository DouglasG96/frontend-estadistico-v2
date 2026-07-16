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

ARG VITE_API_BASE_URL=https://api-estadistico.dgcloudops.com/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    NODE_ENV=production
RUN npm run build

# ======================================================
# Stage 2: Run — nginx sirviendo los assets
# ======================================================
FROM nginx:1.27-alpine AS runner

RUN apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/run /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]