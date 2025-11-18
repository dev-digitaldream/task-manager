# Task Manager - Application Desktop avec Tauri

## Pourquoi Tauri > Electron?

| Critère | Tauri | Electron |
|---------|-------|----------|
| **Taille** | 3-5 MB | 50-120 MB |
| **RAM** | 50-100 MB | 150-300 MB |
| **Backend** | Rust (sécurisé) | Node.js |
| **WebView** | Natif (Safari/Edge) | Chrome embarqué |
| **Startup** | ~1s | ~3-5s |
| **Build time** | Rapide | Lent |
| **Sécurité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Installation

### Prérequis

#### macOS
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Installer les dépendances
xcode-select --install
```

#### Windows
```powershell
# Installer Rust via https://rustup.rs/
# Installer Visual Studio Build Tools
# Installer WebView2 (déjà sur Windows 11)
```

#### Linux (Ubuntu/Debian)
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Dépendances
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Installer Tauri dans le projet

```bash
# À la racine du projet
npm install -D @tauri-apps/cli @tauri-apps/api
```

## Configuration

Les fichiers de configuration sont déjà créés:

```
kanban/
├── tauri.conf.json         # Config principale
├── src-tauri/
│   ├── Cargo.toml          # Dépendances Rust
│   ├── src/
│   │   └── main.rs         # Code Rust principal
│   └── icons/              # Icônes de l'app
└── package.json            # Scripts npm
```

## Développement

### Lancer en mode dev

```bash
npm run tauri dev
```

Cela va:
1. Lancer le serveur Vite (frontend)
2. Lancer le serveur backend Node.js
3. Compiler et lancer l'app Tauri

### Modifier le package.json

Ajoutez ces scripts:

```json
{
  "scripts": {
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:debug": "tauri build --debug"
  }
}
```

## Build pour Production

### macOS (DMG + App Bundle)
```bash
npm run tauri:build
```

Fichiers générés:
- `src-tauri/target/release/bundle/dmg/Task Manager_1.0.0_aarch64.dmg` (Apple Silicon)
- `src-tauri/target/release/bundle/dmg/Task Manager_1.0.0_x64.dmg` (Intel)
- `src-tauri/target/release/bundle/macos/Task Manager.app`

### Windows (MSI + EXE)
```bash
npm run tauri:build
```

Fichiers générés:
- `src-tauri/target/release/bundle/msi/Task Manager_1.0.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Task Manager_1.0.0_x64-setup.exe`

### Linux (DEB + AppImage)
```bash
npm run tauri:build
```

Fichiers générés:
- `src-tauri/target/release/bundle/deb/task-manager_1.0.0_amd64.deb`
- `src-tauri/target/release/bundle/appimage/task-manager_1.0.0_amd64.AppImage`

## Fonctionnalités

### System Tray
L'app apparaît dans la barre de menu (macOS) ou zone de notification (Windows/Linux):
- Click pour afficher/cacher
- Menu contextuel:
  - Afficher
  - Nouvelle tâche
  - Quitter

### Raccourcis Clavier
Les raccourcis sont gérés par le frontend (React):
- `Cmd/Ctrl + N` - Nouvelle tâche
- `Cmd/Ctrl + 1` - Vue Liste
- `Cmd/Ctrl + 2` - Vue Kanban
- `Cmd/Ctrl + 3` - Dashboard

### Backend Embarqué
Pour embarquer le serveur Node.js dans Tauri:

#### Option 1: Sidecar (Recommandé)
Ajoutez à `tauri.conf.json`:

```json
{
  "bundle": {
    "externalBin": [
      "binaries/node",
      "binaries/server"
    ]
  }
}
```

Puis dans `main.rs`:

```rust
use tauri::api::process::{Command, CommandEvent};

