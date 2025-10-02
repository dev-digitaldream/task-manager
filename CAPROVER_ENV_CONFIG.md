# CapRover Environment Variables - Configuration Correcte

## ✅ Variables CORRECTES (à garder):

```bash
NODE_ENV=production
PORT=80
DATABASE_URL=file:/app/data/dev.db
```

## ⚠️ Variables à CORRIGER:

### 1. CLIENT_URL
**Actuel:**
```bash
CLIENT_URL=https://task-manager.digitaldream.work
```

**Problème:** En production, le client est servi depuis le même domaine (pas besoin de cette variable)

**Action:** ❌ SUPPRIMER cette variable (pas nécessaire)

---

### 2. CORS_ORIGINS
**Actuel:**
```bash
CORS_ORIGINS=https://task-manager.digitaldream.work
```

**Problème:** Le nom de la variable est incorrect

**Correction:**
```bash
CORS_ORIGIN=https://task-manager.digitaldream.work
```
(singulier, pas pluriel)

**OU mieux encore:**
```bash
CORS_ORIGIN=https://task-manager.digitaldream.work,https://task.digitaldream.work
```
(si vous avez plusieurs domaines)

---

## 📋 Configuration FINALE Recommandée:

### Variables MINIMALES (suffisantes):
```bash
NODE_ENV=production
PORT=80
DATABASE_URL=file:/app/data/dev.db
CORS_ORIGIN=https://task-manager.digitaldream.work
```

### Variables OPTIONNELLES (pour features avancées):

```bash
# JWT/Session (générer avec: openssl rand -base64 32)
JWT_SECRET=votre-secret-jwt-ici
SESSION_SECRET=votre-secret-session-ici

# Email (Postmark)
POSTMARK_API_KEY=votre-cle-postmark
POSTMARK_FROM_EMAIL=noreply@digitaldream.work

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=votre-cloud
CLOUDINARY_API_KEY=votre-cle
CLOUDINARY_API_SECRET=votre-secret
```

---

## 🔧 Comment corriger sur CapRover:

1. **Allez dans:** Apps → task-manager → **App Configs**

2. **Supprimez:**
   - `CLIENT_URL` (pas nécessaire)

3. **Renommez:**
   - `CORS_ORIGINS` → `CORS_ORIGIN` (singulier)

4. **Gardez:**
   - `NODE_ENV=production`
   - `PORT=80`
   - `DATABASE_URL=file:/app/data/dev.db`
   - `CORS_ORIGIN=https://task-manager.digitaldream.work`

5. **Cliquez "Save & Update"**

---

## ✅ Résultat attendu:

Après correction, votre app devrait:
- ✅ Accepter les requêtes depuis votre domaine
- ✅ Pas de CORS errors
- ✅ WebSocket fonctionne
- ✅ Dashboard public accessible

---

## 🎯 Test rapide:

Après avoir corrigé les variables:
1. Redémarrez l'app (pas besoin de rebuild)
2. Testez: `https://task-manager.digitaldream.work/health`
3. Devrait retourner: `{"status":"OK"}`

---

**Corrigez ces variables et redémarrez l'app!** 🚀
