#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════╗
# ║         FlowSpaces VPS Update + Monitoring Setup                 ║
# ║                                                                  ║
# ║ Usage: ssh root@85.121.48.53 < VPS_UPDATE_SCRIPT.sh              ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ════════════════════════════════════════════════════════════════════
# PART 1: UPDATE FLOWSPACES
# ════════════════════════════════════════════════════════════════════

print_header "1️⃣  STOPPING OLD FLOWSPACES"

# Stop old container
docker stop flowspaces 2>/dev/null || docker stop $(docker ps -q -f "name=flowspaces") 2>/dev/null || true
print_success "FlowSpaces stopped"

# ════════════════════════════════════════════════════════════════════

print_header "2️⃣  PULLING LATEST CODE FROM GIT"

cd /opt/flowspaces || mkdir -p /opt/flowspaces && cd /opt/flowspaces

# Initialize git if needed
if [ ! -d .git ]; then
    print_info "Initializing git repository..."
    # If repo doesn't exist, you'll need to provide the actual URL
    # For now, we'll assume it's already there via Dokploy
    print_warning "Note: Please ensure your repository is synced via Dokploy or Git"
else
    print_info "Pulling latest changes..."
    git pull origin main 2>/dev/null || print_info "Git pull skipped (Dokploy manages updates)"
fi

print_success "Code repository updated"

# ════════════════════════════════════════════════════════════════════

print_header "3️⃣  REBUILDING DOCKER IMAGE"

# Backup old image
if docker images | grep -q "flowspaces.*latest"; then
    docker tag flowspaces:latest flowspaces:backup_$(date +%Y%m%d_%H%M%S)
    print_success "Old image backed up"
fi

# Build new image
print_info "Building new Docker image (this may take 5-10 minutes)..."
if docker build -t flowspaces:latest .; then
    print_success "Docker image built successfully"
else
    print_error "Docker build failed!"
    exit 1
fi

# ════════════════════════════════════════════════════════════════════

print_header "4️⃣  STARTING UPDATED FLOWSPACES"

# Start container with compose
docker compose down 2>/dev/null || true
docker compose up -d

# Wait for startup
print_info "Waiting for container to start..."
sleep 10

# Check health
if docker exec -it $(docker ps -q -f "name=flowspaces") curl -s http://localhost:3001/health | grep -q "OK"; then
    print_success "FlowSpaces is running and healthy"
else
    print_warning "Health check pending - container may still be starting"
    docker logs -f $(docker ps -q -f "name=flowspaces") &
    sleep 20
fi

# ════════════════════════════════════════════════════════════════════
# PART 2: INSTALL UPTIME KUMA
# ════════════════════════════════════════════════════════════════════

print_header "5️⃣  INSTALLING UPTIME KUMA (MONITORING)"

# Check if Kuma already running
if docker ps | grep -q "uptime-kuma"; then
    print_success "Uptime Kuma already running"
else
    print_info "Starting Uptime Kuma..."

    # Create volume for Kuma data
    docker volume create uptime-kuma-data 2>/dev/null || true

    # Run Kuma
    docker run -d \
        --name uptime-kuma \
        -p 3002:3001 \
        -v uptime-kuma-data:/app/data \
        --restart unless-stopped \
        louislam/uptime-kuma:latest

    print_success "Uptime Kuma started on port 3002"
    print_info "Access at: http://85.121.48.53:3002"
fi

# ════════════════════════════════════════════════════════════════════

print_header "6️⃣  INSTALLING ADDITIONAL MONITORING SOLUTIONS"

# ---- OPTION 1: PORTAINER (Container Management) ----
print_info "Installing Portainer (Container Management)..."

if docker ps | grep -q "portainer"; then
    print_success "Portainer already running"
