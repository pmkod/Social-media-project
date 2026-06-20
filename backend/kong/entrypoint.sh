#!/bin/sh
set -e

# Resolve environment variables in the declarative config before Kong loads it.
sed -e "s|__JWT_SECRET__|${JWT_SECRET}|g" /kong/declarative/kong.yml > /tmp/kong-resolved.yml

export KONG_DECLARATIVE_CONFIG=/tmp/kong-resolved.yml

exec /docker-entrypoint.sh "$@"
