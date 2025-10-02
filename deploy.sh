#!/bin/bash

echo "🚀 Déploiement sur CapRover - Task Manager"
echo "=========================================="
echo ""

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "captain-definition" ]; then
    echo "❌ Erreur: captain-definition introuvable"
    echo "   Lancez ce script depuis la racine du projet"
    exit 1
fi

# Vérifier que caprover CLI est installé
if ! command -v caprover &> /dev/null; then
    echo "⚠️  CapRover CLI non installé"
    echo "   Installation: npm install -g caprover"
    exit 1
fi

# Vérifier les fichiers requis
echo "✅ Vérification des fichiers..."
files=("Dockerfile" "start.sh" "captain-definition")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    fi
done

# Vérifier les permissions de start.sh
if [ ! -x "start.sh" ]; then
    echo "🔧 Correction des permissions de start.sh..."
    chmod +x start.sh
fi

echo "✅ Tous les fichiers sont présents"
echo ""

# Afficher les informations
echo "📋 Informations du déploiement:"
echo "   - Node version: 20-alpine"
echo "   - Database: SQLite (persistent /app/data)"
echo "   - Port: 80 (CapRover)"
echo ""

# Demander confirmation
read -p "Voulez-vous déployer maintenant ? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 0
fi

# Déployer
echo ""
echo "🚢 Déploiement en cours..."
caprover deploy

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Déploiement réussi !"
    echo ""
    echo "🌐 URLs importantes:"
    echo "   - Application: https://task-manager.digitaldream.work"
    echo "   - API: https://task-manager.digitaldream.work/api"
    echo "   - Health: https://task-manager.digitaldream.work/health"
    echo ""
    echo "📝 N'oubliez pas de configurer les variables d'environnement dans CapRover:"
    echo "   - CLOUDINARY_* (pour les uploads)"
    echo "   - EMAIL_* (pour les notifications)"
    echo ""
    echo "📖 Voir CAPROVER-DEPLOY.md pour plus de détails"
else
    echo ""
    echo "❌ Échec du déploiement"
    echo "   Consultez les logs CapRover pour plus de détails"
    exit 1
fi
