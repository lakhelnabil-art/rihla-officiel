#!/bin/bash
# Rihla — lancement local (Mac) pour démo et tests agences
set -e
cd "$(dirname "$0")"

echo ""
echo "  ✈  Rihla — démarrage local"
echo "  ───────────────────────────"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js est requis. Installez la version 20+ :"
  echo "  https://nodejs.org"
  exit 1
fi

echo "  Node $(node -v)"
echo ""

[ -d node_modules ] || { echo "  → Installation des dépendances…"; npm install; }
[ -d server/node_modules ] || { echo "  → Installation serveur…"; npm install --prefix server; }
[ -f server/.env ] || { cp server/.env.example server/.env; echo "  → Fichier server/.env créé"; }

echo "  → Build de l'application…"
npm run build

echo ""
echo "  ───────────────────────────"
echo "  Ouvrez dans le navigateur :"
echo "    http://localhost:3001"
echo ""
echo "  Sur le même Wi‑Fi, partagez l'adresse affichée"
echo "  « Réseau local (Wi‑Fi) » ci-dessous."
echo "  Ctrl+C pour arrêter."
echo "  ───────────────────────────"
echo ""

export NODE_ENV=production
npm run start:server
