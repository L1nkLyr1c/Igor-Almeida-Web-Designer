#!/usr/bin/env bash
# Gera o site e copia para a raiz do repositório (index.html + assets/app/).
# Uso: bash _fonte/site/publicar.sh   (rodar da raiz do repositório)
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$RAIZ/_fonte/site"
[ -d node_modules ] || npm ci
npm run build
mkdir -p "$RAIZ/assets/app"
find "$RAIZ/assets/app" -type f -name '*.js' -delete
find "$RAIZ/assets/app" -type f -name '*.css' -delete
cp dist/assets/app/* "$RAIZ/assets/app/"
cp dist/index.html "$RAIZ/index.html"
echo "Pronto: index.html e assets/app/ atualizados."
