#!/bin/sh
set -e

# Sincroniza node_modules con package-lock.json (rápido si ya está al día).
npm install --no-audit --no-fund

exec "$@"
