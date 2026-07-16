#!/bin/sh
set -e

# BACKEND_URL default: https://api-estadistico.dgcloudops.com
BACKEND_URL="${BACKEND_URL:-https://api-estadistico.dgcloudops.com}"
export BACKEND_URL

# Generar nginx.conf desde template con envsubst
envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Arreglar permisos para que nginx user pueda escribir logs/cache
# (nginx master corre como root, workers como nginx)
chown -R nginx:nginx /var/log/nginx /var/cache/nginx /var/run /etc/nginx/conf.d

exec dumb-init -- nginx -g "daemon off;"