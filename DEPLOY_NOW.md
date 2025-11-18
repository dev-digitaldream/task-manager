# 🚀 Déploiement Immédiat - todo.digitaldream.work

Guide ultra-rapide (5 minutes) pour déployer sur CapRover.

---

## Étape 1 : Créer l'Application (2 min)

1. **Ouvrir** : https://captain.digitaldream.work
2. **Se connecter** avec le mot de passe CapRover
3. **Apps** → **One-Click Apps/Databases**
4. Cliquer sur **"Create a New App"** (en haut à droite)
5. **App Name** : `todo-digitaldream`
6. **Has Persistent Data** : ☑️ **COCHÉ** (important pour SQLite)
7. Cliquer **"Create New App"**

---

## Étape 2 : Configurer l'Application (2 min)

Dans l'app `todo-digitaldream` qui vient d'être créée :

### HTTP Settings
1. Aller dans l'onglet **"HTTP Settings"**
2. **Enable HTTPS** : ☑️ Activé
3. **Force HTTPS** : ☑️ Activé
4. **Websocket Support** : ☑️ Activé
5. Cliquer **"Save & Update"**

### App Configs
1. Aller dans l'onglet **"App Configs"**
2. Cliquer sur **"Bulk Edit"**
3. Coller ces variables :

```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://todo.digitaldream.work
DATABASE_URL=file:/app/data/todo.db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS=https://todo.digitaldream.work,https://outlook.office.com,https://outlook.office365.com,https://outlook.live.com
```

4. Cliquer **"Save & Update"**

### Persistent Directories
1. Rester dans l'onglet **"App Configs"**
2. Section **"Persistent Directories"**
3. Ajouter un répertoire : `/app/data`
4. Cliquer **"Add Persistent Directory"**
5. Cliquer **"Save & Update"**

### Domain
1. Aller dans l'onglet **"HTTP Settings"**
2. Section **"Custom Domains"**
3. Entrer : `todo.digitaldream.work`
4. Cliquer **"Connect New Domain"**
5. **Enable HTTPS** : ☑️ Activé
6. Cliquer **"Enable HTTPS"**
7. Attendre 1-2 minutes pour le certificat SSL

---

## Étape 3 : Déployer le Code (1 min)

### Option A : Via Git (Recommandé)

```bash
cd /Volumes/ExtremeSSD/projetcs/kanban

# Ajouter remote CapRover
git remote add caprover ssh://root@191.96.11.125:22/apps/todo-digitaldream

# Déployer
git push caprover main:master
```

### Option B : Via CapRover CLI

```bash
cd /Volumes/ExtremeSSD/projetcs/kanban

# Déployer
caprover deploy
# Sélectionner: todo-digitaldream
# Branch: main
```

---

## Étape 4 : Initialiser la Base de Données (30 sec)

Une fois le déploiement terminé :

1. Dans CapRover, aller dans l'app `todo-digitaldream`
2. Onglet **"Deployment"** → **"View Logs"**
3. Attendre que les logs montrent "Server running on port 3001"
4. Cliquer sur **"App Logs"** (en haut)
5. Ensuite aller dans **"View Shell"** (bouton en haut à droite)
6. Dans le terminal qui s'ouvre, taper :

```bash
cd /app/server
npx prisma db push
npx prisma db seed
```

7. Fermer le terminal

---

## ✅ Vérification

1. **Ouvrir** : https://todo.digitaldream.work
2. **Vérifier** que l'app se charge
3. **Tester** :
   - Création de tâche
   - Assignation d'utilisateur
   - WebSocket temps réel

4. **Tester l'add-on Outlook** :
   - Ouvrir https://outlook.office.com
   - Settings → Manage add-ins
   - Add from URL : `https://todo.digitaldream.work/outlook/manifest.json`

---

## 🐛 Si Problème

### App ne démarre pas
```bash
# Vérifier les logs
CapRover UI → todo-digitaldream → App Logs
```

### Base de données vide
```bash
# Réinitialiser
CapRover UI → View Shell:
cd /app/server
rm -f /app/data/todo.db
npx prisma db push
npx prisma db seed
```

### DNS ne fonctionne pas
- Vérifier que `todo.digitaldream.work` pointe vers `191.96.11.125`
- Utiliser `dig todo.digitaldream.work` pour vérifier

---

## 🎉 Terminé !

Votre instance est maintenant disponible à :
- **Application** : https://todo.digitaldream.work
- **Add-on Outlook** : https://todo.digitaldream.work/outlook/manifest.json
- **API** : https://todo.digitaldream.work/api/users

---

**Temps total** : ~5 minutes
**Prochaine étape** : Tester et créer screenshots pour AppSource
