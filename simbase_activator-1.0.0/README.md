# 🚀 Simbase Activator - Application Desktop

Application Tauri pour la gestion en lot de cartes SIM Simbase.
Compatible **macOS** et **Windows**.

## ✨ Avantages de l'app desktop

- ✅ **Standalone** : Double-clic pour lancer, pas de serveur requis
- ✅ **Pas de CORS** : Backend Rust fait les appels API
- ✅ **Léger** : ~10 MB (vs 100+ MB pour Electron)
- ✅ **Rapide** : Performance native
- ✅ **Sécurisé** : Clé API jamais exposée
- ✅ **Cross-platform** : Mac et Windows

## 📦 Prérequis

### macOS
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Installer Node.js (si non installé)
brew install node
```

### Windows
1. Installer [Rust](https://www.rust-lang.org/tools/install)
2. Installer [Node.js](https://nodejs.org/)
3. Installer [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)

## 🛠️ Installation

```bash
cd simbase-app
npm install
```

## 🚀 Développement

Lancer en mode développement :

```bash
npm run dev
```

## 📦 Build

### macOS (Apple Silicon & Intel)
```bash
npm run build:mac
```

Résultat : `src-tauri/target/release/bundle/dmg/`

### Windows
```bash
npm run build:windows
```

Résultat : `src-tauri/target/release/bundle/msi/`

### Build universel
```bash
npm run build
```

## 📂 Structure

```
simbase-app/
├── src/                    # Frontend (HTML/JS)
│   └── index.html
├── src-tauri/              # Backend Rust
│   ├── src/
│   │   └── main.rs        # Commandes Tauri
│   ├── Cargo.toml         # Dépendances Rust
│   └── tauri.conf.json    # Configuration Tauri
└── package.json
```

## 🎯 Fonctionnalités

1. **Vérification automatique** du statut de chaque SIM
2. **Activation intelligente** (uniquement si `state = "disabled"`)
3. **Renommage** des SIM (même déjà activées)
4. **Validation ICCID** (format 19-20 chiffres)
5. **Export CSV** des résultats
6. **Interface native** macOS/Windows

## 🔐 Sécurité

- La clé API est stockée uniquement en mémoire
- Appels API faits via le backend Rust (pas de CORS)
- Aucune donnée envoyée à des serveurs tiers
- Communication sécurisée avec l'API Simbase

## 📋 Format CSV

```csv
iccid,device_name
8944538532071068732,Capteur A1
8944538532071042174,Dispositif B2
```

## 🆘 Support

- Documentation API : https://developer.simbase.com
- Issues : Contactez support@simbase.io

---

**Version** : 1.0.0  
**Framework** : Tauri v1.5  
**Backend** : Rust  
**Frontend** : HTML/JavaScript
