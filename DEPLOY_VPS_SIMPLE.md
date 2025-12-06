# 🚀 Déploiement VPS Simple - FlowSpaces

Guide pour déployer FlowSpaces sur un VPS de test avec Docker, sans CapRover.

## 📋 Prérequis sur le VPS

- **OS**: Ubuntu 22.04 LTS (recommandé)
- **RAM**: 1 GB minimum
- **Docker** et **Docker Compose** installés
- **Domain**: `flowspaces.work` (ou sous-domaine comme `app.flowspaces.work`)

### Installation rapide Docker (Ubuntu)

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session ou:
newgrp docker

# Vérifier
docker --version
docker compose version
```

---

## 🗂️ Structure sur le VPS

```
/opt/flowspaces/
├── docker-compose.yml
├── .env
├── data/              # Base de données SQLite (persistante)
└── uploads/           # Fichiers uploadés (optionnel)
```

---

## 📦 Étape 1: Préparer les fichiers

### Option A: Cloner depuis Git

```bash
# Sur le VPS
cd /opt
sudo git clone https://github.com/VOTRE_USER/kanban.git flowspaces
sudo chown -R $USER:$USER /opt/flowspaces
cd /opt/flowspaces
```

### Option B: Transférer via SCP

```bash
# Depuis votre Mac (dans le dossier kanban)
tar -czf flowspaces.tar.gz --exclude=node_modules --exclude=.git --exclude=data .

# Transférer
scp flowspaces.tar.gz user@VOTRE_VPS_IP:/opt/

# Sur le VPS
cd /opt
mkdir -p flowspaces && cd flowspaces
tar -xzf ../flowspaces.tar.gz
```

---

## 📝 Étape 2: Configuration

### Créer le fichier .env

```bash
# /opt/flowspaces/.env
cat << 'EOF' > /opt/flowspaces/.env
# Application
NODE_ENV=production
PORT=3001
CLIENT_URL=https://flowspaces.work

# Database (SQLite - fichier local)
DATABASE_URL=file:/app/data/dev.db

# Security
CORS_ORIGINS=https://flowspaces.work,https://www.flowspaces.work

# Cloudinary (optionnel - pour uploads de fichiers)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Email (optionnel)
EMAIL_PROVIDER=dev
EMAIL_FROM=noreply@flowspaces.work
EOF
```

### (Optionnel) docker-compose simplifié

Si vous préférez un docker-compose plus simple que celui existant:

```yaml
# /opt/flowspaces/docker-compose.prod.yml
version: "3.8"

services:
  flowspaces:
    build: .
    container_name: flowspaces
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/server/uploads
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 🔨 Étape 3: Build et Lancement

```bash
cd /opt/flowspaces

# Créer les dossiers persistants
mkdir -p data uploads

# Build l'image Docker
docker build -t flowspaces:latest .

# Lancer en production
docker compose -f docker-compose.prod.yml up -d

# Ou avec le docker-compose existant:
docker compose up -d

# Vérifier les logs
docker logs -f flowspaces

# Vérifier le health check
curl http://localhost:3001/health
```

---

## 🌐 Étape 4: Configuration Nginx (Reverse Proxy + SSL)

### Installer Nginx et Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/flowspaces
```

```nginx
# /etc/nginx/sites-available/flowspaces
server {
    listen 80;
    listen [::]:80;
    server_name flowspaces.work www.flowspaces.work;

    # Redirect to HTTPS (sera activé par Certbot)
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name flowspaces.work www.flowspaces.work;

    # Les certificats seront ajoutés par Certbot
    # ssl_certificate /etc/letsencrypt/live/flowspaces.work/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/flowspaces.work/privkey.pem;

    # Taille max upload (10MB comme dans l'app)
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Proxy vers le container Docker
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (crucial pour Socket.IO)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts pour WebSocket
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO path explicite
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check (pour monitoring)
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }
}
```

### Activer la config et obtenir SSL

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/flowspaces /etc/nginx/sites-enabled/

# Tester la config
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Obtenir certificat SSL (remplacer par votre email)
sudo certbot --nginx -d flowspaces.work -d www.flowspaces.work --email votre@email.com --agree-tos

# Renouvellement automatique (déjà configuré par défaut)
sudo certbot renew --dry-run
```

---

## ✅ Étape 5: Vérification

```bash
# Vérifier que le container tourne
docker ps

# Tester le health check local
curl http://localhost:3001/health

# Tester via le domaine
curl https://flowspaces.work/health

# Vérifier les logs en temps réel
docker logs -f flowspaces
```

---

## 🔄 Mise à jour de l'application

```bash
cd /opt/flowspaces

# Arrêter le container
docker compose down

# Pull les changements (si Git)
git pull origin main

# Ou transférer les nouveaux fichiers via SCP

# Rebuild l'image
docker build -t flowspaces:latest .

# Relancer
docker compose up -d

# Vérifier
docker logs -f flowspaces
```

---

## 🛠️ Commandes utiles

```bash
# Voir les logs
docker logs flowspaces

# Logs en temps réel
docker logs -f flowspaces

# Redémarrer
docker restart flowspaces

# Arrêter
docker stop flowspaces

# Supprimer et recréer
docker compose down && docker compose up -d

# Entrer dans le container
docker exec -it flowspaces sh

# Voir la base de données
docker exec -it flowspaces sh -c "ls -la /app/data/"

# Backup de la base de données
docker cp flowspaces:/app/data/dev.db ./backup_$(date +%Y%m%d).db
```

---

## 🔒 Firewall (UFW)

```bash
# Configurer UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Vérifier
sudo ufw status
```

---

## 📊 Monitoring (Optionnel)

### Avec htop

```bash
sudo apt install htop
htop
```

### Avec Docker stats

```bash
docker stats flowspaces
```

---

## 🐛 Dépannage

### Le container ne démarre pas

```bash
# Voir les logs détaillés
docker logs flowspaces --tail 100

# Vérifier le build
docker build -t flowspaces:latest . 2>&1 | tee build.log
```

### WebSocket ne fonctionne pas

- Vérifier la config Nginx pour `Upgrade` et `Connection`
- Vérifier que `proxy_http_version 1.1` est présent
- Tester avec: `curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" https://flowspaces.work/socket.io/`

### Erreur 502 Bad Gateway

```bash
# Vérifier que le container tourne
docker ps

# Vérifier que le port 3001 est accessible
curl http://localhost:3001/health
```

### Base de données vide

```bash
# Vérifier le volume
docker exec -it flowspaces ls -la /app/data/

# Réinitialiser la DB avec les données demo
docker exec -it flowspaces sh -c "cd server && npx prisma db push && node src/seed.js"
```

---

## 📌 URLs importantes

| Service        | URL                                                  |
| -------------- | ---------------------------------------------------- |
| Application    | https://flowspaces.work                              |
| Dashboard      | https://flowspaces.work/dashboard                    |
| API Health     | https://flowspaces.work/health                       |
| Outlook Add-in | https://flowspaces.work/outlook/manifest.xml         |
| iCal Feed      | https://flowspaces.work/api/users/{userId}/tasks.ics |

---

## 🎯 Prochaines étapes

1. [ ] Configurer un backup automatique de `/opt/flowspaces/data/`
2. [ ] Ajouter monitoring (Uptime Robot, Healthchecks.io)
3. [ ] Configurer les emails SMTP pour les notifications
4. [ ] Tester l'add-in Outlook avec le nouveau domaine
5. [ ] Configurer Cloudinary pour les uploads de fichiers

---

**Déployé avec ❤️ pour FlowSpaces**
