# 🚀 VPS Update via Dokploy MCP APIs

## Option 1: Via SSH Direct (Recommandé)

### Étape 1: Exécuter le script d'update

```bash
# Sur ta machine local, depuis le répo
ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh

# Le script va:
# ✅ Arrêter l'ancienne version
# ✅ Builder la nouvelle image Docker
# ✅ Démarrer le container
# ✅ Installer Uptime Kuma, Portainer, Prometheus, Grafana
# ✅ Configurer backups automatiques
# ✅ Configurer health checks
```

### Étape 2: Vérifier que tout fonctionne

```bash
# Test health
curl https://www.flowspaces.work/health

# Vérifier les services
docker ps

# Logs
ssh root@85.121.48.53 'docker logs -f flowspaces' | head -50
```

### Étape 3: Configurer le monitoring

1. **Uptime Kuma**: http://85.121.48.53:3002
   - Setup account
   - Add monitor pour: https://www.flowspaces.work/health

2. **Grafana**: http://85.121.48.53:3003
   - Login: admin / admin
   - **CHANGE PASSWORD IMMÉDIATEMENT**
   - Add Prometheus data source
   - Import dashboards

3. **Portainer**: https://85.121.48.53:9000
   - Setup account
   - Voir tous les containers

---

## Option 2: Via Dokploy Dashboard (Manuel)

Si tu préfères faire via l'interface Dokploy:

1. **Dokploy Dashboard**: http://85.121.48.53:3000
2. FlowSpaces App → **Redeploy**
3. Attendre le build
4. Vérifier les logs

---

## Option 3: Via Git Webhook (Auto-Update)

Setup dans Dokploy pour redéployer automatiquement:

1. Dokploy → FlowSpaces App → **Webhooks**
2. Copier l'URL du webhook
3. GitHub Repo → Settings → Webhooks → Add webhook
4. Coller l'URL
5. À partir de maintenant, chaque `git push` redéploie automatiquement

---

## 📊 Architecture Monitoring

```
┌─────────────────────────────────────────────────────┐
│                    VPS 85.121.48.53                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  FlowSpaces (Port 3001)                      │  │
│  │  Latest version with all features            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  MONITORING STACK                            │  │
│  ├──────────────────────────────────────────────┤  │
│  │  🟢 Uptime Kuma      (3002) - Health checks │  │
│  │  🟢 Portainer        (9000) - Containers    │  │
│  │  🟢 Prometheus       (9090) - Metrics       │  │
│  │  🟢 Grafana          (3003) - Dashboards    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  AUTOMATION                                  │  │
│  ├──────────────────────────────────────────────┤  │
│  │  ✅ Daily Backups (2 AM)                    │  │
│  │  ✅ Health Checks (every 5 min)             │  │
│  │  ✅ Auto-restart on failure                 │  │
│  │  ✅ Alerts via Webhook/Email                │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Links Après Update

| Service | URL | Purpose |
|---------|-----|---------|
| App | https://www.flowspaces.work | Main app |
| Health | https://www.flowspaces.work/health | API health check |
| Kuma | http://85.121.48.53:3002 | Monitoring dashboard |
| Portainer | https://85.121.48.53:9000 | Container management |
| Prometheus | http://85.121.48.53:9090 | Metrics database |
| Grafana | http://85.121.48.53:3003 | Analytics dashboards |

---

## ✅ Post-Update Checklist

- [ ] Script completed successfully
- [ ] FlowSpaces is running: `curl https://www.flowspaces.work/health`
- [ ] Uptime Kuma accessible: http://85.121.48.53:3002
- [ ] Portainer accessible: https://85.121.48.53:9000
- [ ] Prometheus accessible: http://85.121.48.53:9090
- [ ] Grafana accessible: http://85.121.48.53:3003
- [ ] Added monitor in Kuma
- [ ] Changed Grafana password
- [ ] Tested failover (stop container, check alerts)
- [ ] Verified backups running

---

## 🚨 Support

**Besoin d'aide?**

```bash
# Voir les logs
ssh root@85.121.48.53 'docker logs -f flowspaces'

# Vérifier les services
ssh root@85.121.48.53 'docker ps'

# Check health
ssh root@85.121.48.53 'curl http://localhost:3001/health'
```

**🎉 Done! Ton VPS est à jour avec monitoring complet!**
