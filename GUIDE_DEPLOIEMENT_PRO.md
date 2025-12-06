# 🚀 Guide de Déploiement Professionnel - FlowSpace SaaS
## flowspaces.work

---

## 📋 Résumé des Corrections Effectuées

### ✅ 1. Upload d'Avatar
- **Backend** : Route `/api/users/:id/avatar` avec `multer` pour gérer l'upload
- **Stockage** : Dossier `/server/uploads` (servi statiquement via `/uploads`)
- **Frontend** : `ProfilePage.jsx` mis à jour avec input file caché et preview d'image
- **Limite** : 5MB par fichier, formats image uniquement

### ✅ 2. Favoris Dynamiques (Sidebar)
- **Stockage** : `localStorage` (clé: `flowspace_favorites`)
- **Fonctionnalités** :
  - Bouton `+` pour ajouter un favori (titre + URL)
  - Bouton `X` au survol pour supprimer
  - Icône étoile dorée pour chaque favori
- **Persistance** : Les favoris sont sauvegardés localement par utilisateur

### ⚠️ 3. Notifications Email (À Configurer)
Le système de notifications existe déjà dans le code (`server/src/services/notifications.js`), mais il utilise un SMTP local en développement.

**Pour activer les vraies notifications (mot de passe oublié, etc.) :**
1. Créer un compte sur **Resend.com** (gratuit jusqu'à 3000 emails/mois)
2. Obtenir votre clé API
3. Modifier `server/.env` :
   ```env
   NODE_ENV=production
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASS=re_VotreClé_API_Ici
   SMTP_FROM=noreply@flowspaces.work
   ```

---

## 🏗️ Architecture Recommandée pour Production

### 1. **Serveur VPS** : Hetzner Cloud (Recommandé)
**Pourquoi Hetzner ?**
- Meilleur rapport qualité/prix en Europe
- Datacenters en Allemagne et Finlande (RGPD compliant)
- Performance exceptionnelle
- Support réactif

**Modèle conseillé pour démarrer :**
- **CPX31** : 4 vCPU, 8GB RAM, 160GB SSD
- **Prix** : ~15€/mois
- **Capacité** : 500-1000 utilisateurs simultanés

**Alternative :**
- DigitalOcean (Droplet 4GB RAM, ~24$/mois)
- OVH Cloud (VPS SSD 3, ~12€/mois)

---

### 2. **Orchestration** : Coolify (Recommandé) ou CapRover

#### Option A : **Coolify** ⭐ (Recommandé)
**Pourquoi Coolify ?**
- Interface moderne et intuitive
- Déploiement Git automatique (push to deploy)
- SSL automatique (Let's Encrypt)
- Gestion des bases de données intégrée
- Monitoring et logs en temps réel
- **Open Source** et gratuit

**Installation sur Hetzner :**
```bash
# 1. Se connecter au VPS
ssh root@votre-ip-hetzner

# 2. Installer Coolify (1 commande)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 3. Accéder à l'interface
# https://votre-ip-hetzner:8000
```

**Configuration FlowSpace dans Coolify :**
1. Créer une nouvelle application (Git Source)
2. Connecter votre repo GitHub/GitLab
3. Définir les variables d'environnement :
   - `DATABASE_URL` (PostgreSQL fourni par Coolify)
   - `SMTP_*` (Resend)
   - `NODE_ENV=production`
4. Configurer le domaine : `flowspaces.work` et `www.flowspaces.work`
5. Activer SSL automatique

#### Option B : **CapRover** (Vous l'utilisez déjà)
Vous pouvez continuer avec CapRover, mais Coolify est plus moderne et stable.

---

### 3. **Base de Données** : PostgreSQL

**Pourquoi PostgreSQL au lieu de SQLite ?**
- SQLite n'est **PAS** adapté pour un SaaS multi-utilisateurs
- PostgreSQL gère la concurrence, les transactions, et les backups
- Coolify/CapRover fournissent PostgreSQL en 1 clic

**Migration SQLite → PostgreSQL :**
```bash
# 1. Dans server/prisma/schema.prisma, changer :
datasource db {
  provider = "postgresql"  // au lieu de "sqlite"
  url      = env("DATABASE_URL")
}

# 2. Créer la DB dans Coolify (PostgreSQL 16)
# 3. Copier l'URL de connexion dans .env
DATABASE_URL="postgresql://user:password@host:5432/flowspace"

# 4. Migrer
npx prisma migrate dev --name init_postgres
npx prisma db push
```

---

### 4. **Emails** : Resend (Recommandé)

**Pourquoi Resend ?**
- API simple et moderne
- Excellente délivrabilité (inbox, pas spam)
- Plan gratuit : 3000 emails/mois (largement suffisant au démarrage)
- Dashboard avec analytics

**Configuration :**
1. Créer un compte sur [resend.com](https://resend.com)
2. Ajouter votre domaine `flowspaces.work`
3. Configurer les DNS (SPF, DKIM) - Resend vous guide
4. Obtenir votre clé API
5. Mettre à jour `.env` (voir section Notifications ci-dessus)

**Alternative :**
- **SendGrid** (100 emails/jour gratuit)
- **Mailgun** (5000 emails/mois gratuit les 3 premiers mois)

---

### 5. **Stockage Fichiers** : Cloudflare R2 ou AWS S3

**Problème actuel :**
Les avatars sont stockés dans `/server/uploads` sur le disque du serveur.
❌ Si le serveur crash ou est redéployé, **vous perdez toutes les photos**.

**Solution : Stockage Objet (S3-compatible)**

#### Option A : **Cloudflare R2** ⭐ (Recommandé)
**Pourquoi R2 ?**
- Compatible S3 (même API)
- **Gratuit jusqu'à 10GB** de stockage
- **Pas de frais de bande passante** (contrairement à S3)
- Très rapide (CDN Cloudflare intégré)

**Prix :**
- 10GB gratuit, puis 0.015$/GB/mois
- Pas de frais de sortie (AWS facture 0.09$/GB)

**Configuration :**
1. Créer un compte Cloudflare
2. Activer R2 (Workers & Pages > R2)
3. Créer un bucket `flowspace-avatars`
4. Obtenir les clés d'accès (Access Key ID + Secret)
5. Installer le SDK :
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```
6. Modifier `server/src/routes/users.js` pour uploader vers R2 au lieu du disque

#### Option B : **AWS S3**
Plus cher mais ultra-fiable. Utilisez R2 pour commencer.

---

### 6. **CDN & Sécurité** : Cloudflare (Gratuit)

**Configuration DNS :**
1. Transférer les DNS de `flowspaces.work` vers Cloudflare (gratuit)
2. Activer le proxy (nuage orange) pour :
   - Protection DDoS
   - Cache automatique des assets
   - SSL/TLS automatique
   - Firewall WAF

**Avantages :**
- Votre site sera **beaucoup plus rapide** partout dans le monde
- Protection contre les attaques
- Analytics gratuits

---

### 7. **Monitoring & Logs** : Sentry + Uptime Robot

#### **Sentry** (Erreurs en temps réel)
- Plan gratuit : 5000 erreurs/mois
- Détecte les bugs en production avant vos utilisateurs
- Installation :
  ```bash
  npm install @sentry/node @sentry/react
  ```

#### **Uptime Robot** (Surveillance 24/7)
- Gratuit pour 50 monitors
- Vous alerte par email/SMS si le site est down
- Configurez un monitor HTTP sur `https://flowspaces.work/health`

---

## 📦 Checklist de Déploiement

### Phase 1 : Préparation (Aujourd'hui)
- [x] Acheter le domaine `flowspaces.work` ✅
- [ ] Créer un compte Hetzner Cloud
- [ ] Créer un compte Cloudflare
- [ ] Créer un compte Resend
- [ ] Transférer les DNS vers Cloudflare

### Phase 2 : Infrastructure (Jour 1-2)
- [ ] Provisionner un VPS Hetzner CPX31
- [ ] Installer Coolify sur le VPS
- [ ] Créer une base PostgreSQL dans Coolify
- [ ] Configurer le domaine `flowspaces.work` dans Coolify

### Phase 3 : Migration Code (Jour 2-3)
- [ ] Migrer de SQLite vers PostgreSQL
- [ ] Configurer Resend pour les emails
- [ ] (Optionnel) Migrer les uploads vers Cloudflare R2
- [ ] Pousser le code sur Git (GitHub/GitLab)
- [ ] Connecter le repo à Coolify

### Phase 4 : Mise en Production (Jour 3-4)
- [ ] Tester le déploiement sur `flowspaces.work`
- [ ] Configurer SSL (automatique via Coolify)
- [ ] Activer le proxy Cloudflare
- [ ] Configurer Sentry pour le monitoring
- [ ] Configurer Uptime Robot

### Phase 5 : Optimisation (Semaine 1)
- [ ] Activer le cache Cloudflare
- [ ] Optimiser les images (WebP, compression)
- [ ] Configurer les backups automatiques (PostgreSQL)
- [ ] Mettre en place un système de backup quotidien

---

## 💰 Coûts Mensuels Estimés

| Service | Plan | Prix |
|---------|------|------|
| **Hetzner VPS** (CPX31) | 4 vCPU, 8GB RAM | 15€/mois |
| **Cloudflare** | DNS + CDN + SSL | Gratuit |
| **Resend** | 3000 emails/mois | Gratuit |
| **Cloudflare R2** | 10GB stockage | Gratuit |
| **Coolify** | Self-hosted | Gratuit |
| **Sentry** | 5000 erreurs/mois | Gratuit |
| **Uptime Robot** | 50 monitors | Gratuit |
| **TOTAL** | | **~15€/mois** 🎉 |

**Évolution :**
- À 100 utilisateurs actifs : ~15€/mois
- À 500 utilisateurs actifs : ~25€/mois (upgrade VPS)
- À 1000+ utilisateurs : ~50€/mois (VPS + R2 payant)

---

## 🔐 Sécurité & RGPD

### Mesures Déjà en Place
- ✅ Helmet.js (headers de sécurité)
- ✅ Rate limiting (protection brute-force)
- ✅ Input sanitization
- ✅ CORS configuré

### À Ajouter
1. **Politique de Confidentialité** (obligatoire RGPD)
2. **CGU/CGV** (si vous facturez)
3. **Cookie Banner** (si vous utilisez des cookies analytics)
4. **Backups chiffrés** (PostgreSQL)

---

## 📞 Support & Maintenance

### Backups Automatiques
Coolify permet de configurer des backups automatiques de PostgreSQL vers :
- AWS S3
- Cloudflare R2
- Serveur FTP/SFTP

**Recommandation :**
- Backup quotidien à 3h du matin
- Rétention : 30 jours
- Stockage : Cloudflare R2 (gratuit jusqu'à 10GB)

### Mises à Jour
Avec Coolify, les mises à jour sont automatiques :
1. Vous poussez du code sur Git
2. Coolify détecte le push
3. Rebuild et redéploiement automatique
4. Zero-downtime deployment

---

## 🎯 Prochaines Étapes Recommandées

1. **Cette semaine :**
   - Créer les comptes (Hetzner, Cloudflare, Resend)
   - Installer Coolify sur un VPS de test
   - Migrer vers PostgreSQL

2. **Semaine prochaine :**
   - Déployer sur `flowspaces.work`
   - Configurer les emails Resend
   - Tester en conditions réelles

3. **Mois prochain :**
   - Implémenter le paiement (Stripe)
   - Ajouter des plans (Free, Pro, Enterprise)
   - Marketing et acquisition utilisateurs

---

## 📚 Ressources Utiles

- **Coolify** : https://coolify.io
- **Hetzner Cloud** : https://www.hetzner.com/cloud
- **Resend** : https://resend.com
- **Cloudflare R2** : https://www.cloudflare.com/products/r2/
- **Sentry** : https://sentry.io

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des difficultés lors du déploiement, voici les points de blocage courants :

1. **DNS ne se propage pas** : Attendre 24-48h ou vider le cache DNS
2. **SSL ne fonctionne pas** : Vérifier que Cloudflare est en mode "Full (strict)"
3. **Emails en spam** : Configurer SPF, DKIM, DMARC (Resend vous guide)
4. **Base de données lente** : Ajouter des index sur les colonnes fréquemment requêtées

---

**Bon déploiement ! 🚀**

*Document créé le 20/11/2025 pour FlowSpace SaaS*
