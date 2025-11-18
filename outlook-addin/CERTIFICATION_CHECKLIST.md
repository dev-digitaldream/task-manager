# Checklist de Certification Microsoft 365

## ✅ Exigences Microsoft 365 - Statut Actuel

### 1. Manifeste ✅ FAIT
- [x] Format JSON Unified Manifest présent
- [x] Format XML pour compatibilité legacy
- [x] ID unique valide
- [x] Version correcte
- [x] Permissions appropriées (MailboxItem.Read.User)

### 2. Hébergement & Sécurité ⚠️ À CORRIGER
- [ ] **CRITIQUE**: HTTPS requis sur domaine de production
- [ ] **CRITIQUE**: Configuration CORS pour domaines Outlook
- [ ] **CRITIQUE**: Content Security Policy (CSP) doit autoriser iframe
- [ ] Certificat SSL valide
- [ ] Support HTTPS uniquement (pas de HTTP)

### 3. Icônes 🔴 MANQUANT
- [ ] **REQUIS**: icon-16.png (16x16px)
- [ ] **REQUIS**: icon-32.png (32x32px)
- [ ] **REQUIS**: icon-64.png (64x64px)
- [ ] **REQUIS**: icon-128.png (128x128px)
- [ ] Format PNG avec transparence
- [ ] Conformes aux guidelines Microsoft

### 4. Pages Légales 🔴 MANQUANT
- [ ] **REQUIS**: Privacy Policy (URL publique)
- [ ] **REQUIS**: Terms of Use (URL publique)
- [ ] **REQUIS**: Support page (URL publique)
- [ ] Contact information

### 5. Fonctionnalité & UX ✅ FAIT
- [x] Interface responsive
- [x] Gestion d'erreurs
- [x] Messages de feedback utilisateur
- [x] Design cohérent avec Outlook
- [x] Pas de stockage de données sensibles

### 6. Testing & Validation ⚠️ À FAIRE
- [ ] Test sur Outlook Web
- [ ] Test sur Outlook Desktop (Windows)
- [ ] Test sur Outlook Desktop (Mac)
- [ ] Test sur différents navigateurs
- [ ] Validation du manifeste avec Office Add-in Validator

### 7. Documentation Marketing ⚠️ À PRÉPARER
- [ ] Description courte (80 caractères max)
- [ ] Description longue (4000 caractères max)
- [ ] Screenshots (minimum 3, recommandé 5)
- [ ] Vidéo démo (optionnelle mais recommandée)
- [ ] Logo application (haute résolution)

### 8. Compte & Publication ⚠️ À CRÉER
- [ ] Compte Microsoft Partner Center
- [ ] Enregistrement en tant que Publisher
- [ ] Seller ID configuré
- [ ] Informations bancaires (si payant)

---

## 🔧 Correctifs Prioritaires

### PRIORITÉ 1 - Sécurité & CORS

**Problème**: La configuration CORS actuelle ne permet pas les domaines Outlook.

**Fichier**: `server/src/middleware/security.js`

**Solution**: Ajouter les domaines Outlook aux origines autorisées:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://outlook.office.com',
  'https://outlook.office365.com',
  'https://outlook.live.com',
  'https://task-manager.digitaldream.work'
];
```

### PRIORITÉ 1 - Content Security Policy

**Problème**: `frameSrc: ["'none'"]` empêche l'add-in de fonctionner.

**Fichier**: `server/src/middleware/security.js`

**Solution**: Modifier la CSP:
```javascript
frameSrc: ["'self'", "https://outlook.office.com", "https://outlook.office365.com"],
frameAncestors: ["https://outlook.office.com", "https://outlook.office365.com", "https://outlook.live.com"],
```

### PRIORITÉ 1 - Icônes

**Créer**: 4 icônes PNG (16x16, 32x32, 64x64, 128x128)
**Emplacement**: `/outlook-addin/icon-*.png`
**Design**: Logo simple, fond transparent, reconnaissable en petit format

### PRIORITÉ 2 - Pages Légales

**Créer**:
- `/server/public/privacy.html` - Privacy Policy
- `/server/public/terms.html` - Terms of Use
- `/server/public/support.html` - Page de support

**URLs à mettre à jour dans le manifeste**:
- Privacy: https://task-manager.digitaldream.work/privacy
- Terms: https://task-manager.digitaldream.work/terms
- Support: https://task-manager.digitaldream.work/support

---

## 📋 Process de Certification Microsoft

### Étape 1: Partner Center
1. Créer compte: https://partner.microsoft.com/dashboard
2. S'inscrire au programme développeur
3. Accepter les termes du Microsoft Publisher Agreement

### Étape 2: Préparer la Soumission
1. Valider le manifeste: `npx office-addin-manifest validate manifest.json`
2. Tester sur plusieurs plateformes
3. Capturer screenshots (1280x720px recommandé)
4. Créer vidéo démo (optionnel, 60-90 secondes)

### Étape 3: Soumettre sur AppSource
1. Partner Center → Office Store → New Submission
2. Remplir tous les champs requis:
   - Product name
   - Version
   - App package (upload manifest.json)
   - Descriptions (EN + FR recommandé)
   - Screenshots
   - Support details
   - Notes for certification

### Étape 4: Validation Microsoft (7-14 jours)
- Vérification technique automatique
- Revue manuelle par l'équipe Microsoft
- Tests de sécurité et conformité
- Vérification des policies

### Étape 5: Réponse aux Retours
- Microsoft peut demander des modifications
- Répondre sous 7 jours pour éviter l'annulation
- Re-soumettre après corrections

### Étape 6: Publication
- Approbation finale
- Délai de publication: 1-3 jours
- Disponible sur AppSource

---

## 🎯 Prochaines Actions Recommandées

1. **Immédiat**: Corriger CORS + CSP pour permettre le fonctionnement
2. **Court terme**: Créer les icônes et pages légales
3. **Moyen terme**: Préparer les assets marketing
4. **Long terme**: Créer compte Partner Center et soumettre

---

## 📚 Ressources Utiles

- [Office Add-ins Validation Policy](https://docs.microsoft.com/office/dev/store/validation-policies)
- [Partner Center Dashboard](https://partner.microsoft.com/dashboard)
- [AppSource Submission Guide](https://docs.microsoft.com/office/dev/store/submit-to-appsource-via-partner-center)
- [Manifest Validator](https://github.com/OfficeDev/office-addin-manifest)
- [Design Guidelines](https://docs.microsoft.com/office/dev/add-ins/design/add-in-design)

---

**Dernière mise à jour**: 2025-11-18
**Statut global**: 🔴 Corrections requises avant certification
