# 🚀 Update FlowSpaces on Dokploy (Existing Setup)

## 📋 Current Status

✅ **Dokploy**: Running at http://85.121.48.53:3000
✅ **App**: Online at https://www.flowspaces.work
✅ **Uptime Kuma**: Running at http://85.121.48.53:3002
✅ **DNS**: Configured
✅ **HTTPS**: Active

---

## 🎯 Goal: Update to Latest Version

**Tu as une ancienne version online. Mets-la à jour en 2 étapes.**

---

## ⚡ ÉTAPE 1: Push Latest Code to GitHub

### 1.1 Sur ta machine local

```bash
cd /Volumes/ExtremeSSD/projetcs/kanban

# Vérifier que tout est OK
git status

# Commit latest changes
git add -A
git commit -m "🚀 Update: FlowSpaces to latest version with monitoring"

# Push vers GitHub
git push origin main
```

**Vérifier sur GitHub**: https://github.com/TON_USER/kanban
- Doit montrer les commits récents sur `main` branch

---

## ⚡ ÉTAPE 2: Redeploy via Dokploy

### 2.1 Ouvrir Dokploy Dashboard

```
http://85.121.48.53:3000
```

### 2.2 Redeploy l'Application

1. **Projects** → **FlowSpaces**
2. **Applications** → **flowspaces-app** (ou le nom de ton app)
3. Clic sur **"Redeploy"** ou **"Deploy"**
4. **Attendre** les logs (5-10 minutes)
5. Voir message: ✅ **Deployment successful**

### 2.3 Vérifier Deployment

**Dans Dokploy**:
- Onglet **"Logs"** → Voir les logs en temps réel
- Attendre jusqu'à: `Container started successfully`

**Health Check**:
```bash
curl https://www.flowspaces.work/health
# Doit retourner: {"status":"OK",...}
```

---

## 🔄 Alternative: Auto-Deploy via Webhook (Si pas encore setup)

### Setup Webhook GitHub

1. **Dokploy Dashboard**
2. **FlowSpaces** → **flowspaces-app**
3. **Webhooks** → Copier l'URL
4. **GitHub Repo Settings** → **Webhooks** → **Add webhook**
5. Coller l'URL du webhook
6. **Events**: `push`
7. **Save**

**Résultat**: À partir de maintenant, chaque `git push origin main` redéploie automatiquement!

---

## ✅ Verification Checklist

Après le redéploiement:

```bash
# 1. App respond
curl https://www.flowspaces.work/health
# Expected: {"status":"OK",...}

# 2. Frontend load
# Open: https://www.flowspaces.work
# Doit voir interface FlowSpaces

# 3. WebSocket OK
# DevTools → Network → WS
# Doit voir socket.io connection

# 4. API Working
# Try login/create task
# Doit fonctionner sans erreurs

# 5. Uptime Kuma still monitoring
# http://85.121.48.53:3002
# Should show green status
```

---

## 📊 Monitoring après Update

### Uptime Kuma

L'app doit être monitorée automatiquement si déjà configuré.

**Vérifier**:
1. http://85.121.48.53:3002
2. Voir le monitor pour `https://www.flowspaces.work/health`
3. Status doit être **UP** (vert)

### Check Logs

```bash
# SSH sur VPS
ssh root@85.121.48.53

# Voir les logs
docker logs -f $(docker ps -q -f "name=flowspaces")

# Ctrl+C pour quitter
```

---

## 🎯 Timeline

| Step | Duration | What |
|------|----------|------|
| Push code | 2 min | git push |
| Redeploy | 5-10 min | Dokploy build + start |
| Health check | 1 min | curl verify |
| **Total** | **8-13 min** | |

---

## 🆘 Troubleshooting

### ❌ Redeploy fails

```bash
# 1. Check logs in Dokploy
# Onglet "Logs" → voir l'erreur

# 2. Common issues:
# - Dockerfile error → Check Dockerfile syntax
# - Env vars missing → Add missing vars in Environment tab
# - Build timeout → Wait longer or check Docker build locally

# 3. Manual check
ssh root@85.121.48.53 'docker logs -f <app-container>'
```

### ❌ App doesn't respond after update

```bash
# 1. Check container running
ssh root@85.121.48.53 'docker ps | grep flowspaces'

# 2. Check logs
ssh root@85.121.48.53 'docker logs -f flowspaces'

# 3. Health check
curl https://www.flowspaces.work/health

# 4. If still failing, rollback
# Dokploy → App → Rollback to previous version
```

### ❌ Uptime Kuma shows DOWN

```bash
# Wait 2-3 minutes for health check to succeed
# Kuma checks every 60s

# If still down:
curl https://www.flowspaces.work/health
# Check actual app status
```

---

## 📝 What's Updated

Latest version includes:

✅ All latest features (workspaces, 2FA, recurring tasks, etc.)
✅ Latest dependencies (security patches)
✅ Bug fixes
✅ Performance improvements
✅ Latest UI/UX

---

## 🔐 Security Check Post-Update

```bash
# HTTPS working?
curl -I https://www.flowspaces.work
# Should have valid certificate

# API keys still safe?
# Check .env on Dokploy (should not show secrets in logs)

# Backups still working?
# If you have setup backups
```

---

## 📞 Support

### URLs

- **App**: https://www.flowspaces.work
- **Dokploy**: http://85.121.48.53:3000
- **Kuma**: http://85.121.48.53:3002
- **Health**: https://www.flowspaces.work/health

### Emergency

If app completely down:

```bash
ssh root@85.121.48.53

# Check containers
docker ps -a

# Restart all
docker compose restart

# Or full redeploy
docker compose down && docker compose up -d
```

---

## ✅ Success Indicators

✅ Git push successful
✅ Dokploy redeploy started
✅ Health check returns OK
✅ Frontend loads
✅ WebSocket connected
✅ Uptime Kuma shows GREEN
✅ No errors in logs

---

## 🎉 Done!

**Your app is now updated to the latest version!**

If you want **additional monitoring** (Portainer, Prometheus, Grafana), check:
- **UPDATE_SUMMARY.md** for full monitoring stack
- **VPS_UPDATE_SCRIPT.sh** for automated installation

---

**Questions?** Check the logs or reach out!
