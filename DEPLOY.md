# Déploiement CapRover

## 📦 Préparation

Le build est déjà préparé avec :
- ✅ Frontend React buildé dans `server/public/`
- ✅ Dockerfile optimisé pour CapRover
- ✅ captain-definition configuré
- ✅ Base SQLite avec volume persistant

## 🚀 Déploiement CapRover

### Étape 1: Créer l'application
```bash
# Dans CapRover dashboard
1. Créer nouvelle app (ex: "todo-collaboratif")
2. Ne pas activer HTTPS pour l'instant
```

### Étape 2: Déployer
```bash
# Option 1: Upload ZIP
1. Zipper le dossier racine du projet
2. Upload dans CapRover

# Option 2: Git deployment  
1. Push vers votre repo Git
2. Connecter le repo dans CapRover
```

### Étape 3: Configuration
```bash
# Variables d'environnement (optionnelles)
NODE_ENV=production
PORT=3001
DATABASE_URL=file:/app/data/prod.db
```

### Étape 4: Volume persistant (optionnel)
```bash
# Dans CapRover app settings > App Configs
# Ajouter volume mapping:
/app/data -> /var/lib/docker/volumes/todo-data/_data
```

## 📋 Vérifications post-déploiement

✅ Application accessible sur `https://votre-app.votre-domaine.com`  
✅ Page de connexion sans infos de comptes  
✅ Base de données SQLite initialisée  
✅ Comptes collaborateurs créés  
✅ Temps réel fonctionnel  

## 🔑 Comptes disponibles

- Mohammed (Mohammed1$)
- Hicham (Hicham1$)  
- Sophie (Sophie1$)
- Rik (Rik1$)

## 🛠 Maintenance

### Backup de la base
```bash
# Copier le fichier SQLite depuis le conteneur
docker cp $(docker ps -q --filter ancestor=img-todo-collaboratif):/app/data/prod.db ./backup.db
```

### Logs
```bash
# Via CapRover dashboard > App > Logs
# Ou commande docker logs
```

## 🎯 Prêt pour production !

L'application est configurée pour :
- Gestion multi-utilisateurs sans limite
- Données persistantes
- Interface sécurisée (pas d'infos de connexion exposées)
- Synchronisation temps réel
- Mode sombre/clair