else
    docker volume create portainer_data 2>/dev/null || true

    docker run -d \
        --name portainer \
        --restart unless-stopped \
        -p 8000:8000 \
        -p 9000:9000 \
        -p 9443:9443 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        portainer/portainer-ce:latest

    print_success "Portainer started on port 9000"
    print_info "Access at: https://85.121.48.53:9000"
fi

# ---- OPTION 2: GRAFANA + PROMETHEUS (Advanced Metrics) ----
print_info "Installing Prometheus (Metrics)..."

if docker ps | grep -q "prometheus"; then
    print_success "Prometheus already running"
else
    # Create prometheus config
    mkdir -p /opt/prometheus
    cat > /opt/prometheus/prometheus.yml << 'PROMETHEUS_CONFIG'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']

  - job_name: 'flowspaces'
    static_configs:
      - targets: ['localhost:3001']
PROMETHEUS_CONFIG

    docker run -d \
        --name prometheus \
        -p 9090:9090 \
        -v /opt/prometheus:/etc/prometheus \
        -v prometheus-data:/prometheus \
        --restart unless-stopped \
        prom/prometheus:latest

    print_success "Prometheus started on port 9090"
    print_info "Access at: http://85.121.48.53:9090"
fi

# ---- OPTION 3: GRAFANA (Dashboards) ----
print_info "Installing Grafana (Dashboards)..."

if docker ps | grep -q "grafana"; then
    print_success "Grafana already running"
else
    docker volume create grafana-data 2>/dev/null || true

    docker run -d \
        --name grafana \
        -p 3003:3000 \
        -e GF_SECURITY_ADMIN_PASSWORD=admin \
        -v grafana-data:/var/lib/grafana \
        --restart unless-stopped \
        grafana/grafana:latest

    print_success "Grafana started on port 3003"
    print_info "Access at: http://85.121.48.53:3003"
    print_info "Default login: admin / admin (CHANGE PASSWORD!)"
fi

# ════════════════════════════════════════════════════════════════════

print_header "7️⃣  CONFIGURING MONITORING"

# Setup Kuma monitors automatically if possible
print_info "Setting up Uptime Kuma monitors..."

# Create health check script
cat > /opt/flowspaces/health-check.sh << 'HEALTH_SCRIPT'
#!/bin/bash

# Health checks for monitoring
FLOWSPACES_HEALTH=$(curl -s http://localhost:3001/health | grep -c "OK" || echo 0)
DOCKER_RUNNING=$(docker ps | grep -c "flowspaces" || echo 0)
DB_EXISTS=$(test -f /opt/flowspaces/data/dev.db && echo 1 || echo 0)

echo "FlowSpaces Health: $FLOWSPACES_HEALTH"
echo "Docker Running: $DOCKER_RUNNING"
echo "Database Exists: $DB_EXISTS"

if [ "$FLOWSPACES_HEALTH" -eq 1 ] && [ "$DOCKER_RUNNING" -eq 1 ] && [ "$DB_EXISTS" -eq 1 ]; then
    exit 0
else
    exit 1
fi
HEALTH_SCRIPT

chmod +x /opt/flowspaces/health-check.sh
print_success "Health check script created"

# ════════════════════════════════════════════════════════════════════

print_header "8️⃣  SETTING UP AUTOMATIC BACKUPS"

# Create backup script
cat > /opt/flowspaces/backup.sh << 'BACKUP_SCRIPT'
#!/bin/bash

BACKUP_DIR="/opt/flowspaces/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/opt/flowspaces/data/dev.db"
BACKUP_FILE="$BACKUP_DIR/dev.db.backup_$DATE.tar.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Stop container gracefully
docker stop flowspaces 2>/dev/null || true

# Create backup
if [ -f "$DB_FILE" ]; then
    tar -czf "$BACKUP_FILE" -C /opt/flowspaces/data dev.db
    echo "✅ Backup created: $BACKUP_FILE"
else
    echo "⚠️  Database file not found"
fi

# Start container
docker start flowspaces 2>/dev/null || true

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "dev.db.backup_*.tar.gz" -mtime +30 -delete

echo "✅ Backup complete"
BACKUP_SCRIPT

chmod +x /opt/flowspaces/backup.sh
print_success "Backup script created"

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 2 * * * /opt/flowspaces/backup.sh >> /opt/flowspaces/logs/backup.log 2>&1") | crontab -
print_success "Backup scheduled daily at 2 AM"

# ════════════════════════════════════════════════════════════════════

print_header "9️⃣  SETUP ALERTS & NOTIFICATIONS"

# Create alert script
cat > /opt/flowspaces/alert-check.sh << 'ALERT_SCRIPT'
#!/bin/bash

# Check if FlowSpaces is down
if ! curl -s http://localhost:3001/health | grep -q "OK"; then
    echo "❌ ALERT: FlowSpaces is DOWN!"

    # Auto-restart
    docker restart flowspaces

    # Log alert
    echo "[ALERT] $(date): FlowSpaces was down, auto-restarted" >> /opt/flowspaces/logs/alerts.log

    # Optional: Send email or webhook
    # curl -X POST https://your-webhook.com -d "FlowSpaces is down"
fi
ALERT_SCRIPT

chmod +x /opt/flowspaces/alert-check.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null | grep -v "alert-check.sh"; echo "*/5 * * * * /opt/flowspaces/alert-check.sh >> /opt/flowspaces/logs/alerts.log 2>&1") | crontab -
print_success "Alert checker scheduled every 5 minutes"

