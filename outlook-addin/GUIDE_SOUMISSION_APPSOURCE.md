# 📤 Guide de Soumission AppSource - Task Manager Outlook Add-in

## ✅ Statut de Préparation

**Votre add-on est prêt pour la soumission !**

Tous les critères techniques Microsoft sont remplis :
- ✅ Manifeste JSON Unified valide avec GUID unique
- ✅ Icônes PNG (16, 32, 64, 128px) créées
- ✅ HTTPS avec TLS 1.3 activé
- ✅ Privacy Policy conforme GDPR
- ✅ Terms of Use complets
- ✅ Support page disponible
- ✅ CORS configuré pour Outlook
- ✅ CSP compatible avec embedding
- ✅ Aucun credential hardcodé
- ✅ Office.js depuis CDN Microsoft

---

## 📋 Étape 1 : Préparation des Assets Marketing

### 1.1 Captures d'Écran (REQUIS)

**Exigences Microsoft** :
- Minimum : 3 screenshots
- Recommandé : 5 screenshots
- Résolution : 1280x720px (ou 1366x768px)
- Format : PNG ou JPG
- Taille max : 1024 KB par image

**Screenshots à créer** :

1. **Screenshot 1 : Vue d'ensemble de l'add-in**
   - Outlook avec l'add-in ouvert dans le panneau latéral
   - Montrer l'email et le formulaire de création de tâche
   - Annoter les fonctionnalités principales

2. **Screenshot 2 : Création de tâche**
   - Formulaire rempli avec toutes les options
   - Montrer la sélection d'utilisateur
   - Afficher les priorités et dates d'échéance

3. **Screenshot 3 : Confirmation de succès**
   - Message de succès après création
   - Montrer l'intégration avec le dashboard

4. **Screenshot 4 : Dashboard des tâches** (optionnel)
   - Vue du dashboard principal
   - Montrer les tâches créées depuis Outlook

5. **Screenshot 5 : Multi-plateforme** (optionnel)
   - Montrer l'add-in sur différentes plateformes
   - Outlook Web + Outlook Desktop

**Outil recommandé** :
```bash
# Utiliser l'outil de capture intégré ou:
# - Snagit
# - ShareX
# - macOS: Cmd+Shift+4
# - Windows: Snipping Tool
```

### 1.2 Logo Application

**Exigences** :
- Taille : 300x300px minimum (512x512px recommandé)
- Format : PNG avec transparence
- Haute résolution
- Reconnaissable même en petit format

**Logo actuel** : Utilisez `icon-128.png` comme base, ou créez une version haute résolution.

### 1.3 Descriptions

#### Description Courte (Français)
*Max 80 caractères*
```
Créez des tâches directement depuis vos emails Outlook
```

#### Description Courte (Anglais)
*Max 80 caractères - RECOMMANDÉ pour reach international*
```
Create tasks directly from your Outlook emails
```

#### Description Longue (Français)
*Max 4000 caractères*
```markdown
# Task Manager pour Outlook

Transformez vos emails en tâches exploitables en un seul clic !

## 🎯 Fonctionnalités Principales

**Création rapide de tâches**
• Convertissez n'importe quel email en tâche en quelques secondes
• Le sujet de l'email devient automatiquement le titre de la tâche
• Ajoutez le corps de l'email comme note pour garder le contexte

**Gestion collaborative**
• Assignez des tâches aux membres de votre équipe (jusqu'à 5 utilisateurs)
• Définissez des priorités (Basse, Moyenne, Haute, Urgente)
• Configurez des dates d'échéance pour ne rien oublier

**Interface intuitive**
• Design moderne et épuré intégré à Outlook
• Feedback visuel immédiat (succès/erreur)
• Aucune interruption de votre flux de travail

**Synchronisation en temps réel**
• Les tâches créées apparaissent instantanément sur le dashboard
• Collaboration en temps réel avec votre équipe
• Notifications pour rester informé

## 💼 Cas d'Usage

✅ Convertir une demande client en tâche actionnable
✅ Créer des rappels à partir d'emails importants
✅ Déléguer des tâches aux membres de l'équipe
✅ Suivre les demandes reçues par email
✅ Gérer les projets depuis votre boîte de réception

## 🔒 Sécurité et Confidentialité

• Chiffrement HTTPS pour toutes les communications
• Aucun stockage de vos emails complets
• Permissions minimales (lecture de l'email en cours uniquement)
• Conforme GDPR
• Aucune publicité, aucun tracking

## 📱 Compatibilité

• Outlook Web (tous navigateurs modernes)
• Outlook Desktop (Windows & Mac)
• Office 365

## 🚀 Démarrage Rapide

1. Installez l'add-in depuis AppSource
2. Ouvrez un email dans Outlook
3. Cliquez sur "Créer une tâche" dans le ruban
4. Remplissez le formulaire et validez
5. La tâche est créée et visible sur votre dashboard !

## 💡 Support

Notre équipe support est disponible pour vous aider :
• Documentation complète disponible
• Support par email sous 24h
• Mises à jour régulières gratuites

Simplifiez votre gestion de tâches dès aujourd'hui avec Task Manager !
```

