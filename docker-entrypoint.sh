#!/bin/sh
set -e

# BACKEND_URL default: https://api-estadistico.dgcloudops.com
# (el backend ya expuesto en esa URL)
BACKEND_URL="${BACKEND_URL:-https://api-estadistico.dgcloudops.com}"
export BACKEND_URL

# Generar nginx.conf desde template con envsubst
envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Asegurar permisos para nginx user
chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx/conf.d

# Iniciar nginx como non-root
exec dumb-init -- su -s /bin/sh nginx -c "nginx -g 'daemon off;'"