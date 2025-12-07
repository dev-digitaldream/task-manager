╔═══════════════════════════════════════════════════════════════════════════╗
║                  FLOWSPACES VPS UPDATE - START HERE                      ║
║                                                                           ║
║  Tu as une ancienne version online. Cet update va:                        ║
║  ✅ Mettre à jour FlowSpaces vers la dernière version                    ║
║  ✅ Ajouter Uptime Kuma (monitoring)                                     ║
║  ✅ Ajouter Portainer (container management)                             ║
║  ✅ Ajouter Prometheus (metrics)                                         ║
║  ✅ Ajouter Grafana (dashboards)                                         ║
║  ✅ Configurer backups quotidiens                                        ║
║  ✅ Configurer alertes auto-restart                                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 3 ÉTAPES SIMPLES
═══════════════════════════════════════════════════════════════════════════

1️⃣  LANCER LE SCRIPT (Dans ton terminal local)
    ───────────────────────────────────────────────────────────────────
    ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh
    
    Password: EK&a0V@txAiQeVB!SMW4
    
    ⏱️  Durée: 15-20 minutes

2️⃣  ATTENDRE (Le script construit l'image Docker)
    ───────────────────────────────────────────────────────────────────
    À la fin tu verras:
    
    ✅ UPDATE COMPLETE!
    
    📊 MONITORING SERVICES:
      🟢 Uptime Kuma:   http://85.121.48.53:3002
      🟢 Portainer:     https://85.121.48.53:9000
      🟢 Prometheus:    http://85.121.48.53:9090
      🟢 Grafana:       http://85.121.48.53:3003

3️⃣  VÉRIFIER (Tests rapides)
    ───────────────────────────────────────────────────────────────────
    curl https://www.flowspaces.work/health
    # Doit retourner: {"status":"OK",...}
    
    ssh root@85.121.48.53 'docker ps'
    # Doit montrer 5 containers running

📖 FICHIERS DE DOCUMENTATION
═══════════════════════════════════════════════════════════════════════════

📄 EXECUTE_NOW.md
   └─ START HERE! 3 commandes seulement

📄 VPS_UPDATE_SCRIPT.sh
   └─ Le script principal (automated everything)

📄 UPDATE_SUMMARY.md
   └─ Vue d'ensemble complète + architecture

📄 VPS_UPDATE_GUIDE.md
   └─ Configuration détaillée + troubleshooting

📄 VPS_BEST_PRACTICES.md
   └─ Sécurité + optimisation + monitoring avancé

📄 VPS_DEPLOYMENT_README.md
   └─ Guide complet (ce que tu dois lire en premier)

📄 vps-update-via-dokploy.md
   └─ Si tu utilises Dokploy

🔧 SERVICES APRÈS UPDATE
═══════════════════════════════════════════════════════════════════════════

🟢 FlowSpaces
   URL: https://www.flowspaces.work
   Port: 443 (HTTPS)
   Description: La dernière version de l'app

🟢 Uptime Kuma (Monitoring)
   URL: http://85.121.48.53:3002
   Port: 3002
   Fonctions:
   • Health checks automatiques
   • Status page pour les utilisateurs
   • Alertes (email, Slack, webhook, etc.)
   • SSL certificate monitoring

🟢 Portainer (Container Management)
   URL: https://85.121.48.53:9000
   Port: 9000
   Fonctions:
   • Voir tous les containers
   • Logs real-time
   • Restart/stop containers
   • CPU/Memory monitoring

🟢 Prometheus (Métriques)
   URL: http://85.121.48.53:9090
   Port: 9090
   Fonctions:
   • Collecte métriques Docker
   • Query language (PromQL)
   • Database de time-series

🟢 Grafana (Dashboards)
   URL: http://85.121.48.53:3003
   Port: 3003
   Fonctions:
   • Visualisation métriques
   • Dashboards personnalisés
   • Alertes automatiques
   Default: admin / admin (CHANGE PASSWORD!)

⚙️ AUTOMATISATIONS INCLUSES
═══════════════════════════════════════════════════════════════════════════

✅ BACKUPS QUOTIDIENS
   • Time: 2 AM chaque jour
   • Location: /opt/flowspaces/backups/
   • Retention: 30 jours
   • Format: dev.db.backup_YYYYMMDD_HHMMSS.tar.gz

✅ HEALTH CHECKS
   • Frequency: Tous les 5 minutes
   • Auto-restart si app down
   • Logs: /opt/flowspaces/logs/alerts.log

✅ AUTO-RESTART
   • Si container crash → redémarrage auto
   • Si app ne répond pas → redémarrage auto
   • Downtime: < 1 minute généralement

🔐 ACTIONS DE SÉCURITÉ IMMÉDIATEMENT APRÈS
═══════════════════════════════════════════════════════════════════════════

⚠️ CHANGE GRAFANA PASSWORD
   1. Login: admin / admin
   2. Admin → Profile → Change password
   3. Use strong password!

⚠️ SETUP UPTIME KUMA AUTH
   1. http://85.121.48.53:3002
   2. Create account
   3. Setup monitors

⚠️ SETUP PORTAINER AUTH
   1. https://85.121.48.53:9000
   2. Create account

⚠️ CONFIGURE UFW FIREWALL
   sudo ufw allow 3002/tcp   # Kuma
   sudo ufw allow 9000/tcp   # Portainer
   sudo ufw reload

📊 ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════

Internet Users
    ↓
HTTPS/SSL (Dokploy Traefik - Automatic)
    ↓
┌─────────────────────────────────────┐
│ VPS 85.121.48.53 Docker Containers  │
├─────────────────────────────────────┤
│                                     │
│ FlowSpaces (Latest)                 │
│ ├─ Port 3001 (internal)            │
│ └─ Node.js + Express + Socket.io   │
│                                     │
│ Uptime Kuma (Monitoring)            │
│ ├─ Port 3002                        │
│ └─ Health checks + Alerts           │
│                                     │
│ Portainer (Management)              │
│ ├─ Port 9000                        │
│ └─ Container admin                  │
│                                     │
│ Prometheus (Metrics)                │
│ ├─ Port 9090                        │
│ └─ Collecte données                 │
│                                     │
│ Grafana (Dashboards)                │
│ ├─ Port 3003                        │
│ └─ Visualisation métriques          │
│                                     │
│ SQLite Database                     │
│ ├─ /app/data/dev.db (persistent)   │
│ └─ Volume Docker                    │
│                                     │
│ Backups                             │
│ ├─ /opt/flowspaces/backups/        │
│ └─ Daily @ 2 AM                     │
│                                     │
└─────────────────────────────────────┘

💾 VPS INFO
═══════════════════════════════════════════════════════════════════════════

IP Address: 85.121.48.53
SSH User: root
SSH Password: EK&a0V@txAiQeVB!SMW4
Dokploy Dashboard: http://85.121.48.53:3000

🎯 FLUX D'EXÉCUTION
═══════════════════════════════════════════════════════════════════════════

1. Lire: EXECUTE_NOW.md (3 min)
2. Run: ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh (15-20 min)
3. Lire: UPDATE_SUMMARY.md (5 min)
4. Vérifier: Tous les services running + dashboards accessible (5 min)
5. Configure: Passwords + Kuma monitors (10 min)
6. Test: Failover + alerts (5 min)
7. Docs: VPS_UPDATE_GUIDE.md si besoin (optional)

🚀 GO!
═══════════════════════════════════════════════════════════════════════════

COPY-PASTE THIS COMMAND IN YOUR TERMINAL:

ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh

THEN WAIT 15-20 MINUTES

THEN CHECK MONITORING SERVICES ARE RUNNING

DONE! 🎉

❓ Questions?
═══════════════════════════════════════════════════════════════════════════

Read:
• EXECUTE_NOW.md (quick start)
• UPDATE_SUMMARY.md (overview)
• VPS_UPDATE_GUIDE.md (details)
• VPS_BEST_PRACTICES.md (security)

Or check logs:
ssh root@85.121.48.53 'docker logs -f flowspaces'

═══════════════════════════════════════════════════════════════════════════

✅ READY? START WITH:

cat EXECUTE_NOW.md

THEN RUN:

ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh

═══════════════════════════════════════════════════════════════════════════
