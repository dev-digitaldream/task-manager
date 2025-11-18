# 📝 Widget Desktop - Guide d'utilisation

## Installation

### Prérequis
- Node.js installé
- Rust et Cargo installés (https://rustup.rs)

### Build de l'application desktop

```bash
# 1. Installer les dépendances
npm install

# 2. Installer Tauri CLI (si pas déjà fait)
cargo install tauri-cli --version ^2.0.0

# 3. Lancer en mode développement
npm run tauri dev

# 4. Créer l'installeur pour production
npm run tauri build
```

## Fonctionnalités du Widget

### Fenêtre Principale
- Application complète Task Manager
- Taille: 1400x900px
- Toutes les fonctionnalités web

### Widget de Bureau
- Petite fenêtre flottante (350x500px)
- **Toujours au premier plan** (always on top)
- Affiche vos tâches en cours
- Synchronisation temps réel
- Code couleur par priorité:
  - 🔴 Rouge = Urgent
  - 🟠 Orange = Haute
  - 🟡 Jaune = Moyenne
  - ⚪ Gris = Basse

## Utilisation

1. **Première utilisation**:
   - Connectez-vous dans la fenêtre principale
   - Vos identifiants sont sauvegardés localement
   - Le widget affiche automatiquement vos tâches

2. **Widget toujours visible**:
   - Le widget reste au-dessus des autres fenêtres
   - Parfait pour suivre vos tâches pendant que vous travaillez
   - Mise à jour en temps réel quand vous modifiez des tâches

3. **Tâches affichées**:
   - Maximum 10 tâches
   - Seulement vos tâches assignées
   - Exclut les tâches terminées
   - Alerte rouge pour les tâches en retard ⚠️

## Build pour Distribution

### macOS (.dmg)
```bash
npm run tauri build -- --target universal-apple-darwin
```

### Windows (.msi)
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

## Fichiers générés

- **macOS**: `src-tauri/target/release/bundle/dmg/Task Manager_1.0.0.dmg`
- **Windows**: `src-tauri/target/release/bundle/msi/Task Manager_1.0.0.msi`

## Raccourcis Clavier (à venir)

- `Cmd/Ctrl + W` - Basculer le widget
- `Cmd/Ctrl + R` - Rafraîchir les tâches
- `Cmd/Ctrl + Q` - Quitter l'application

## Support

Toute nouvelle tâche créée dans l'app web ou desktop se synchronise automatiquement avec le widget !
