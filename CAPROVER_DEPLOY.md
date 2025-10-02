# CapRover Deployment Guide

Deploy Task Manager to CapRover in minutes!

---

## 🚀 Quick Deploy

### Method 1: From GitHub (Recommended)

1. **Create App on CapRover**
   - Go to your CapRover dashboard
   - Click "Apps" → "One-Click Apps/Databases"
   - Or create a new app manually

2. **Configure App**
   ```
   App Name: task-manager
   Has Persistent Data: ✅ YES
   ```

3. **Connect GitHub**
   - Go to "Deployment" tab
   - Select "Method 3: Deploy from Github/Bitbucket/Gitlab"
   - Repository: `https://github.com/dev-digitaldream/task-manager`
   - Branch: `main`
   - Username: `dev-digitaldream`
   - Password/Token: (your GitHub token)

4. **Deploy!**
   - Click "Save & Update"
   - CapRover will automatically build and deploy

---

### Method 2: Manual Deploy (Tarball)

```bash
# 1. Install CapRover CLI (if not installed)
npm install -g caprover

# 2. Login to your CapRover
caprover login

# 3. Deploy
caprover deploy
```

When prompted:
- App Name: `task-manager`
- Branch: `main` (or press Enter)

---

## ⚙️ Environment Variables

After deployment, set these in CapRover:

### Required
```bash
NODE_ENV=production
PORT=80
DATABASE_URL=file:/app/data/dev.db
```

### Optional (for production features)
```bash
# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-here

# Session Secret
SESSION_SECRET=your-session-secret

# Email (Postmark)
POSTMARK_API_KEY=your-key
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# CORS (your domain)
CORS_ORIGIN=https://task-manager.yourdomain.com
```

---

## 🔧 Post-Deployment Setup

### 1. Enable HTTPS
- Go to "HTTP Settings"
- Enable "HTTPS"
- Enable "Force HTTPS"
- Enable "Websocket Support" ✅ (important for real-time!)

### 2. Set Custom Domain (Optional)
- Go to "HTTP Settings"
- Add your domain: `task.yourdomain.com`
- Update DNS: Point to your CapRover IP

### 3. Configure Persistent Storage
- CapRover automatically creates `/app/data` volume
- Database persists across deployments ✅

---

## 📊 Demo Data

The app auto-seeds with demo data on first run:

**Demo Credentials:**
- Email: `demo@digitaldream.work`
- Password: `Demo2024!`

**Admin Credentials:**
- Email: `admin@digitaldream.work`
- Password: `Admin2024!`

**Includes:**
- 4 users
- 10 sample tasks
- 3 comments
- 7 public tasks (visible on dashboard)

---

## 🧪 Testing Deployment

### 1. Check Health
```bash
curl https://your-app.yourdomain.com/health
```

Expected response:
```json
{"status":"OK","timestamp":"2025-10-02T..."}
```

### 2. Test Login
- Go to `/login`
- Use demo credentials
- Should see dashboard with tasks

### 3. Test Public Dashboard
- Go to `/dashboard`
- Should see public tasks (no login required)

---

## 🔍 Troubleshooting

### App won't start
**Check logs:**
```bash
caprover logs task-manager
```

**Common issues:**
- Missing `captain-definition` → Fixed ✅
- Websocket not enabled → Enable in HTTP Settings
- Database permission → Check `/app/data` volume

### Database not seeding
**Manual seed:**
```bash
# SSH into container
caprover run task-manager sh

# Run seed
cd /app/server
node src/seed-demo.js
```

### Real-time not working
**Enable WebSocket:**
- CapRover → App → HTTP Settings
- ✅ Enable Websocket Support

---

## 📦 Update Deployment

### Auto-deploy from GitHub
1. Push changes to GitHub
2. CapRover auto-deploys (if webhook configured)

### Manual update
```bash
git pull
caprover deploy
```

---

## 🗄️ Database Management

### Backup Database
```bash
# SSH into container
caprover run task-manager sh

# Copy database
cp /app/data/dev.db /app/data/backup-$(date +%Y%m%d).db

# Download (from CapRover dashboard)
# Files → /app/data/dev.db → Download
```

### Reset Database
```bash
# SSH into container
caprover run task-manager sh

# Remove database
rm /app/data/dev.db

# Restart app (will auto-seed)
exit
# Then restart from CapRover dashboard
```

---

## 🚀 Production Checklist

Before going live:

- [ ] HTTPS enabled
- [ ] Force HTTPS enabled
- [ ] WebSocket support enabled
- [ ] Custom domain configured
- [ ] Environment variables set
- [ ] Database backup configured
- [ ] Health check passing
- [ ] Demo credentials tested
- [ ] Public dashboard accessible
- [ ] Real-time sync working

---

## 📞 Support

**Issues?**
- Check logs: `caprover logs task-manager`
- GitHub Issues: https://github.com/dev-digitaldream/task-manager/issues
- Email: dev@digitaldream.work

---

## 🎉 Success!

Your Task Manager is now live! 

**Next steps:**
1. Share demo URL with team
2. Test all features
3. Customize branding
4. Launch publicly!

---

**Made with ❤️ by [Digital Dream](https://www.digitaldream.work)**