// Lancer le serveur Node.js
tauri::async_runtime::spawn(async move {
    let (mut rx, _child) = Command::new_sidecar("server")
        .expect("failed to create `server` binary command")
        .spawn()
        .expect("Failed to spawn sidecar");

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event {
            println!("Server: {}", line);
        }
    }
});
```

#### Option 2: Bundled avec pkg
Utilisez `pkg` pour compiler le serveur en binaire:

```bash
npm install -g pkg
cd server
pkg package.json -t node18-macos-arm64,node18-win-x64,node18-linux-x64
```

## Icônes

Créez les icônes avec un outil comme `@tauri-apps/cli`:

```bash
npm install -g @tauri-apps/cli

# Générer depuis une image source (1024x1024 minimum)
tauri icon path/to/icon.png
```

Formats nécessaires:
- `icons/32x32.png`
- `icons/128x128.png`
- `icons/128x128@2x.png`
- `icons/icon.icns` (macOS)
- `icons/icon.ico` (Windows)

## Signature & Distribution

### macOS

#### Code Signing
```bash
# Obtenir un certificat Apple Developer ($99/an)
# Configurer dans tauri.conf.json:
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "entitlements": "entitlements.plist"
    }
  }
}
```

#### Notarization
```bash
# Après build
xcrun notarytool submit "Task Manager.dmg" \
  --apple-id "your@email.com" \
  --team-id "TEAM_ID" \
  --password "app-specific-password"
```

### Windows

#### Code Signing
```powershell
# Obtenir un certificat de signature de code
# Configurer dans tauri.conf.json:
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_THUMBPRINT",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

## Avantages de Tauri

### 1. Taille
Une app Tauri pèse **3-5 MB** vs **50-120 MB** pour Electron.

### 2. Performance
- Démarrage en **~1 seconde**
- Consommation RAM divisée par **3**
- WebView natif = meilleure intégration système

### 3. Sécurité
- Backend Rust (memory-safe)
- Permissions granulaires
- Pas d'accès Node.js direct depuis le frontend

### 4. Developer Experience
- Hot reload ultra rapide
- Debugging facile
- API simple et moderne

## Migration depuis Electron

### Différences principales

| Electron | Tauri |
|----------|-------|
| `ipcRenderer` | `@tauri-apps/api/tauri` |
| `remote` | Commands Rust |
| Node.js backend | Rust backend |
| `electron-builder` | `tauri build` |

### Exemple de migration

**Electron:**
```javascript
// main.js
ipcMain.handle('get-data', async () => {
  return await fetchData()
})

// renderer.js
const data = await ipcRenderer.invoke('get-data')
```

**Tauri:**
```rust
// main.rs
#[tauri::command]
async fn get_data() -> Result<String, String> {
    Ok("data".to_string())
}
```

```javascript
// App.jsx
import { invoke } from '@tauri-apps/api/tauri'

const data = await invoke('get_data')
```

## Ressources

- [Documentation Tauri](https://tauri.app)
- [Guide de migration](https://tauri.app/v1/guides/migration/from-electron)
- [Discord Tauri](https://discord.gg/tauri)
- [Exemples](https://github.com/tauri-apps/awesome-tauri)

## Troubleshooting

### "Failed to load tauri"
- Vérifier que Rust est installé: `rustc --version`
- Relancer le terminal après installation Rust

### Build fails sur macOS
- Installer Xcode Command Line Tools: `xcode-select --install`

### Build fails sur Windows
- Installer Visual Studio Build Tools
- Installer WebView2 Runtime

### App ne se lance pas
- Vérifier les logs: `tauri dev` en mode verbose
- Vérifier que le backend Node.js démarre correctement

## Scripts utiles

```json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:debug": "tauri build --debug",
    "tauri:icon": "tauri icon assets/icon.png"
  }
}
```

## Prochaines étapes

1. ✅ Setup Tauri (fait)
2. 🔄 Générer les icônes
3. 🔄 Embarquer le serveur Node.js
4. 🔄 Tester le build
5. 🔄 Signer l'app (macOS/Windows)
6. 🔄 Distribuer (DMG, MSI, AppImage)
