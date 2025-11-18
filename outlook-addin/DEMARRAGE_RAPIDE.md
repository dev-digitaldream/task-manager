# 🚀 Démarrage Rapide - Test Local de l'Add-on Outlook

## 📋 Méthode Simple (5 minutes)

### Étape 1 : Démarrer le Serveur

```bash
# Terminal 1 : Backend
cd /Volumes/ExtremeSSD/projetcs/kanban/server
npm run dev

# ✅ Serveur démarre sur http://localhost:3001
```

### Étape 2 : Vérifier que tout fonctionne

```bash
# Dans un nouveau terminal
cd /Volumes/ExtremeSSD/projetcs/kanban/outlook-addin
./quick-test.sh

# ✅ Doit afficher tous les checks en vert
```

### Étape 3 : Installer sur Outlook Web

1. **Ouvrez** : https://outlook.office.com
2. **Connectez-vous** avec votre compte Microsoft
3. **Cliquez** sur ⚙️ (Settings) en haut à droite
4. **Cliquez** sur "View all Outlook settings"
5. **Allez** à : General → Manage add-ins
6. **Cliquez** sur "+ My add-ins"
7. **Choisissez** "Add a custom add-in" → "Add from URL"
8. **Entrez** :
   ```
   https://task-manager.digitaldream.work/outlook/manifest.json
   ```
9. **Cliquez** "Install"

### Étape 4 : Tester

1. **Ouvrez** n'importe quel email dans Outlook
2. **Cherchez** le bouton "Create Task" dans le ruban (onglet Home)
3. **Cliquez** sur "Create Task"
4. Le panneau latéral s'ouvre avec le formulaire
5. **Remplissez** le formulaire et créez une tâche
6. **Vérifiez** le message de succès ✅

---

## 🐛 Si ça ne fonctionne pas

### Le bouton n'apparaît pas

```bash
# 1. Rafraîchir Outlook
Ctrl+F5 (ou Cmd+Shift+R sur Mac)

# 2. Vérifier l'installation
Settings → Manage add-ins → Vérifier que "Task Manager" est dans la liste

# 3. Réinstaller
Supprimer l'add-in et recommencer l'étape 3
```

### Erreur "Cannot load taskpane"

```bash
# Vérifier que le serveur tourne
curl http://localhost:3001/health

# Si erreur, redémarrer le serveur
cd server
npm run dev
```

### La liste des utilisateurs est vide

```bash
# Créer des utilisateurs de test
cd server
npm run db:seed
```

### Erreur CORS

**Console (F12) montre** : `Access-Control-Allow-Origin`

**Solution** : Les domaines Outlook sont déjà configurés, mais vérifiez :
```bash
# Redémarrer le serveur
cd server
npm run dev
```

---

## 🔍 Déboguer

### Ouvrir la Console Developer

1. **Avec l'add-in ouvert** dans Outlook Web
2. **Appuyez** sur F12
3. **Allez** dans l'onglet Console
4. **Cherchez** les erreurs en rouge

### Logs utiles

```bash
# Logs serveur
cd server
npm run dev
# Les logs API apparaissent ici

# Test API manuel
curl http://localhost:3001/api/users
curl http://localhost:3001/api/tasks
```

---

## 📱 Alternatives de Test

### Option A : Serveur de Production (Recommandé)

**Avantage** : Pas besoin de serveur local

```
URL du manifeste : https://task-manager.digitaldream.work/outlook/manifest.json
```

Suivez les mêmes étapes 3-4 ci-dessus.

### Option B : Localhost (Pour développement)

**Avantage** : Tester les modifications en temps réel

1. Utilisez `manifest-dev.json` au lieu de `manifest.json`
2. URL : `http://localhost:3001/outlook/manifest-dev.json`

⚠️ **Note** : Outlook Web peut bloquer HTTP. Utilisez HTTPS (voir GUIDE_TEST_LOCAL.md)

---

## ✅ Checklist de Test

Testez ces fonctionnalités :

- [ ] Add-in s'installe sans erreur
- [ ] Bouton "Create Task" visible dans le ruban
- [ ] Taskpane s'ouvre au clic
- [ ] Email subject → pré-remplit le titre
- [ ] Liste des utilisateurs se charge
- [ ] Sélection de priorité fonctionne
- [ ] Sélection de date fonctionne
- [ ] Création de tâche fonctionne
- [ ] Message de succès apparaît
- [ ] Formulaire se réinitialise après succès

---

## 🎥 Vidéo de Test (à créer pour screenshots)

Quand vous testez, **capturez ces étapes** pour vos screenshots :

1. **Screenshot 1** : Outlook avec email ouvert + bouton "Create Task" visible
2. **Screenshot 2** : Taskpane ouvert avec formulaire rempli
3. **Screenshot 3** : Message de succès après création
4. **Screenshot 4** : Dashboard montrant la tâche créée

**Outil** : Cmd+Shift+4 (Mac) ou Snipping Tool (Windows)
**Résolution** : 1280x720px minimum

---

## 📚 Documentation Complète

Pour plus de détails :
- **GUIDE_TEST_LOCAL.md** : Guide complet de test (HTTPS, Desktop, etc.)
- **GUIDE_SOUMISSION_APPSOURCE.md** : Soumission sur AppSource
- **CONFORMITE_MICROSOFT.md** : Conformité Microsoft 365

---

## 🚀 Prêt à Soumettre ?

Une fois les tests passés :

1. ✅ Créer 3-5 screenshots
2. ✅ Créer compte Partner Center
3. ✅ Soumettre sur AppSource
4. ✅ Attendre validation (7-14 jours)

**Guide complet** : `GUIDE_SOUMISSION_APPSOURCE.md`

---

**Bon test ! 🎯**
