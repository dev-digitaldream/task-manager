#!/bin/bash

echo "🏗️  Build Simbase Activator"
echo "=========================="
echo ""

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Générer les icônes si nécessaire
if [ ! -f "src-tauri/icons/icon.png" ]; then
    echo "⚠️  Icônes manquantes - utilisation des icônes par défaut"
    echo "   Pour personnaliser, placez vos icônes dans src-tauri/icons/"
fi

# Build
echo ""
echo "🚀 Compilation de l'application..."

# Détecter la plateforme
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Build pour macOS..."
    npm run build
    echo ""
    echo "✅ Build terminé !"
    echo "📂 Résultat : src-tauri/target/release/bundle/"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Build pour Windows..."
    npm run build
    echo ""
    echo "✅ Build terminé !"
    echo "📂 Résultat : src-tauri/target/release/bundle/"
else
    echo "❓ Plateforme non reconnue, tentative de build..."
    npm run build
fi

echo ""
echo "🎉 Application prête à distribuer !"
