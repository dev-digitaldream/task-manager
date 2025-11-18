# Task Manager - Application Desktop (Electron)

## Installation

Pour créer l'application desktop (macOS, Windows, Linux), suivez ces étapes:

### 1. Installer les dépendances Electron

```bash
# Installer Electron et electron-builder
npm install --save-dev electron electron-builder wait-on

# Ou copier la configuration depuis package.json.electron
```

### 2. Ajouter les scripts au package.json principal

Ajoutez ces scripts à votre `package.json` racine:

```json
{
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron electron/main.js\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "electron-builder --mac",
    "electron:build:win": "electron-builder --win",
    "electron:build:linux": "electron-builder --linux"
  }
}
```

### 3. Créer les icônes

Vous aurez besoin de créer les icônes dans différents formats:

- **macOS**: `electron/icon.icns` (512x512 px minimum)
- **Windows**: `electron/icon.ico` (256x256 px)
- **Linux**: `electron/icon.png` (512x512 px)
- **Tray**: `electron/tray-icon.png` (16x16 ou 32x32 px)

Vous pouvez utiliser un outil comme [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder) pour générer tous les formats:

```bash
npx electron-icon-builder --input=./icon-source.png --output=./electron
```

### 4. Configuration pour macOS (optionnel)

Si vous voulez signer l'app macOS, créez `electron/entitlements.mac.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
  </dict>
</plist>
```

## Développement

### Lancer en mode développement

```bash
npm run electron:dev
```

Cela va:
1. Démarrer le serveur de développement (Vite + backend)
2. Attendre que le serveur soit prêt
3. Lancer Electron qui charge `http://localhost:5173`

### Build pour production

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux

# Tous les systèmes
npm run electron:build
```

Les fichiers générés seront dans `dist-electron/`.

## Fonctionnalités Desktop

### macOS
- **Icône dans la barre de menu** (System Tray)
- **Raccourcis clavier** (Cmd+N pour nouvelle tâche, etc.)
- **Fermeture sans quitter** (l'app reste en arrière-plan)
- **Notifications natives**
- **Menu personnalisé en français**

### Windows
- **Icône dans la zone de notification** (System Tray)
- **Raccourcis clavier** (Ctrl+N pour nouvelle tâche, etc.)
- **Installation via NSIS** ou version portable
- **Démarrage automatique** (optionnel)

### Linux
- **Formats AppImage, deb, snap**
- **Icône dans le systray**
- **Intégration desktop standard**

## Architecture

```
electron/
├── main.js          # Point d'entrée Electron
├── preload.js       # Script de préchargement (sécurité)
├── icon.icns        # Icône macOS
├── icon.ico         # Icône Windows
├── icon.png         # Icône Linux
├── tray-icon.png    # Icône system tray
└── resources/       # Ressources additionnelles
```

## Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Cmd/Ctrl + N` | Nouvelle tâche |
| `Cmd/Ctrl + 1` | Vue Liste |
| `Cmd/Ctrl + 2` | Vue Kanban |
| `Cmd/Ctrl + 3` | Dashboard |
| `Cmd/Ctrl + Q` | Quitter (macOS) |
| `Cmd/Ctrl + W` | Fermer fenêtre |
| `Cmd/Ctrl + R` | Actualiser |

## Notes Importantes

### Backend local

L'application desktop embarque le serveur Node.js et la base de données SQLite. Vous devez:

1. **Modifier le build Electron** pour inclure le serveur:
   - Copier `server/` dans le bundle
   - Lancer le serveur dans `main.js` avant de créer la fenêtre
   - Utiliser un port local (ex: 3001)

2. **Exemple de code pour lancer le serveur**:

```javascript
// Dans electron/main.js
const { spawn } = require('child_process')
const path = require('path')

let serverProcess = null

function startServer() {
  const serverPath = path.join(__dirname, '../server/src/server.js')
  serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: 3001 }
  })

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`)
  })

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`)
  })
}

app.on('ready', () => {
  startServer()
  setTimeout(createWindow, 2000) // Attendre que le serveur démarre
})

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})
```

### Base de données

La base de données SQLite sera stockée dans:
- **macOS**: `~/Library/Application Support/Task Manager/`
- **Windows**: `%APPDATA%/Task Manager/`
- **Linux**: `~/.config/task-manager/`

## Distribution

### macOS

Pour distribuer sur macOS, vous devez:
1. Avoir un certificat de développeur Apple ($99/an)
2. Signer l'app avec `electron-builder`
3. Notariser l'app (requis pour macOS 10.15+)

Sans certificat, les utilisateurs devront faire "Clic droit → Ouvrir" la première fois.

### Windows

L'installeur NSIS est prêt à l'emploi. Pour éviter les avertissements Windows Defender:
1. Obtenir un certificat de signature de code
2. Configurer `electron-builder` pour signer l'installeur

### Linux

AppImage fonctionne sur toutes les distributions sans installation.
Les packages `.deb` fonctionnent sur Debian/Ubuntu.
Snap fonctionne sur toutes les distributions modernes.

## Ressources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [electron-builder](https://www.electron.build/)
- [Electron Forge](https://www.electronforge.io/) (alternative)
