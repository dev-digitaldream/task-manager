# ⚡ Démarrage rapide - 2 minutes !

## 🎯 Objectif
Créer une app desktop **standalone** pour activer vos SIM Simbase en lot.

## 🚀 Étapes

### 1️⃣ Les icônes (IMPORTANT pour compiler)

Tauri a besoin d'icônes. Téléchargez le pack d'icônes par défaut :

```bash
cd simbase-app
npx @tauri-apps/cli icon src-tauri/icons/icon.png
```

**OU** créez des icônes basiques (si la commande ci-dessus échoue) :

```bash
# Sur macOS avec ImageMagick
brew install imagemagick
convert -size 512x512 xc:blue -fill white -gravity center -pointsize 200 -annotate +0+0 "SIM" src-tauri/icons/icon.png

# Générer tous les formats
npx @tauri-apps/cli icon src-tauri/icons/icon.png
```

### 2️⃣ Tester en mode dev

```bash
cd simbase-app
npm run dev
```

✨ L'app s'ouvre ! Testez avec votre clé API.

### 3️⃣ Compiler l'app

```bash
npm run build
```

**Résultat Mac** : `src-tauri/target/release/bundle/dmg/`  
**Résultat Windows** : `src-tauri/target/release/bundle/msi/`

## 🎉 C'est fini !

Vous avez maintenant :
- ✅ Une app **standalone** (double-clic pour lancer)
- ✅ **Pas besoin** de serveur proxy
- ✅ **Pas de CORS**
- ✅ Compatible **Mac et Windows**
- ✅ Seulement **~10 MB**

## 🆘 Problème ?

### "Icon file not found"

Vous devez créer les icônes :
```bash
# Méthode rapide : utiliser une icône par défaut de Tauri
curl -o src-tauri/icons/icon.png https://tauri.app/img/logo.png
npx @tauri-apps/cli icon src-tauri/icons/icon.png
```

### "Rust not found"

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Windows
# Téléchargez https://rustup.rs/
```

### Compilation trop longue ?

C'est normal la première fois (5-10 min). Les builds suivants sont rapides (30s-1min).

---

**Next** : Lisez `INSTALL.md` pour plus de détails et personnalisation.
