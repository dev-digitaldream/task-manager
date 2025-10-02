# Debug 502 Error - CapRover

## Causes possibles:

### 1. Port incorrect
CapRover attend le port **80** (pas 3001)

### 2. Health check échoue
Le container démarre mais le health check échoue

### 3. WebSocket non configuré
Socket.IO ne peut pas se connecter

---

## Actions à faire sur CapRover:

### 1. Vérifier les logs complets
```
CapRover → Apps → task-manager → App Logs
```

Cherchez:
- Erreurs après "Server running on port 80"
- Messages d'erreur Socket.IO
- Erreurs Prisma

### 2. Vérifier HTTP Settings
```
CapRover → Apps → task-manager → HTTP Settings
```

Assurez-vous:
- ✅ Container HTTP Port: **80**
- ✅ Websocket Support: **ENABLED**
- ✅ HTTPS: Enabled
- ✅ Force HTTPS: Enabled

### 3. Tester le health check
SSH dans le container:
```bash
# Sur CapRover
docker exec -it $(docker ps | grep task-manager | awk '{print $1}') sh

# Dans le container
wget -O- http://localhost:80/health
```

---

## Fix probable: PORT incorrect

Le serveur écoute peut-être sur 3001 au lieu de 80.
