# 🚀 Migration vers VPS - Checklist Opérationnelle

Ce document détaille les étapes concrètes pour migrer FlowSpaces vers votre VPS.

## 1. Préparatifs (Machine Locale)

- [ ] **Sauvegarder le code** : Assurez-vous que tous les changements récents (y compris le fix SearchModal) sont committés sur Git.
- [ ] **Frontend Build** : Vérifiez que le build frontend fonctionne localement.
  ```bash
  cd client
  npm run build
  # Doit créer un dossier 'dist'
  ```
- [ ] **Base de Données** : Vous utilisez déjà Supabase. Notez votre `DATABASE_URL`.

## 2. Configuration du VPS

Connectez-vous à votre VPS en SSH (`ssh user@ip`).

### A. Installation des pré-requis

```bash
# Mettre à jour
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PM2 (Gestionnaire de processus)
sudo npm install -g pm2

# Installer Nginx (Serveur Web)
sudo apt install -y nginx
```

### B. Déploiement du Code

Cloner votre dépôt Git sur le VPS (par exemple dans `/var/www/flowspaces`).

```bash
git clone <votre-repo-url> /var/www/flowspaces
cd /var/www/flowspaces
```

### C. Backend Setup

```bash
cd server
npm install --production

# Générer le client Prisma
npx prisma generate

# Créer le fichier .env
nano .env
```

Collez-y votre `DATABASE_URL` Supabase (port 6543 en production pooler) et autres clés :

```env
DATABASE_URL="votre_url_supabase"
JWT_SECRET="votre_secret_jwt"
WEB_URL="https://flowspaces.work"
SMTP_HOST=...
```

### D. Frontend Setup

```bash
cd ../client
npm install
npm run build
```

Ceci va générer le dossier `/var/www/flowspaces/client/dist`.

## 3. Lancement et Serveur Web

### A. Démarrer le Backend avec PM2

```bash
cd ../server
pm2 start src/server.js --name "flowspaces-api"
pm2 save
pm2 startup
```

### B. Configurer Nginx

Créer un fichier de config Nginx : `sudo nano /etc/nginx/sites-available/flowspaces`

```nginx
server {
    listen 80;
    server_name flowspaces.work www.flowspaces.work; # Remplacez par votre domaine ou IP

    root /var/www/flowspaces/client/dist;
    index index.html;

    # Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io Proxy
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/flowspaces /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Finalisation

- Accédez à votre IP ou Domaine.
- Vérifiez que le Login fonctionne (connexion Supabase).
- Vérifiez que les WebSockets (Socket.io) fonctionnent (mises à jour temps réel).

Votre SaaS est maintenant en production ! 🚀
