#!/bin/bash
# =============================================================================
# FlowSpaces - Script de déploiement VPS
# Usage: ./deploy-vps.sh [VPS_IP ou SSH_HOST]
# Exemple: ./deploy-vps.sh root@192.168.1.100
#          ./deploy-vps.sh flowspaces-vps  (si configuré dans ~/.ssh/config)
# =============================================================================

set -e

# Configuration
APP_NAME="flowspaces"
REMOTE_DIR="/opt/flowspaces"
LOCAL_DIR="$(dirname "$0")"
ARCHIVE_NAME="flowspaces-deploy.tar.gz"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérifier les arguments
if [ -z "$1" ]; then
    log_error "Usage: $0 <VPS_SSH_HOST>"
    log_info "Exemple: $0 root@votre-vps-ip"
    log_info "Exemple: $0 flowspaces-vps (si configuré dans ~/.ssh/config)"
    exit 1
fi

VPS_HOST="$1"

# Se placer dans le bon répertoire
cd "$LOCAL_DIR"

log_info "🚀 Déploiement de FlowSpaces vers $VPS_HOST"
echo ""

# =============================================================================
# Étape 1: Créer l'archive
# =============================================================================
log_info "📦 Création de l'archive de déploiement..."

# Supprimer l'ancienne archive si elle existe
rm -f "$ARCHIVE_NAME"

# Créer l'archive en excluant les fichiers non nécessaires
tar -czf "$ARCHIVE_NAME" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='data' \
    --exclude='*.tar.gz' \
    --exclude='*.zip' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='deploy.tar.gz' \
    --exclude='simbase_activator*' \
    .

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
log_success "Archive créée: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

# =============================================================================
# Étape 2: Transférer vers le VPS
# =============================================================================
log_info "📤 Transfert vers le VPS..."

# Créer le répertoire distant si nécessaire
ssh "$VPS_HOST" "mkdir -p $REMOTE_DIR"

# Transférer l'archive
scp "$ARCHIVE_NAME" "$VPS_HOST:$REMOTE_DIR/"

log_success "Archive transférée"

# =============================================================================
# Étape 3: Déployer sur le VPS
# =============================================================================
log_info "🔧 Déploiement sur le VPS..."

ssh "$VPS_HOST" << 'ENDSSH'
set -e

APP_DIR="/opt/flowspaces"
cd "$APP_DIR"

echo "[VPS] Extraction de l'archive..."
tar -xzf flowspaces-deploy.tar.gz

echo "[VPS] Suppression de l'archive..."
rm -f flowspaces-deploy.tar.gz

echo "[VPS] Création des dossiers persistants..."
mkdir -p data uploads

echo "[VPS] Vérification de l'existence du fichier .env..."
if [ ! -f ".env" ]; then
    echo "[VPS] Création du fichier .env par défaut..."
    cat << 'ENVEOF' > .env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://flowspaces.work
DATABASE_URL=file:/app/data/dev.db
CORS_ORIGINS=https://flowspaces.work,https://www.flowspaces.work
EMAIL_PROVIDER=dev
EMAIL_FROM=noreply@flowspaces.work
ENVEOF
    echo "[VPS] ⚠️  Fichier .env créé avec des valeurs par défaut"
    echo "[VPS] ⚠️  Pensez à le modifier si nécessaire: nano $APP_DIR/.env"
fi

echo "[VPS] Build de l'image Docker..."
docker build -t flowspaces:latest .

echo "[VPS] Arrêt du container existant (si présent)..."
docker stop flowspaces 2>/dev/null || true
docker rm flowspaces 2>/dev/null || true

echo "[VPS] Lancement du nouveau container..."
docker run -d \
    --name flowspaces \
    --restart unless-stopped \
    -p 3001:3001 \
    -v "$APP_DIR/data:/app/data" \
    -v "$APP_DIR/uploads:/app/server/uploads" \
    --env-file .env \
    flowspaces:latest

echo "[VPS] Attente du démarrage (10 secondes)..."
sleep 10

echo "[VPS] Vérification du health check..."
if curl -s http://localhost:3001/health | grep -q "OK"; then
    echo "[VPS] ✅ Application démarrée avec succès!"
else
    echo "[VPS] ⚠️  Health check non disponible, vérifiez les logs:"
    echo "[VPS] docker logs flowspaces"
fi

ENDSSH

# =============================================================================
# Étape 4: Nettoyage local
# =============================================================================
log_info "🧹 Nettoyage local..."
rm -f "$ARCHIVE_NAME"

# =============================================================================
# Résumé
# =============================================================================
echo ""
log_success "✅ Déploiement terminé!"
echo ""
log_info "📋 Prochaines étapes sur le VPS:"
echo ""
echo "  1. Configurer Nginx (si pas encore fait):"
echo "     ssh $VPS_HOST"
echo "     sudo nano /etc/nginx/sites-available/flowspaces"
echo ""
echo "  2. Obtenir le certificat SSL:"
echo "     sudo certbot --nginx -d flowspaces.work"
echo ""
echo "  3. Vérifier les logs:"
echo "     ssh $VPS_HOST 'docker logs -f flowspaces'"
echo ""
echo "  4. Tester l'application:"
echo "     curl https://flowspaces.work/health"
echo ""
