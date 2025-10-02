# Secure Deployment Guide

## Overview

This guide explains how to deploy Todo Collaboratif securely on cPanel (todo.rauwers.cloud) or any Node.js hosting platform.

---

## Prerequisites

### 1. Server Requirements
- **Node.js** 18+ (LTS)
- **PM2** (process manager)
- **Git** (version control)
- **SSL Certificate** (Let's Encrypt via cPanel)

### 2. Required Accounts
- **Email provider** (Postmark or SendGrid for notifications)
- **Cloudinary** (for file uploads)
- **GitHub/GitLab** (for version control)

---

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

#### Step 1: Clone the repository
```bash
cd /home/rauwers
git clone https://github.com/your-username/kanban.git todo-app
cd todo-app
```

#### Step 2: Configure environment variables
```bash
# Copy and edit .env
cp server/.env.example server/.env
nano server/.env
```

**Required variables:**
```env
NODE_ENV=production
DATABASE_URL="file:/home/rauwers/todo-app/server/prisma/prod.db"
PORT=3001
CLIENT_URL=https://todo.rauwers.cloud

EMAIL_PROVIDER=postmark
POSTMARK_API_TOKEN=your_token_here
EMAIL_FROM=noreply@todo.rauwers.cloud

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

CORS_ORIGINS=https://todo.rauwers.cloud,https://www.todo.rauwers.cloud
```

#### Step 3: Make deploy script executable
```bash
chmod +x deploy.sh
```

#### Step 4: Run deployment
```bash
./deploy.sh production
```

This will:
- Install dependencies
- Generate Prisma Client
- Run database migrations
- Build frontend
- Copy files to server/public
- Start/restart PM2 process

---

### Method 2: Manual Deployment

#### Step 1: Install dependencies
```bash
# Server
cd server
npm ci --production

# Client
cd ../client
npm ci
```

#### Step 2: Generate Prisma Client & Migrate
```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

#### Step 3: Build frontend
```bash
cd client
npm run build
cp -r dist/* ../server/public/
```

#### Step 4: Start server with PM2
```bash
cd server
pm2 start src/server.js --name todo-server --env production
pm2 save
pm2 startup  # First time only
```

---

## cPanel Setup

### 1. Node.js App Configuration

**In cPanel:**
1. Go to **Software** → **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x (latest LTS)
   - **Application mode**: Production
   - **Application root**: `/home/rauwers/todo-app/server`
   - **Application URL**: `todo.rauwers.cloud`
   - **Application startup file**: `src/server.js`
   - **Environment variables**: Add from `.env`

4. Click **Create**

### 2. SSL Certificate

**Enable HTTPS (required for Outlook extension):**
1. Go to **Security** → **SSL/TLS Status**
2. Enable **AutoSSL** (Let's Encrypt)
3. Or manually install SSL certificate

### 3. Firewall & Port Configuration

**Allow port 3001:**
1. Go to **Security** → **cPHulk Brute Force Protection**
2. Whitelist your IP
3. Or configure firewall rules to allow port 3001

### 4. Cron Jobs (Optional)

**For deadline reminders and recurring tasks:**
```bash
# Run every hour to generate recurring tasks and send reminders
0 * * * * cd /home/rauwers/todo-app/server && node src/cron/deadline-reminders.js
```

---

## Git Deployment Workflow

### Initial Setup

```bash
# On local machine
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/kanban.git
git push -u origin main
```

### Continuous Deployment

**On server (cPanel SSH):**
```bash
cd /home/rauwers/todo-app
git pull origin main
./deploy.sh production
```

**Or automate with a webhook:**
Create `webhook.php` in `/home/rauwers/public_html/`:
```php
<?php
// Verify GitHub webhook secret
$secret = 'your_webhook_secret';
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$payload = file_get_contents('php://input');

if (!hash_equals('sha256=' . hash_hmac('sha256', $payload, $secret), $signature)) {
    http_response_code(403);
    exit('Forbidden');
}

// Execute deployment
exec('cd /home/rauwers/todo-app && git pull origin main && ./deploy.sh production > /tmp/deploy.log 2>&1 &');

http_response_code(200);
echo 'Deployment triggered';
?>
```

**Configure webhook in GitHub:**
1. Go to **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://todo.rauwers.cloud/webhook.php`
3. **Content type**: `application/json`
4. **Secret**: `your_webhook_secret`
5. **Events**: Just the push event

---

## Security Checklist

### ✅ Environment Variables
- [x] Never commit `.env` files
- [x] Use strong secrets (32+ chars)
- [x] Rotate secrets regularly
- [x] Use different secrets for dev/staging/production

### ✅ HTTPS
- [x] SSL certificate installed
- [x] Force HTTPS redirect
- [x] HSTS header enabled

### ✅ CORS
- [x] Restrict origins to production domains
- [x] No wildcard (*) in production
- [x] Whitelist Outlook domains for extension

### ✅ Rate Limiting
- [x] API endpoints rate-limited
- [x] Login attempts limited
- [x] File upload size limited

### ✅ Database
- [x] Regular backups
- [x] Migrations versioned
- [x] No raw SQL from user input

### ✅ Dependencies
- [x] Keep packages updated
- [x] Use `npm audit` regularly
- [x] Lock versions with `package-lock.json`

### ✅ Secrets Management
- [x] JWT tokens expire
- [x] Session secrets rotated
- [x] API keys stored in `.env` only

---

## Monitoring & Maintenance

### PM2 Commands
```bash
# View logs
pm2 logs todo-server

# Monitor resources
pm2 monit

# Restart app
pm2 restart todo-server

# Stop app
pm2 stop todo-server

# View status
pm2 status

# Clear logs
pm2 flush
```

### Health Checks
```bash
# API health
curl https://todo.rauwers.cloud/api/users

# Server status
curl https://todo.rauwers.cloud/health
```

### Database Backup
```bash
# Backup SQLite database
cp server/prisma/prod.db server/prisma/backup-$(date +%Y%m%d).db

# Or automate with cron (daily at 2 AM)
0 2 * * * cp /home/rauwers/todo-app/server/prisma/prod.db /home/rauwers/backups/db-$(date +\%Y\%m\%d).db
```

### Log Rotation
```bash
# Install logrotate (if not installed)
sudo apt install logrotate

# Configure PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Rollback Strategy

### Quick Rollback
```bash
# Revert to previous commit
git reset --hard HEAD~1
./deploy.sh production

# Or restore from backup
pm2 stop todo-server
cp server/prisma/backup-20251001.db server/prisma/prod.db
pm2 restart todo-server
```

### Canary Deployment (Optional)
Run two versions simultaneously:
```bash
# Current version (port 3001)
pm2 start src/server.js --name todo-server-v1 --env production

# New version (port 3002)
PORT=3002 pm2 start src/server.js --name todo-server-v2 --env production

# Switch traffic with reverse proxy (nginx/cPanel)
```

---

## Performance Optimization

### 1. Enable Compression
```javascript
// server/src/server.js
const compression = require('compression')
app.use(compression())
```

### 2. Static File Caching
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}))
```

### 3. Database Optimization
```bash
# SQLite VACUUM (reclaim space)
sqlite3 server/prisma/prod.db "VACUUM;"

# Add indexes (if needed)
npx prisma migrate dev --create-only --name add_indexes
```

### 4. PM2 Cluster Mode
```bash
# Run multiple instances (use CPU cores)
pm2 start src/server.js --name todo-server -i max
```

---

## Troubleshooting

### Issue: PM2 process crashes
```bash
# Check logs
pm2 logs todo-server --lines 100

# Check error logs
tail -f /home/rauwers/.pm2/logs/todo-server-error.log

# Restart with debug
DEBUG=* pm2 restart todo-server
```

### Issue: Port 3001 already in use
```bash
# Find process using port
lsof -ti :3001

# Kill process
kill -9 $(lsof -ti :3001)

# Or restart PM2
pm2 restart todo-server
```

### Issue: Database locked
```bash
# SQLite can't handle concurrent writes
# Solution: Use PostgreSQL for production (recommended)
# Or ensure only one PM2 instance (no cluster mode)
```

### Issue: CORS errors
```bash
# Check CORS_ORIGINS in .env
# Ensure origins match exactly (no trailing slash)
# Example: https://todo.rauwers.cloud NOT https://todo.rauwers.cloud/
```

---

## Migration to PostgreSQL (Recommended for Production)

### 1. Setup PostgreSQL
```bash
# cPanel: Create database via MySQL Databases (PostgreSQL equivalent)
# Or use external service: Neon, Supabase, DigitalOcean
```

### 2. Update Prisma schema
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Update .env
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### 4. Migrate
```bash
npx prisma migrate dev
npx prisma migrate deploy
```

---

## Support & Resources

- **Documentation**: `/PROJECT_STATUS.md`
- **API Docs**: `/API.md` (to create)
- **Changelog**: `/CHANGELOG.md` (to create)
- **Issues**: GitHub Issues
- **Email**: support@rauwers.cloud

---

## License

Proprietary — All rights reserved