#### Description Longue (Anglais)
```markdown
# Task Manager for Outlook

Transform your emails into actionable tasks with a single click!

## 🎯 Key Features

**Quick Task Creation**
• Convert any email into a task in seconds
• Email subject automatically becomes the task title
• Add email body as notes to keep context

**Team Collaboration**
• Assign tasks to team members (up to 5 users)
• Set priorities (Low, Medium, High, Urgent)
• Configure due dates to stay on track

**Intuitive Interface**
• Modern, clean design integrated with Outlook
• Immediate visual feedback (success/error)
• No interruption to your workflow

**Real-time Sync**
• Created tasks appear instantly on the dashboard
• Real-time collaboration with your team
• Notifications to keep you informed

## 💼 Use Cases

✅ Convert customer requests into actionable tasks
✅ Create reminders from important emails
✅ Delegate tasks to team members
✅ Track email-based requests
✅ Manage projects from your inbox

## 🔒 Security & Privacy

• HTTPS encryption for all communications
• No storage of full email content
• Minimal permissions (read current email only)
• GDPR compliant
• No ads, no tracking

## 📱 Compatibility

• Outlook Web (all modern browsers)
• Outlook Desktop (Windows & Mac)
• Office 365

## 🚀 Quick Start

1. Install the add-in from AppSource
2. Open an email in Outlook
3. Click "Create Task" in the ribbon
4. Fill the form and submit
5. Task is created and visible on your dashboard!

## 💡 Support

Our support team is here to help:
• Complete documentation available
• Email support within 24h
• Free regular updates

Simplify your task management today with Task Manager!
```

### 1.4 Vidéo de Démonstration (Optionnel mais Recommandé)

**Exigences** :
- Durée : 60-90 secondes
- Format : MP4, MOV
- Résolution : 1280x720px minimum
- Taille : < 50 MB
- Pas de son obligatoire (sous-titres recommandés)

**Script suggéré** :
```
0:00-0:10 - Montrer Outlook avec plusieurs emails
0:10-0:20 - Ouvrir un email, cliquer sur "Create Task"
0:20-0:40 - Remplir le formulaire (titre, priorité, assignee)
0:40-0:50 - Cliquer "Créer" et montrer le succès
0:50-1:00 - Montrer la tâche sur le dashboard
1:00-1:10 - Outro avec logo et URL
```

**Outils** :
- OBS Studio (gratuit)
- Camtasia (payant)
- Loom (en ligne)

---

## 📝 Étape 2 : Créer un Compte Microsoft Partner Center

### 2.1 Inscription

1. Allez sur : https://partner.microsoft.com/dashboard
2. Cliquez sur **"Join now"** (ou **"S'inscrire"**)
3. Connectez-vous avec un compte Microsoft (Outlook/Live)
4. Complétez le profil de votre organisation

### 2.2 Informations Requises

**Informations Entreprise** :
- Nom de l'entreprise : `Digital Dream` (ou votre nom)
- Type : Individual / Company
- Adresse complète
- Téléphone de contact
- Email de contact : `support@digitaldream.work`

**Informations Fiscales** (si payant) :
- Numéro de TVA (si applicable)
- Informations bancaires
- Type de vente (gratuit/payant/freemium)

**Publisher Display Name** :
- Ce nom apparaîtra sur AppSource
- Exemple : "Digital Dream" ou "Task Manager Team"
- ⚠️ Doit être unique (sera vérifié par Microsoft)

### 2.3 Vérification du Publisher

Microsoft peut demander une **Publisher Verification** :
- Document d'identité du représentant légal
- Preuve d'existence de l'entreprise (KBIS, etc.)
- Vérification du domaine email (digitaldream.work)

Délai : 3-7 jours ouvrés

---

## 📤 Étape 3 : Soumettre l'Add-in

### 3.1 Créer une Nouvelle Soumission

1. **Partner Center** → **Office Store** → **Overview**
2. Cliquez sur **"Create a new"** → **"Outlook add-in"**
3. Sélectionnez **"JSON Unified Manifest"**

