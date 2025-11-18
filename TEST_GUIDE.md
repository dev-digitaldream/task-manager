# Guide de Test - Nouvelles Fonctionnalités

## 🧪 Checklist de Test Local

### 1. Dark Mode ✅
- [ ] Ouvrir http://localhost:5173/app
- [ ] Click sur l'icône Soleil/Lune dans le header
- [ ] Vérifier le menu déroulant avec 3 options:
  - Light (Soleil)
  - Dark (Lune)
  - System (Écran)
- [ ] Tester chaque mode
- [ ] Vérifier que le choix est sauvegardé (refresh de la page)
- [ ] Vérifier que tous les composants sont bien stylés en dark mode

### 2. Intégrations (iCal/CalDAV) ✅
- [ ] Click sur l'icône Settings (engrenage) dans le header
- [ ] Vérifier que le modal s'ouvre (pas de page blanche!)
- [ ] Voir 3 sections:
  - iCal / CalDAV (bleu)
  - Apple Rappels (violet)
  - Google Calendar (gris, "Bientôt")
- [ ] Click sur "Exporter (.ics)" pour iCal
- [ ] Vérifier qu'un fichier .ics se télécharge
- [ ] Ouvrir le fichier avec Apple Calendar ou Google Calendar
- [ ] Vérifier que les tâches apparaissent comme des "To-Do" / "Rappels"
- [ ] Click sur "URL d'abonnement"
- [ ] Vérifier qu'une URL est copiée dans le presse-papier
- [ ] Tester l'abonnement dans Apple Calendar:
  - Fichier → Nouvel abonnement au calendrier
  - Coller l'URL
  - Les tâches doivent se synchroniser automatiquement

### 3. Calendrier Modal ✅
- [ ] Click sur l'icône Calendrier dans le header
- [ ] Vérifier que le modal s'ouvre
- [ ] Voir les 2 options:
  - Export unique (bleu)
  - Abonnement (violet)
- [ ] Tester les instructions pour:
  - Google Calendar
  - Apple Calendar
  - Outlook
- [ ] Fermer le modal avec le bouton X

### 4. Vue Kanban avec Drag & Drop 🎯
- [ ] Naviguer vers http://localhost:5173/kanban
- [ ] Vérifier que 3 colonnes s'affichent:
  - À faire (gris)
  - En cours (bleu)
  - Terminé (vert)
- [ ] Créer une nouvelle tâche avec le bouton "+ Nouvelle tâche"
- [ ] Vérifier qu'elle apparaît dans la colonne "À faire"
- [ ] Glisser-déposer la carte vers "En cours"
- [ ] Vérifier que:
  - L'animation est fluide
  - La colonne cible se highlight
  - Le statut de la tâche change
- [ ] Glisser vers "Terminé"
- [ ] Vérifier la barre de progression en bas qui se met à jour
- [ ] Tester les filtres:
  - Filtrer par priorité (Urgente)
  - Filtrer par assigné
- [ ] Au survol d'une carte, vérifier que:
  - La poignée de drag apparaît
  - Les boutons d'action apparaissent (commentaires, visibilité, supprimer)

### 5. Couleurs par Priorité 🎨
- [ ] Créer 4 tâches avec différentes priorités:
  - Basse → bordure grise
  - Moyenne → bordure jaune
  - Haute → bordure orange
  - Urgente → bordure rouge
- [ ] Vérifier dans la vue liste (/app)
- [ ] Vérifier dans la vue Kanban (/kanban)
- [ ] Vérifier que les badges de priorité ont la bonne couleur

### 6. Navigation entre vues
- [ ] Tester tous les liens:
  - `/dashboard` - Dashboard public
  - `/app` - Vue liste
  - `/kanban` - Vue Kanban
  - `/meeting` - Mode meeting
  - `/analytics` - Analytiques
- [ ] Vérifier que les données sont synchronisées
- [ ] Créer une tâche dans `/app`, vérifier qu'elle apparaît dans `/kanban`
- [ ] Changer le statut en drag&drop dans `/kanban`, vérifier dans `/app`

### 7. Traductions
- [ ] Click sur le sélecteur de langue
- [ ] Tester Français, English, Nederlands
- [ ] Vérifier que:
  - Les menus changent
  - Les labels de statut changent
  - Les tooltips changent
- [ ] Note: Certaines parties ne sont pas encore traduites (hard-codées)

### 8. Real-time Sync
- [ ] Ouvrir 2 onglets:
  - Onglet 1: `/app`
  - Onglet 2: `/kanban`
- [ ] Dans onglet 1, créer une tâche
- [ ] Vérifier qu'elle apparaît instantanément dans onglet 2
- [ ] Dans onglet 2, drag&drop vers "En cours"
- [ ] Vérifier que le statut change dans onglet 1
- [ ] Tester avec plusieurs navigateurs pour simuler plusieurs users