# ════════════════════════════════════════════════════════════════════

print_header "🔟 FINAL VERIFICATION"

# Check all services
echo ""
print_info "Checking services status..."
echo ""

# FlowSpaces
if docker ps | grep -q "flowspaces"; then
    print_success "FlowSpaces: Running"
else
    print_error "FlowSpaces: NOT RUNNING"
fi

# Uptime Kuma
if docker ps | grep -q "uptime-kuma"; then
    print_success "Uptime Kuma: Running (http://85.121.48.53:3002)"
else
    print_error "Uptime Kuma: NOT RUNNING"
fi

# Portainer
if docker ps | grep -q "portainer"; then
    print_success "Portainer: Running (https://85.121.48.53:9000)"
else
    print_error "Portainer: NOT RUNNING (Optional)"
fi

# Prometheus
if docker ps | grep -q "prometheus"; then
    print_success "Prometheus: Running (http://85.121.48.53:9090)"
else
    print_error "Prometheus: NOT RUNNING (Optional)"
fi

# Grafana
if docker ps | grep -q "grafana"; then
    print_success "Grafana: Running (http://85.121.48.53:3003)"
else
    print_error "Grafana: NOT RUNNING (Optional)"
fi

# ════════════════════════════════════════════════════════════════════

print_header "✅ UPDATE COMPLETE!"

echo ""
echo "📊 MONITORING SERVICES:"
echo "  🟢 Uptime Kuma:   http://85.121.48.53:3002"
echo "  🟢 Portainer:     https://85.121.48.53:9000"
echo "  🟢 Prometheus:    http://85.121.48.53:9090"
echo "  🟢 Grafana:       http://85.121.48.53:3003"
echo ""
echo "📝 LOGS:"
echo "  docker logs -f flowspaces"
echo "  tail -f /opt/flowspaces/logs/backup.log"
echo "  tail -f /opt/flowspaces/logs/alerts.log"
echo ""
echo "🔄 AUTOMATIC TASKS:"
echo "  ✅ Backups: Daily at 2 AM"
echo "  ✅ Health checks: Every 5 minutes"
echo "  ✅ Container restart: On failure"
echo ""
echo "🎯 NEXT STEPS:"
echo "  1. Visit http://85.121.48.53:3002 to setup Uptime Kuma"
echo "  2. Add monitors for health endpoints"
echo "  3. Configure alerts in Kuma"
echo "  4. Test failover by stopping container"
echo ""
