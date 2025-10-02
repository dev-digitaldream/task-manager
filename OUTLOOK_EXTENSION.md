# Extension Outlook — Guide complet

## Vue d'ensemble

L'extension Outlook permet de créer des tâches directement depuis les emails dans Outlook (Windows, Mac, Web).

## Architecture

```
outlook-addin/
├── manifest.xml          # Manifeste de l'extension (configuration Office)
├── taskpane.html        # Interface de création de tâche
├── README.md            # Documentation de l'extension
└── assets/              # Icônes (à créer)
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-64.png
    ├── icon-80.png
    └── icon-128.png
```

## Fonctionnalités

### 1. Création de tâche depuis un email
- **Extraction automatique** du sujet de l'email → titre de la tâche
- **Extraction du corps** de l'email → description/commentaire initial
- **Métadonnées** : expéditeur, date, pièces jointes
- **Assignation** : sélection d'un utilisateur
- **Priorité** : low/medium/high/urgent
- **Date limite** : sélection via calendrier
- **Visibilité** : privée ou publique (dashboard)

### 2. Synchronisation bidirectionnelle
- Les tâches créées depuis Outlook apparaissent dans l'app web
- Les changements dans l'app web sont reflétés dans les abonnements calendrier (.ics)

### 3. Intégration calendrier
- Export .ics des tâches avec échéance
- Synchronisation avec Outlook Calendar, iPhone Calendar, Google Calendar
- URL d'abonnement : `https://todo.rauwers.cloud/api/calendar/:userId.ics`

## Installation de l'extension

### Développement local

1. **Héberger les fichiers localement** (via le serveur Express):
```bash
# Le serveur Express sert déjà /outlook/* depuis server/public/outlook/
cd server
mkdir -p public/outlook
cp -r ../outlook-addin/* public/outlook/
```

2. **Modifier le manifest pour localhost**:
Remplacer toutes les URLs `https://todo.rauwers.cloud` par `http://localhost:3001` dans `manifest.xml`.

3. **Sideload dans Outlook**:

**Windows/Mac Outlook Desktop**:
- Ouvrir Outlook
- Aller dans **Obtenir des compléments** (Get Add-ins)
- Cliquer sur **Mes compléments** → **Ajouter un complément personnalisé**
- Sélectionner **Ajouter à partir d'un fichier**
- Parcourir et sélectionner `outlook-addin/manifest.xml`

**Outlook Web**:
- Ouvrir https://outlook.office.com
- Paramètres (⚙️) → **Afficher tous les paramètres Outlook**
- **Général** → **Gérer les compléments**
- Cliquer sur **+ Mes compléments** → **Ajouter un complément personnalisé depuis un fichier**
- Uploader `manifest.xml`

### Production (cPanel todo.rauwers.cloud)

1. **Héberger les fichiers sur le serveur**:
```bash
# Via FTP ou File Manager cPanel
/home/rauwers/public_html/outlook/
├── manifest.xml
├── taskpane.html
└── assets/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-64.png
    ├── icon-80.png
    └── icon-128.png
```

2. **Vérifier les URLs dans manifest.xml**:
Toutes les URLs doivent pointer vers `https://todo.rauwers.cloud/outlook/`

3. **Distribuer l'extension**:
- Envoyer le fichier `manifest.xml` aux utilisateurs
- Ou publier sur **AppSource** (Microsoft Office Store) pour une distribution large

### AppSource (distribution publique)

1. **Créer un compte Partner Center Microsoft**:
https://partner.microsoft.com/dashboard

2. **Préparer les assets**:
- Icônes en haute résolution
- Captures d'écran
- Description marketing
- Politique de confidentialité
- Conditions d'utilisation

3. **Soumettre l'extension**:
- Uploader le manifest validé
- Remplir les métadonnées
- Passer la validation Microsoft (3-5 jours ouvrés)

## Endpoints API pour l'extension

### 1. Créer une tâche depuis Outlook
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Sujet de l'email",
  "assigneeId": "user-id",
  "ownerId": "user-id",
  "priority": "medium",
  "dueDate": "2025-10-05T00:00:00.000Z",
  "isPublic": false,
  "emailMetadata": {
    "from": "sender@example.com",
    "subject": "Original subject",
    "receivedDate": "2025-10-02T10:30:00.000Z",
    "messageId": "outlook-message-id"
  }
}
```

### 2. Lister les utilisateurs (pour assignation)
```http
GET /api/users
```

### 3. Calendrier .ics (pour synchronisation Outlook Calendar)
```http
GET /api/calendar/:userId.ics
```

## Code JavaScript de l'extension (taskpane.html)

### Initialisation Office.js
```javascript
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById('create-task').onclick = createTaskFromEmail
  }
})
```

### Extraction des données de l'email
```javascript
function createTaskFromEmail() {
  const item = Office.context.mailbox.item
  
  // Récupérer le sujet
  const subject = item.subject
  
  // Récupérer l'expéditeur
  item.from.getAsync((result) => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      const from = result.value.emailAddress
      
      // Récupérer le corps de l'email
      item.body.getAsync('text', (bodyResult) => {
        if (bodyResult.status === Office.AsyncResultStatus.Succeeded) {
          const body = bodyResult.value
          
          // Créer la tâche via API
          createTask({
            title: subject,
            description: body.substring(0, 500), // Limite à 500 caractères
            emailFrom: from,
            emailDate: item.dateTimeCreated
          })
        }
      })
    }
  })
}
```

### Appel API pour créer la tâche
```javascript
async function createTask(data) {
  try {
    const response = await fetch('https://todo.rauwers.cloud/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Outlook-Extension': 'true' // Header custom pour traçabilité
      },
      body: JSON.stringify({
        title: data.title,
        assigneeId: document.getElementById('assignee-select').value,
        ownerId: getCurrentUserId(), // À implémenter
        priority: document.getElementById('priority-select').value,
        dueDate: document.getElementById('due-date').value,
        isPublic: document.getElementById('is-public').checked,
        emailMetadata: {
          from: data.emailFrom,
          receivedDate: data.emailDate,
          messageId: Office.context.mailbox.item.itemId
        }
      })
    })
    
    if (response.ok) {
      showSuccessMessage('Tâche créée avec succès!')
    } else {
      showErrorMessage('Erreur lors de la création de la tâche')
    }
  } catch (error) {
    console.error('Error creating task:', error)
    showErrorMessage('Erreur réseau')
  }
}
```

## Synchronisation calendrier (.ics)

### Backend : Génération du fichier .ics

L'endpoint `/api/calendar/:userId.ics` existe déjà dans `server/src/routes/ical.js`.

**Exemple de réponse**:
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Todo Collaboratif//Kanban//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Mes Tâches - Todo Collaboratif
X-WR-TIMEZONE:Europe/Paris
X-WR-CALDESC:Tâches avec échéance pour Mohammed

BEGIN:VEVENT
UID:cmg90gown00011m8ami1czujf@todo.rauwers.cloud
DTSTAMP:20251002T070000Z
DTSTART:20251003T000000Z
SUMMARY:Simbase Postnl
DESCRIPTION:Priorité: medium\nStatut: À faire
STATUS:CONFIRMED
PRIORITY:5
END:VEVENT

END:VCALENDAR
```