## 🖥️ Test de l'App Desktop (Electron)

⚠️ **Prérequis**: Installer Electron d'abord

```bash
npm install --save-dev electron electron-builder wait-on
```

### 1. Mode Développement
```bash
npm run electron:dev
```

- [ ] Vérifier que l'app se lance dans une fenêtre native
- [ ] Vérifier le menu personnalisé (en français)
- [ ] Tester les raccourcis clavier:
  - `Cmd/Ctrl + N` - Nouvelle tâche (devrait ouvrir le formulaire)
  - `Cmd/Ctrl + 1` - Vue Liste
  - `Cmd/Ctrl + 2` - Vue Kanban
  - `Cmd/Ctrl + 3` - Dashboard
  - `Cmd/Ctrl + W` - Fermer fenêtre
- [ ] Fermer la fenêtre (macOS: devrait rester en arrière-plan)
- [ ] Click sur l'icône dans le systray pour rouvrir
- [ ] Menu systray:
  - Afficher
  - Nouvelle tâche
  - Quitter

### 2. Build Production (macOS)
```bash
npm run electron:build:mac
```

- [ ] Vérifier que le dossier `dist-electron/` est créé
- [ ] Ouvrir le fichier .dmg
- [ ] Glisser l'app dans Applications
- [ ] Lancer l'app depuis Applications
- [ ] Vérifier que tout fonctionne sans serveur de dev

### 3. Build Production (Windows)
```bash
npm run electron:build:win
```

- [ ] Vérifier le fichier .exe dans `dist-electron/`
- [ ] Lancer l'installeur
- [ ] Vérifier l'icône dans la zone de notification
- [ ] Tester les raccourcis

## 🔍 Tests de Régression

Vérifier que les fonctionnalités existantes marchent toujours:

- [ ] Création de tâche
- [ ] Modification de tâche
- [ ] Suppression de tâche
- [ ] Ajout de commentaires
- [ ] Assignation à un user
- [ ] Changement de statut
- [ ] Changement de priorité
- [ ] Date d'échéance
- [ ] Visibilité publique/privée
- [ ] Upload de fichiers
- [ ] Historique des modifications
- [ ] Notifications email
- [ ] Tâches récurrentes

## 🐛 Bugs Connus à Tester

### Fixés (à valider):
- [x] Dark mode ne fonctionnait pas
- [x] Page blanche sur intégrations
- [x] Icône calendrier sans effet
- [x] Pas d'export calendrier
- [x] Pas de couleurs par priorité

### À surveiller:
- [ ] Performance du drag&drop avec beaucoup de tâches (>100)
- [ ] Synchronisation temps réel si perte de connexion
- [ ] Export iCal avec caractères spéciaux dans les titres
- [ ] Electron: fermeture du serveur backend au quit

## 📊 Critères de Succès

### Minimum Viable (MVP)
- ✅ Dark mode fonctionne
- ✅ Intégrations s'ouvrent sans crash
- ✅ Export iCal télécharge un fichier valide
- ✅ Drag & drop fonctionne dans Kanban
- ✅ Couleurs par priorité visibles

### Optimal
- ✅ Toutes les fonctionnalités ci-dessus
- ✅ Synchronisation temps réel stable
- ✅ Electron build réussit
- ✅ Traductions complètes
- ✅ Performance fluide (<100ms pour drag&drop)

## 🚦 Statut Global

| Fonctionnalité | Status | Notes |
|---------------|--------|-------|
| Dark Mode | ✅ READY | Testé et fonctionnel |
| Intégrations iCal | ✅ READY | API créé, à tester avec vraies apps |
| Calendrier Modal | ✅ READY | Interface simplifiée |
| Vue Kanban | ✅ READY | Drag & drop avec @dnd-kit |
| Couleurs Priorité | ✅ READY | Bordures colorées |
| App Electron | ⚠️ SETUP | Code créé, à tester |
| Traductions | ⚠️ PARTIAL | Certains labels hard-codés |
| Admin Users | ❌ TODO | Pas encore implémenté |

## 🎯 Prochains Tests Recommandés

1. **Test de charge**: Créer 100+ tâches et tester performance
2. **Test multi-user**: 5 users simultanés en temps réel
3. **Test offline**: Déconnecter internet, vérifier la gestion
4. **Test mobile**: Responsive design sur iPhone/Android
5. **Test accessibilité**: Navigation au clavier, screen readers
6. **Test sécurité**: SQL injection, XSS, CSRF

## 📝 Rapporter un Bug

Format:
```
**Titre**: Description courte du bug
**Étapes**: Comment reproduire
**Attendu**: Ce qui devrait se passer
**Observé**: Ce qui se passe réellement
**Environnement**: Browser/OS/Version
**Screenshots**: Si applicable
```
