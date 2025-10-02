# Deploy Landing Page to Cloudflare Pages

## 🚀 Quick Deploy (5 minutes)

### Step 1: Create Separate GitHub Repo

```bash
# Go to landing directory
cd landing

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial landing page - Task Manager"

# Create repo on GitHub: task-manager-landing
# Then push:
git remote add origin https://github.com/dev-digitaldream/task-manager-landing.git
git branch -M main
git push -u origin main
```

---

### Step 2: Connect to Cloudflare Pages

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - Select your account

2. **Create Pages Project:**
   - Workers & Pages → Create application
   - Pages → Connect to Git

3. **Select Repository:**
   - Choose: `task-manager-landing`
   - Branch: `main`

4. **Build Settings:**
   ```
   Framework preset: None
   Build command: (leave empty)
   Build output directory: /
   Root directory: /
   ```

5. **Deploy:**
   - Click "Save and Deploy"
   - Wait 1-2 minutes

---

### Step 3: Custom Domain (Optional)

1. **Add Custom Domain:**
   - Pages → Your project → Custom domains
   - Add domain: `www.digitaldream.work`
   - Cloudflare auto-configures DNS

2. **Wait for DNS propagation:**
   - Usually 1-5 minutes
   - Check: https://www.digitaldream.work

---

## ✅ Result

Your landing page will be live at:
- **Cloudflare URL:** `https://task-manager-landing.pages.dev`
- **Custom domain:** `https://www.digitaldream.work` (if configured)

---

## 🔄 Auto-Deploy

Every push to `main` branch will auto-deploy!

```bash
# Make changes
vim index.html

# Commit and push
git add .
git commit -m "Update landing page"
git push

# Cloudflare auto-deploys in 1-2 minutes
```

---

## 📊 Features

✅ **Free forever** (unlimited bandwidth)
✅ **Global CDN** (300+ locations)
✅ **Auto SSL** (HTTPS by default)
✅ **Preview deployments** (for branches)
✅ **Analytics** (free, privacy-friendly)
✅ **DDoS protection**
✅ **99.99% uptime**

---

## 🎯 What's Deployed

- `index.html` - Main page
- `style.css` - Styles with dark mode
- `script.js` - Interactions
- `README.md` - Documentation

**Total size:** ~80KB
**Load time:** <1s globally

---

## 💡 Tips

### Preview Before Deploy

```bash
# Test locally
python3 -m http.server 8080
# Open: http://localhost:8080
```

### Add Analytics

Cloudflare Pages → Your project → Analytics → Enable

### Add Screenshot

1. Take screenshot of dashboard
2. Upload to Cloudflare Images or Imgur
3. Replace URL in `index.html` line ~122

---

## 🆘 Troubleshooting

### Build fails
- Check build settings (should be empty for static site)
- Verify root directory is `/`

### 404 errors
- Ensure `index.html` is in root
- Check build output directory is `/`

### Custom domain not working
- Wait 5-10 minutes for DNS
- Check DNS records in Cloudflare
- Verify domain is active

---

## 🎉 Success!

Your landing page is now:
- ✅ Live on Cloudflare's global CDN
- ✅ Fast everywhere in the world
- ✅ Auto-deploying on git push
- ✅ Free forever

**Share it with the world!** 🌍✨
