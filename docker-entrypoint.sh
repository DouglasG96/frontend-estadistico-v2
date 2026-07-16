#!/bin/sh
set -e

exec dumb-init -- nginx -g "daemon off;"