### 3.2 Remplir le Formulaire de Soumission

#### Onglet "Product setup"

**Product name** :
- EN: `Task Manager - Create Tasks from Emails`
- FR: `Task Manager - Créer des Tâches depuis les Emails`

**App type** :
- ☑️ Outlook add-in
- Platforms: Web, Desktop (Windows), Desktop (Mac)

**Support languages** :
- ☑️ English (United States)
- ☑️ French (France)

#### Onglet "Properties"

**Category** :
- Primary: `Productivity`
- Secondary: `Project management` ou `Collaboration`

**App logo** :
- Upload : `icon-128.png` (ou version 300x300px)

**Screenshots** :
- Upload les 3-5 screenshots créés
- Ajoutez des légendes descriptives

**Video URL** (optionnel) :
- YouTube ou Vimeo URL de votre démo

**Support details** :
- Support URL: `https://task-manager.digitaldream.work/support.html`
- Support email: `support@digitaldream.work`

**Privacy policy** :
- URL: `https://task-manager.digitaldream.work/privacy.html`

**Terms of use** :
- URL: `https://task-manager.digitaldream.work/terms.html`

#### Onglet "Store listings"

**Description courte** :
- FR: `Créez des tâches directement depuis vos emails Outlook`
- EN: `Create tasks directly from your Outlook emails`

**Description longue** :
- Copier-coller les descriptions préparées ci-dessus

**Search keywords** (5 max) :
```
task management, email to task, productivity, collaboration, outlook tasks
```

**App Screenshots** :
- Upload screenshots avec légendes

#### Onglet "Availability"

**Markets** :
- Sélectionnez tous les pays (ou limitez si nécessaire)

**Pricing** :
- ☑️ Free (gratuit)
- Ou configurez un modèle payant si souhaité

**Organizational licensing** :
- ☑️ Make my product available (si vous voulez permettre le déploiement centralisé)

#### Onglet "App package"

**Manifest file** :
- Upload : `/outlook-addin/manifest.json`

Le système va automatiquement valider le manifeste.

**Test notes for certification** :
```
Test Account Information:
- URL: https://task-manager.digitaldream.work
- The add-in works with any Outlook account
- No authentication required to test basic functionality
- Simply open any email and click "Create Task" in the ribbon

Testing Steps:
1. Install the add-in from URL
2. Open any email in Outlook
3. Click "Create Task" button in the ribbon
4. Fill the form (title, priority, assignee, etc.)
5. Click "Create Task" button
6. Verify success message

Known Issues: None

Additional Notes:
- HTTPS enabled with valid TLS 1.3 certificate
- CORS configured for all Outlook domains
- Privacy Policy: https://task-manager.digitaldream.work/privacy.html
- Support: https://task-manager.digitaldream.work/support.html
```

#### Onglet "Review and publish"

1. **Vérifiez** toutes les informations
2. Cliquez **"Submit for review"**
3. Acceptez les termes et conditions

---

## ⏰ Étape 4 : Validation Microsoft (7-14 jours)

### 4.1 Processus de Validation

Microsoft va effectuer :

**Validation Automatique** (1-2 jours) :
- ✅ Manifeste JSON valide
- ✅ Toutes les URLs accessibles en HTTPS
- ✅ Icônes présentes et correctes
- ✅ Privacy policy et Terms accessible

**Validation Manuelle** (5-10 jours) :
- ✅ Test fonctionnel de l'add-in
- ✅ Vérification UX et design
- ✅ Test sur différentes plateformes
- ✅ Vérification sécurité
- ✅ Conformité aux policies

### 4.2 Statuts Possibles

**In Review** : Validation en cours
**Action Required** : Microsoft demande des modifications
**Approved** : Approuvé, en cours de publication
**Published** : Disponible sur AppSource !

### 4.3 Si Modifications Requises

Microsoft peut demander :
- Corrections de texte (fautes, clarifications)
- Modifications d'screenshots
- Corrections fonctionnelles mineures
- Clarifications sur la privacy policy

**⚠️ Important** :
- Répondez sous **7 jours** sinon la soumission est annulée
- Utilisez le portail Partner Center pour communiquer
- Soyez précis et professionnel dans vos réponses

---

## 🎉 Étape 5 : Publication (1-3 jours après approbation)

Une fois approuvé :
1. Status passe à **"Publishing"**
2. L'add-in apparaît sur AppSource dans 1-3 jours
3. Vous recevez un email de confirmation

**URL AppSource** :
```
https://appsource.microsoft.com/product/office/[votre-product-id]
```