### Abonnement dans Outlook

**Windows/Mac Outlook Desktop**:
1. **Fichier** → **Paramètres du compte** → **Paramètres du compte...**
2. Onglet **Calendriers Internet**
3. **Nouveau** → Coller l'URL : `https://todo.rauwers.cloud/api/calendar/<USER_ID>.ics`
4. **OK** → Le calendrier apparaît dans la liste des calendriers

**Outlook Web**:
1. **Calendrier** → **Ajouter un calendrier**
2. **Souscrire à partir du web**
3. Coller l'URL : `https://todo.rauwers.cloud/api/calendar/<USER_ID>.ics`
4. **Importer**

**iPhone Calendar**:
1. **Réglages** → **Calendrier** → **Comptes** → **Ajouter un compte**
2. **Autre** → **Ajouter un abonnement**
3. Coller l'URL : `https://todo.rauwers.cloud/api/calendar/<USER_ID>.ics`
4. **Suivant** → **Enregistrer**

**Google Calendar**:
1. **Paramètres** → **Ajouter un calendrier** → **À partir d'une URL**
2. Coller l'URL : `https://todo.rauwers.cloud/api/calendar/<USER_ID>.ics`
3. **Ajouter un calendrier**

## Déploiement sur cPanel

### 1. Héberger les fichiers statiques
```bash
# Via File Manager ou FTP
/home/rauwers/public_html/outlook/
├── manifest.xml
├── taskpane.html
└── assets/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-64.png
    ├── icon-80.png
    └── icon-128.png
```

### 2. Configurer le serveur Node.js
Le serveur Express sert déjà les fichiers statiques via:
```javascript
app.use('/outlook', express.static(path.join(__dirname, '../public/outlook')))
```

### 3. Tester l'extension
- URL du manifest : `https://todo.rauwers.cloud/outlook/manifest.xml`
- URL du taskpane : `https://todo.rauwers.cloud/outlook/taskpane.html`

### 4. Certificat SSL
Outlook **exige HTTPS** pour les extensions en production. Le domaine `todo.rauwers.cloud` doit avoir un certificat SSL valide (Let's Encrypt via cPanel).

## Sécurité

### Authentication
L'extension doit authentifier l'utilisateur avant de créer une tâche. Options:

1. **JWT Token stocké** dans `localStorage` du taskpane
2. **OAuth2** avec Microsoft Azure AD (recommandé pour production)
3. **API Key** par utilisateur (plus simple pour MVP)

### CORS
Le serveur Express doit autoriser les requêtes depuis Outlook:
```javascript
app.use(cors({
  origin: [
    'https://outlook.office.com',
    'https://outlook.live.com',
    'https://outlook.office365.com',
    'https://todo.rauwers.cloud'
  ],
  credentials: true
}))
```

## Limitations

1. **Permissions** : L'extension demande `ReadWriteMailbox` (lecture de tous les emails)
2. **Taille** : Le manifest doit faire < 256 KB
3. **Latence** : Office.js peut être lent sur certaines versions d'Outlook
4. **Compatibilité** :
   - ✅ Outlook 2016+ (Windows/Mac)
   - ✅ Outlook Web
   - ✅ Outlook iOS/Android
   - ❌ Outlook 2013 et antérieurs

## Prochaines étapes

1. ✅ Manifest créé et configuré
2. ✅ Taskpane HTML créé
3. ⏳ Créer les icônes (16x16, 32x32, 64x64, 80x80, 128x128)
4. ⏳ Implémenter l'authentification dans le taskpane
5. ⏳ Tester en local (sideload)
6. ⏳ Déployer sur cPanel
7. ⏳ Tester en production
8. ⏳ Documenter pour les utilisateurs finaux
9. ⏳ (Optionnel) Publier sur AppSource

## Ressources

- [Office Add-ins Documentation](https://docs.microsoft.com/office/dev/add-ins/)
- [Outlook Add-ins Overview](https://docs.microsoft.com/office/dev/add-ins/outlook/outlook-add-ins-overview)
- [Office.js API Reference](https://docs.microsoft.com/javascript/api/office)
- [Sideloading Add-ins](https://docs.microsoft.com/office/dev/add-ins/testing/sideload-office-add-ins-for-testing)
