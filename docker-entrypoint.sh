#!/bin/sh
set -e

# Sustituir variables de entorno en nginx.conf
# BACKEND_URL default: https://api-estadistico.dgcloudops.com
# (el backend ya expuesto en esa URL)
export BACKEND_URL="${BACKEND_URL:-https://api-estadistico.dgcloudops.com}"

# Reemplazar ${BACKEND_URL} en la config template
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf
mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf

# Iniciar nginx
exec nginx -g "daemon off;"