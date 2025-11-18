# 🧪 Guide de Test Local - Add-on Outlook

## Méthode 1 : Test sur Outlook Web (Recommandé)

### Étape 1 : Démarrer le Serveur

```bash
# Terminal 1 : Démarrer le backend
cd /Volumes/ExtremeSSD/projetcs/kanban/server
npm run dev

# Le serveur démarre sur http://localhost:3001
```

```bash
# Terminal 2 : Démarrer le frontend (optionnel pour voir le dashboard)
cd /Volumes/ExtremeSSD/projetcs/kanban/client
npm run dev

# Le client démarre sur http://localhost:5173
```

### Étape 2 : Modifier le Manifeste pour Local

**Option A : Créer un manifeste de développement**

Créez `outlook-addin/manifest-dev.json` :

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/office-js/add-in-manifest.schema.json",
  "id": "99a09b40-9d5c-406a-96cc-ae5ff0333ff0-dev",
  "version": "1.0.0-dev",
  "manifestVersion": 2,
  "name": {
    "short": "Task Manager (DEV)"
  },
  "description": {
    "short": "Create tasks from emails - DEV",
    "full": "Development version of Task Manager Outlook Add-in"
  },
  "developer": {
    "name": "Digital Dream",
    "websiteUrl": "http://localhost:3001",
    "privacyUrl": "http://localhost:3001/privacy.html",
    "termsOfUseUrl": "http://localhost:3001/terms.html"
  },
  "icons": {
    "16": "http://localhost:3001/outlook/icon-16.png",
    "32": "http://localhost:3001/outlook/icon-32.png",
    "64": "http://localhost:3001/outlook/icon-64.png",
    "128": "http://localhost:3001/outlook/icon-128.png"
  },
  "authorization": {
    "permissions": {
      "resourceSpecific": [
        {
          "name": "MailboxItem.Read.User",
          "type": "Delegated"
        }
      ]
    }
  },
  "validDomains": [
    "localhost:3001"
  ],
  "extensions": [
    {
      "requirements": {
        "capabilities": [
          {
            "name": "Mailbox",
            "minVersion": "1.3"
          }
        ]
      },
      "runtimes": [
        {
          "requirements": {
            "capabilities": [
              {
                "name": "Mailbox",
                "minVersion": "1.3"
              }
            ]
          },
          "id": "TaskPane_Runtime",
          "type": "general",
          "code": {
            "page": "http://localhost:3001/outlook/taskpane.html"
          },
          "lifetime": "short",
          "actions": [
            {
              "id": "TaskPaneAction",
              "type": "openPage",
              "pinnable": false,
              "view": "TaskPane_View"
            }
          ]
        }
      ],
      "ribbons": [
        {
          "contexts": [
            "mailRead"
          ],
          "tabs": [
            {
              "builtInTabId": "TabDefault",
              "groups": [
                {
                  "id": "TaskManagerGroup",
                  "label": "Task Manager (DEV)",
                  "icons": [
                    {
                      "size": 16,
                      "url": "http://localhost:3001/outlook/icon-16.png"
                    },
                    {
                      "size": 32,
                      "url": "http://localhost:3001/outlook/icon-32.png"
                    },
                    {
                      "size": 64,
                      "url": "http://localhost:3001/outlook/icon-64.png"
                    }
                  ],
                  "controls": [
                    {
                      "id": "CreateTaskButton",
                      "type": "button",
                      "label": "Create Task",
                      "icons": [
                        {
                          "size": 16,
                          "url": "http://localhost:3001/outlook/icon-16.png"
                        },
                        {
                          "size": 32,
                          "url": "http://localhost:3001/outlook/icon-32.png"
                        },
                        {
                          "size": 64,
                          "url": "http://localhost:3001/outlook/icon-64.png"
                        }
                      ],
                      "supertip": {
                        "title": "Create Task",
                        "description": "Create a task from this email in Task Manager"
                      },
                      "actionId": "TaskPaneAction"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Option B : Modifier temporairement taskpane.html**

Ouvrez `outlook-addin/taskpane.html` et changez :

```javascript
// Ligne 265 et suivantes
const response = await fetch('http://localhost:3001/api/users');

// Et lignes 316, 338
const response = await fetch('http://localhost:3001/api/tasks', {
```

### Étape 3 : Installer l'Add-in sur Outlook Web

1. **Ouvrez Outlook Web** :
   - Allez sur https://outlook.office.com
   - Connectez-vous avec votre compte Microsoft/Office 365

2. **Accédez aux paramètres** :
   - Cliquez sur l'icône ⚙️ (Settings) en haut à droite
   - Cliquez sur **"View all Outlook settings"**

3. **Gérer les add-ins** :
   - Dans le menu gauche : **General** → **Manage add-ins**
   - Cliquez sur **"+ My add-ins"** (ou **"Mes compléments"**)

4. **Ajouter depuis un fichier** :
   - Cliquez sur **"+ Add a custom add-in"**
   - Sélectionnez **"Add from file..."**
   - Uploadez `manifest-dev.json` (ou `manifest.json` modifié)
   - Cliquez **"Install"**

   ⚠️ **Note** : Si "Add from file" ne fonctionne pas, utilisez "Add from URL" (voir ci-dessous)

### Étape 4 : Servir le Manifeste via HTTP (Alternative)

Si l'upload direct ne fonctionne pas :

```bash
# Le serveur sert déjà les fichiers outlook-addin via /outlook
# Le manifeste est accessible à :
# http://localhost:3001/outlook/manifest-dev.json
```

Utilisez **"Add from URL"** et entrez :
```
http://localhost:3001/outlook/manifest-dev.json
```

⚠️ **Problème HTTPS** : Outlook Web peut refuser HTTP en production. Solutions :
- Utilisez https://task-manager.digitaldream.work/outlook/manifest.json (production)
- Ou configurez HTTPS local avec mkcert (voir ci-dessous)

### Étape 5 : Tester l'Add-in

1. **Ouvrez un email** dans Outlook Web
2. **Vérifiez le ruban** : Le bouton "Create Task" devrait apparaître dans l'onglet "Home"
3. **Cliquez sur "Create Task"**
4. Le panneau latéral s'ouvre avec le formulaire
5. **Remplissez le formulaire** et créez une tâche
6. **Vérifiez la console** (F12) pour les erreurs

### Déboguer

**Ouvrir la console du taskpane** :
- Dans Outlook Web avec l'add-in ouvert
- Appuyez sur **F12** pour ouvrir Developer Tools
- L'add-in s'exécute dans un iframe
- Allez dans l'onglet **Console** pour voir les erreurs

---

## Méthode 2 : Test sur Outlook Desktop (Windows/Mac)

### Windows

1. **Lancer Outlook Desktop**

2. **Accéder aux Add-ins** :
   - **File** → **Info** → **Manage Add-ins**
   - Ou **Get Add-ins** depuis le ruban

3. **Sideload** :
   - Cliquez sur **"My add-ins"**
   - Sélectionnez **"Add a custom add-in"** → **"Add from file"**
   - Uploadez `manifest-dev.json`

4. **Tester** :
   - Ouvrez un email
   - Le bouton "Create Task" apparaît dans le ruban
   - Cliquez pour ouvrir le taskpane

### Mac

1. **Lancer Outlook Desktop**

2. **Accéder aux Add-ins** :
   - Menu **Tools** → **Get Add-ins**

3. **Sideload** :
   - Cliquez sur **"My add-ins"**
   - **"Add a custom add-in"** → **"Add from file"**
   - Uploadez `manifest-dev.json`

### Déboguer sur Desktop

**Windows** :
```bash
# Activer le débogage
# Créer une clé de registre :
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Office\16.0\WEF\Developer

# Ajouter UseDebugging = 1 (DWORD)
```

**Mac** :
- Les logs sont dans la Console système
- Ou utilisez Safari Developer Tools (si activé)

---

## Méthode 3 : HTTPS Local avec mkcert (Recommandé pour test réaliste)

Pour tester en conditions réelles avec HTTPS :

### Installation de mkcert

**Mac** :
```bash
brew install mkcert
mkcert -install
```

**Linux** :
```bash
# Debian/Ubuntu
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
mkcert -install
```

**Windows** :
```bash
# Avec Chocolatey
choco install mkcert
mkcert -install
```

### Générer Certificat Local

```bash
cd /Volumes/ExtremeSSD/projetcs/kanban/server

# Générer certificat pour localhost
mkcert localhost 127.0.0.1 ::1

# Crée 2 fichiers :
# - localhost+2.pem (certificat)
# - localhost+2-key.pem (clé privée)
```

### Modifier server.js pour HTTPS

```javascript
// server/src/server.js
const https = require('https');
const fs = require('fs');

// ... existing code ...

// En mode développement avec HTTPS
if (process.env.USE_HTTPS === 'true') {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../localhost+2-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../localhost+2.pem'))
  };

  const httpsServer = https.createServer(httpsOptions, app);
  const io = socketIo(httpsServer, { /* ... */ });

  httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running on https://localhost:${PORT}`);
  });
} else {
  // HTTP normal
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

### Lancer avec HTTPS

```bash
USE_HTTPS=true npm run dev
```

Le serveur tourne maintenant sur `https://localhost:3001`

---

## Méthode 4 : Test avec Serveur de Production

Le plus simple pour un test rapide :

### Étape 1 : Vérifier que le serveur de production fonctionne

```bash
# Tester l'API
curl https://task-manager.digitaldream.work/api/users

# Tester le manifeste
curl https://task-manager.digitaldream.work/outlook/manifest.json
```

### Étape 2 : Installer sur Outlook Web

1. Allez sur https://outlook.office.com
2. Settings → Manage add-ins → **"+ Add a custom add-in"**
3. Sélectionnez **"Add from URL"**
4. Entrez :
   ```
   https://task-manager.digitaldream.work/outlook/manifest.json
   ```
5. Cliquez **"Install"**

### Étape 3 : Tester

- Ouvrez un email
- Cliquez sur "Create Task" dans le ruban
- Testez la création de tâche

---

## 🐛 Résolution de Problèmes

### Add-in n'apparaît pas

**Solution** :
1. Rafraîchir la page (Ctrl+F5 ou Cmd+Shift+R)
2. Vider le cache navigateur
3. Se déconnecter/reconnecter d'Outlook
4. Vérifier que le manifeste est valide :
   ```bash
   node -e "console.log(JSON.parse(require('fs').readFileSync('manifest-dev.json')))"
   ```

### Erreur CORS

**Solution** :
1. Vérifier que le serveur tourne
2. Vérifier la console (F12) :
   ```
   Access-Control-Allow-Origin: localhost:3001
   ```
3. Si erreur, vérifier `server/src/middleware/security.js` :
   ```javascript
   const allowedOrigins = [
     'http://localhost:3001',
     'https://localhost:3001',
     // ...
   ];
   ```

### Users ne se chargent pas

**Solution** :
1. Vérifier que l'API fonctionne :
   ```bash
   curl http://localhost:3001/api/users
   ```
2. Vérifier la console navigateur (F12)
3. Vérifier que la base de données a des users :
   ```bash
   cd server
   npm run db:seed
   ```

### Taskpane vide ou blanc

**Solution** :
1. Console (F12) → vérifier les erreurs
2. Vérifier que `taskpane.html` est accessible :
   ```bash
   curl http://localhost:3001/outlook/taskpane.html
   ```
3. Vérifier que Office.js se charge :
   ```
   https://appsforoffice.microsoft.com/lib/1/hosted/office.js
   ```

### Certificat SSL non valide (localhost)

**Solution** :
- Utiliser mkcert (voir Méthode 3)
- Ou accepter le certificat manuellement dans le navigateur

---

## ✅ Checklist de Test

Avant de soumettre, testez :

**Fonctionnalités** :
- [ ] Add-in s'installe sans erreur
- [ ] Bouton "Create Task" apparaît dans le ruban
- [ ] Taskpane s'ouvre au clic
- [ ] Email subject pré-remplit le titre
- [ ] Liste des users se charge
- [ ] Création de tâche fonctionne
- [ ] Message de succès s'affiche
- [ ] Tâche apparaît dans le dashboard

**Compatibilité** :
- [ ] Outlook Web (Chrome)
- [ ] Outlook Web (Edge)
- [ ] Outlook Web (Firefox)
- [ ] Outlook Desktop Windows (si disponible)
- [ ] Outlook Desktop Mac (si disponible)

**Sécurité** :
- [ ] HTTPS fonctionne
- [ ] Aucune erreur CORS
- [ ] Aucune erreur CSP dans la console

**UX** :
- [ ] Interface responsive
- [ ] Pas de scrollbar inutile
- [ ] Formulaire accessible
- [ ] Erreurs bien gérées

---

## 🚀 Script de Test Rapide

Créez `outlook-addin/quick-test.sh` :

```bash
#!/bin/bash

echo "🧪 Quick Test Script for Outlook Add-in"
echo "========================================"

# 1. Check server
echo ""
echo "1️⃣ Checking server..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is NOT running"
    echo "   Run: cd server && npm run dev"
    exit 1
fi

# 2. Check API
echo ""
echo "2️⃣ Checking API..."
if curl -s http://localhost:3001/api/users > /dev/null; then
    echo "   ✅ API /users is accessible"
else
    echo "   ❌ API is NOT accessible"
fi

# 3. Check taskpane
echo ""
echo "3️⃣ Checking taskpane.html..."
if curl -s http://localhost:3001/outlook/taskpane.html > /dev/null; then
    echo "   ✅ taskpane.html is accessible"
else
    echo "   ❌ taskpane.html is NOT accessible"
fi

# 4. Check manifest
echo ""
echo "4️⃣ Checking manifest..."
if [ -f "manifest.json" ]; then
    echo "   ✅ manifest.json exists"
    if node -e "JSON.parse(require('fs').readFileSync('manifest.json'))" 2>/dev/null; then
        echo "   ✅ manifest.json is valid JSON"
    else
        echo "   ❌ manifest.json is INVALID JSON"
    fi
else
    echo "   ❌ manifest.json NOT found"
fi

# 5. Check icons
echo ""
echo "5️⃣ Checking icons..."
for size in 16 32 64 128; do
    if [ -f "icon-${size}.png" ]; then
        echo "   ✅ icon-${size}.png exists"
    else
        echo "   ❌ icon-${size}.png NOT found"
    fi
done

echo ""
echo "========================================"
echo "📋 Next steps:"
echo "1. Open https://outlook.office.com"
echo "2. Settings → Manage add-ins"
echo "3. Add from URL: http://localhost:3001/outlook/manifest.json"
echo "4. Test creating a task from an email"
echo ""
echo "💡 For debugging, press F12 in Outlook Web"
```

```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

## 📚 Ressources

- [Sideloading Office Add-ins](https://learn.microsoft.com/office/dev/add-ins/testing/test-debug-office-add-ins)
- [Debug Add-ins in Office on the web](https://learn.microsoft.com/office/dev/add-ins/testing/debug-add-ins-in-office-online)
- [mkcert - Valid HTTPS certificates for localhost](https://github.com/FiloSottile/mkcert)

---

**Bonne chance pour vos tests ! 🚀**