---

## 📊 Étape 6 : Post-Publication

### 6.1 Monitoring

**Partner Center Dashboard** :
- Consultez les statistiques d'installation
- Consultez les avis utilisateurs
- Surveillez les ratings

**Support** :
- Répondez aux avis (bons et mauvais)
- Gérez les tickets support via email

### 6.2 Mises à Jour

Pour publier une nouvelle version :
1. Mettez à jour `version` dans manifest.json (ex: 1.0.0 → 1.1.0)
2. Partner Center → Votre add-in → **"Update"**
3. Upload nouveau manifest
4. Décrivez les changements
5. Resoumettez pour validation (plus rapide : 2-5 jours)

### 6.3 Marketing

**Promouvoir votre add-in** :
- Ajoutez un badge "Available on AppSource" sur votre site
- Partagez sur les réseaux sociaux
- Écrivez un article de blog
- Contactez des sites tech pour une review

---

## ✅ Checklist Finale Avant Soumission

Avant de cliquer "Submit", vérifiez :

### Technique
- [ ] manifest.json avec GUID unique
- [ ] manifest.json version correcte (1.0.0)
- [ ] Toutes les icônes PNG présentes (16,32,64,128)
- [ ] taskpane.html accessible via HTTPS
- [ ] Office.js chargé depuis CDN Microsoft
- [ ] API backend fonctionnelle et en HTTPS
- [ ] Certificat SSL valide (TLS 1.2+)

### Légal et Documentation
- [ ] Privacy Policy publiée et accessible
- [ ] Terms of Use publiés et accessibles
- [ ] Support page publiée et accessible
- [ ] Contact email fonctionnel

### Marketing
- [ ] 3-5 screenshots haute qualité
- [ ] Logo 300x300px minimum
- [ ] Description courte (<80 caractères)
- [ ] Description longue complète
- [ ] Vidéo démo (optionnel mais recommandé)

### Partner Center
- [ ] Compte créé et vérifié
- [ ] Publisher display name défini
- [ ] Support email configuré
- [ ] Informations entreprise complètes

### Tests
- [ ] Testé sur Outlook Web (Chrome, Edge)
- [ ] Testé sur Outlook Desktop Windows (si possible)
- [ ] Testé sur Outlook Desktop Mac (si possible)
- [ ] Vérification de toutes les fonctionnalités
- [ ] Pas d'erreurs dans la console navigateur

---

## 🆘 Troubleshooting Commun

### "Manifest validation failed"
→ Vérifiez que toutes les URLs sont en HTTPS
→ Vérifiez la syntaxe JSON (pas de virgule finale)
→ Utilisez un validateur JSON en ligne

### "Privacy policy not accessible"
→ Testez l'URL dans un navigateur privé
→ Vérifiez qu'il n'y a pas de redirection
→ Assurez-vous que la page est publique (pas d'auth)

### "Icon size incorrect"
→ Les icônes doivent être EXACTEMENT 16x16, 32x32, 64x64, 128x128
→ Utilisez PNG, pas JPG
→ Vérifiez avec `file icon-16.png`

### "Add-in doesn't work in test"
→ Vérifiez CORS sur votre serveur
→ Testez l'API avec Postman/curl
→ Vérifiez la console navigateur (F12)

---

## 📚 Ressources Utiles

### Documentation Microsoft
- [AppSource Submission Guide](https://docs.microsoft.com/office/dev/store/submit-to-appsource-via-partner-center)
- [Validation Policies](https://docs.microsoft.com/office/dev/store/validation-policies)
- [Partner Center](https://partner.microsoft.com/dashboard)

### Outils
- [JSON Validator](https://jsonlint.com/)
- [SSL Test](https://www.ssllabs.com/ssltest/)
- [Image Resize](https://www.iloveimg.com/resize-image)
- [Screenshot Annotation](https://www.canva.com/)

### Support
- Email: support@digitaldream.work
- Microsoft Partner Support: [Support Page](https://partner.microsoft.com/support)

---

## 🚀 Prêt à Soumettre ?

Votre add-in Task Manager est **prêt pour la soumission** !

1. ✅ Tous les critères techniques sont remplis
2. ✅ Documents légaux en place
3. ✅ Icônes créées
4. ✅ Serveur sécurisé (HTTPS/TLS)

**Prochaine action** : Créer les screenshots et soumettre sur Partner Center !

Bonne chance ! 🎉

---

**Dernière mise à jour** : 2025-11-18
**Auteur** : Claude Code via Digital Dream
**Version add-in** : 1.0.0
