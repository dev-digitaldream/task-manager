# 📦 Installation et Build

## 🚀 Démarrage rapide

### 1. Installer les prérequis

#### Sur macOS
```bash
# Rust (si pas déjà installé)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Node.js (si pas déjà installé) 
brew install node
```

#### Sur Windows
1. Installer [Rust](https://rustup.rs/) via l'installeur Windows
2. Installer [Node.js](https://nodejs.org/)
3. Installer [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (déjà présent sur Windows 10/11)

### 2. Installer les dépendances

```bash
cd simbase-app
npm install
```

### 3. Lancer en mode dev

```bash
npm run dev
```

L'application s'ouvre automatiquement ! ✨

## 🏗️ Build pour distribution

### macOS

```bash
./build.sh
```

ou

```bash
npm run build
```

**Résultat** : `src-tauri/target/release/bundle/dmg/Simbase Activator_1.0.0_universal.dmg`

### Windows

```bash
npm run build
```

**Résultat** : `src-tauri/target/release/bundle/msi/Simbase Activator_1.0.0_x64_en-US.msi`

## 📂 Où trouver l'application compilée

```
src-tauri/target/release/bundle/
├── dmg/           # macOS (.dmg)
├── macos/         # macOS (.app)
├── msi/           # Windows (.msi)
└── nsis/          # Windows (.exe installer)
```

## 🎨 Personnaliser les icônes

1. Créez vos icônes PNG (32x32, 128x128, 256x256, 512x512)
2. Placez-les dans `src-tauri/icons/`
3. Utilisez [tauri-icon](https://www.npmjs.com/package/@tauri-apps/tauricon) pour générer tous les formats :

```bash
npm install -g @tauri-apps/tauricon
cd src-tauri
tauricon ./icons/icon.png
```

## ⚠️ Problèmes courants

### macOS : "App can't be opened because it is from an unidentified developer"

**Solution** : Clic droit → Ouvrir (ou dans Préférences Système → Sécurité)

Pour signer l'app :
```bash
codesign --force --deep --sign - "src-tauri/target/release/bundle/macos/Simbase Activator.app"
```

### Windows : "Windows protected your PC"

**Solution** : Cliquer sur "More info" → "Run anyway"

Pour éviter ça, vous devez signer l'app avec un certificat code signing.

### Erreur de compilation Rust

```bash
# Mettre à jour Rust
rustup update

# Clean et rebuild
cd src-tauri
cargo clean
cd ..
npm run build
```

## 🚀 Premier test

1. **Lancez l'app** (dev ou build)
2. **Entrez votre clé API** Simbase
3. **Importez un CSV** de test
4. **Cliquez sur "Traiter les SIM"**
5. **Vérifiez les résultats** !

## 📊 Taille de l'application

- **macOS** : ~10-15 MB (DMG)
- **Windows** : ~8-12 MB (MSI)

Beaucoup plus léger qu'Electron ! 🎉

## 🔧 Build avancé

### Build uniquement pour architecture spécifique

```bash
# macOS Intel
rustup target add x86_64-apple-darwin
npm run tauri build -- --target x86_64-apple-darwin

# macOS Apple Silicon
rustup target add aarch64-apple-darwin
npm run tauri build -- --target aarch64-apple-darwin

# Windows 64-bit
rustup target add x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-pc-windows-msvc
```

### Build optimisé (plus petit)

Éditez `src-tauri/Cargo.toml` :

```toml
[profile.release]
opt-level = "z"  # Optimisation taille
lto = true       # Link Time Optimization
codegen-units = 1
panic = "abort"
strip = true     # Retirer symboles debug
```

## 📚 Documentation

- [Tauri Docs](https://tauri.app/v1/guides/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [API Simbase](https://developer.simbase.com)

---

Besoin d'aide ? Consultez le README.md ou contactez le support Simbase.
