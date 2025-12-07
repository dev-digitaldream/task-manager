# 🖥️ VPS Update via VNC Terminal

## ✅ Tu es connecté en VNC au VPS

Parfait! Tu peux maintenant exécuter les commandes directement dans le terminal.

---

## 🚀 UPDATE EN 7 ÉTAPES

### **Étape 1: Ouvrir Terminal dans VNC**

- VNC window → Right-click → **Open Terminal**
- Ou: Applications menu → Terminal/Console

---

### **Étape 2: Aller au dossier FlowSpaces**

```bash
cd /opt/flowspaces
```

**Vérifier qu'on est au bon endroit:**
```bash
ls -la
```

Doit afficher: `docker-compose.yml`, `Dockerfile`, `.env`, etc.

---

### **Étape 3: Arrêter la version actuelle**

```bash
docker compose down
```

Attendre que tous les containers s'arrêtent.

---

### **Étape 4: Builder la nouvelle image** ⏳ (5-10 min)

```bash
docker build -t flowspaces:latest .
```

**À la fin tu verras:** `Successfully tagged flowspaces:latest`

---

### **Étape 5: Démarrer les services**

```bash
docker compose up -d
```

---

### **Étape 6: Attendre le démarrage** (2 min)

```bash
sleep 10
```

---

### **Étape 7: Vérifier que tout fonctionne**

```bash
# Check containers
docker ps

# Health check
curl http://localhost:3001/health

# Check logs
docker logs -f flowspaces
```

Appuyer sur **Ctrl+C** pour quitter les logs.

---

## ✅ SUCCESS INDICATORS

Après les étapes:

✅ `docker ps` affiche **5 containers** (ou plus)
✅ `curl http://localhost:3001/health` retourne `OK`
✅ Pas d'erreurs dans les logs
✅ https://www.flowspaces.work répond
✅ Uptime Kuma montré comme UP

---

## 📋 ALL COMMANDS TOGETHER

**Copy-paste all at once:**

```bash
cd /opt/flowspaces && \
docker compose down && \
docker build -t flowspaces:latest . && \
docker compose up -d && \
sleep 10 && \
echo "✅ Update complete!" && \
docker ps && \
curl http://localhost:3001/health
```

---

## 🛠️ If Something Goes Wrong

### **Container won't start**

```bash
docker logs flowspaces
```

Check what error appears.

### **Build fails**

```bash
# Try without cache
docker build --no-cache -t flowspaces:latest .
```

### **Port already in use**

```bash
# Find what's using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Then try again
docker compose up -d
```

### **Database issues**

```bash
# Restart just the app
docker restart flowspaces

# Or reset completely
docker compose down -v
docker compose up -d
```

---

## 📊 USEFUL COMMANDS

**See all logs:**
```bash
docker logs -f flowspaces --tail 100
```

**Check disk space:**
```bash
df -h
```

**Check memory usage:**
```bash
free -h
```

**Stop all containers:**
```bash
docker compose down
```

**Start all containers:**
```bash
docker compose up -d
```

**Remove old images (cleanup):**
```bash
docker image prune -a
```

**Restart everything:**
```bash
docker compose restart
```

---

## 🎯 NEXT STEPS AFTER UPDATE

### 1. Verify app works
```bash
curl https://www.flowspaces.work/health
```

### 2. Check Uptime Kuma
```
http://85.121.48.53:3002
```

### 3. Check Dokploy
```
http://85.121.48.53:3000
```

### 4. If using Uptime Kuma, verify monitor shows GREEN

---

## 📞 EMERGENCY

If app crashes after update:

```bash
# Check what happened
docker logs flowspaces --tail 50

# Restart
docker restart flowspaces

# Or rollback
docker compose down
docker pull previous_image  # if available
docker compose up -d
```

---

## ✅ CHECKLIST

- [ ] Opened Terminal in VNC
- [ ] Changed directory to /opt/flowspaces
- [ ] Ran: docker compose down
- [ ] Ran: docker build -t flowspaces:latest .
- [ ] Ran: docker compose up -d
- [ ] Verified: docker ps shows containers
- [ ] Verified: curl returns OK
- [ ] Checked: https://www.flowspaces.work works
- [ ] Checked: Uptime Kuma shows GREEN

---

## 🎉 DONE!

Your FlowSpaces is updated to the latest version!

**Next**: Check monitoring dashboards to confirm everything is running.
