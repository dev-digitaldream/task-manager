# Outlook Add-in - Todo Collaboratif

Extension Outlook pour créer des tâches directement depuis vos emails.

## 📋 Fonctionnalités

- ✅ Créer une tâche depuis n'importe quel email
- ✅ Extraire automatiquement le sujet comme titre
- ✅ Ajouter le corps de l'email comme commentaire
- ✅ Assigner la tâche à un utilisateur
- ✅ Définir priorité et date d'échéance
- ✅ Publier sur le dashboard public
- ✅ Interface native Outlook

## 🚀 Déploiement

### 1. Héberger les fichiers

Les fichiers suivants doivent être accessibles via HTTPS sur `task-manager.digitaldream.work`:

```
/outlook/
  ├── manifest.xml
  ├── taskpane.html
  ├── icon-16.png
  ├── icon-32.png
  ├── icon-64.png
  ├── icon-80.png
  └── icon-128.png
```

**Servir les fichiers depuis le serveur Node.js:**

```javascript
// Dans server/src/server.js
app.use('/outlook', express.static(path.join(__dirname, '../../outlook-addin')));
```

### 2. Créer les icônes

Créer des icônes PNG aux formats requis (16x16, 32x32, 64x64, 80x80, 128x128).

Icône recommandée: Logo Todo avec fond transparent.

### 3. Installation dans Outlook

#### Option A: Outlook Desktop (Windows/Mac)

1. Ouvrir Outlook
2. Aller dans **Fichier > Gérer les compléments** (ou **Get Add-ins**)
3. Cliquer sur **Mes compléments**
4. Cliquer sur **+ Ajouter un complément personnalisé**
5. Sélectionner **Ajouter à partir d'un fichier**
6. Parcourir et sélectionner `manifest.xml`
7. Accepter l'installation

#### Option B: Outlook Web (Office 365)

1. Ouvrir Outlook sur le web (outlook.office.com)
2. Cliquer sur **Paramètres** (⚙️) > **Afficher tous les paramètres Outlook**
3. Aller dans **Général > Gérer les compléments**
4. Cliquer sur **+ Ajouter un complément personnalisé**
5. Sélectionner **Ajouter à partir d'une URL**
6. Entrer: `https://task-manager.digitaldream.work/outlook/manifest.xml`
7. Cliquer sur **Installer**

#### Option C: Déploiement centralisé (Admin Microsoft 365)

1. Se connecter au **Centre d'administration Microsoft 365**
2. Aller dans **Paramètres > Compléments intégrés**
3. Cliquer sur **Charger un complément personnalisé**
4. Sélectionner **J'ai un fichier manifeste sur cet appareil**
5. Télécharger `manifest.xml`
6. Assigner aux utilisateurs/groupes souhaités

### 4. Utilisation

1. Ouvrir un email dans Outlook
2. Cliquer sur l'onglet **Accueil** (Home)
3. Chercher le bouton **Todo Collaboratif** dans le ruban
4. Cliquer sur **Créer une tâche**
5. Le panneau latéral s'ouvre avec:
   - Titre pré-rempli (sujet de l'email)
   - Expéditeur affiché
   - Formulaire de création de tâche
6. Compléter les champs et cliquer **Créer la tâche**

## 🔧 Configuration

### Variables d'environnement

Le add-in communique avec l'API via:
```
https://task-manager.digitaldream.work/api/tasks
https://task-manager.digitaldream.work/api/users
```

### CORS

S'assurer que le serveur autorise les requêtes depuis Outlook:

```javascript
// server/src/server.js
app.use(cors({
  origin: [
    'https://outlook.office.com',
    'https://outlook.office365.com',
    'https://outlook.live.com',
    'https://task-manager.digitaldream.work'
  ]
}));
```

## 📱 Compatibilité

- ✅ Outlook Desktop (Windows)
- ✅ Outlook Desktop (Mac)
- ✅ Outlook Web App
- ✅ Outlook Mobile (iOS/Android)
- ✅ Office 365

## 🔒 Sécurité

- Utilise **HTTPS** obligatoire
- Permissions: `ReadWriteMailbox` (lecture emails uniquement)
- Aucune donnée email n'est stockée côté serveur
- Communications API sécurisées

## 🐛 Dépannage

### Le add-in n'apparaît pas
- Vérifier que le manifest.xml est valide (validateur Microsoft)
- S'assurer que tous les fichiers sont accessibles en HTTPS
- Vider le cache d'Outlook et redémarrer

### Erreur CORS
- Vérifier la configuration CORS du serveur
- S'assurer que `https://outlook.office.com` est autorisé

### Les utilisateurs ne se chargent pas
- Vérifier que `/api/users` est accessible
- Ouvrir la console DevTools dans le taskpane (F12)

## 📚 Ressources

- [Documentation Office Add-ins](https://docs.microsoft.com/en-us/office/dev/add-ins/)
- [Outlook Add-ins API](https://docs.microsoft.com/en-us/office/dev/add-ins/reference/objectmodel/requirement-set-1.1/outlook-requirement-set-1.1)
- [Manifest Schema](https://docs.microsoft.com/en-us/office/dev/add-ins/develop/add-in-manifests)

## 📝 Notes de version

### v1.0.0
- Création de tâches depuis emails
- Extraction automatique du sujet
- Ajout du corps email en commentaire
- Assignation et priorités
- Support dashboard public
