# 🚀 Quick Start - Deploy to Cloudflare Pages

## Step 1: Create GitHub Repo

1. **Go to GitHub:** https://github.com/new

2. **Create repo:**
   - Repository name: `task-manager-landing`
   - Description: `Modern landing page for Task Manager`
   - Public ✅
   - **DON'T** initialize with README
   - Click "Create repository"

---

## Step 2: Push Code

```bash
# You're already in the landing directory with git initialized!
# Just add the remote and push:

git remote add origin https://github.com/dev-digitaldream/task-manager-landing.git
git push -u origin main
```

**Done!** ✅ Code is on GitHub

---

## Step 3: Deploy to Cloudflare Pages

### 3.1 Go to Cloudflare Dashboard
- URL: https://dash.cloudflare.com
- Login with your account

### 3.2 Create Pages Project
1. Click **Workers & Pages** (left sidebar)
2. Click **Create application**
3. Select **Pages** tab
4. Click **Connect to Git**

### 3.3 Connect Repository
1. **Connect GitHub** (if first time)
   - Authorize Cloudflare
   - Select repositories: `task-manager-landing`

2. **Configure build:**
   ```
   Project name: task-manager-landing
   Production branch: main
   
   Build settings:
   ├─ Framework preset: None
   ├─ Build command: (leave empty)
   ├─ Build output directory: /
   └─ Root directory: (leave empty or /)
   ```

3. **Click "Save and Deploy"**

### 3.4 Wait for Deploy
- Build time: ~30 seconds
- Status: Building → Success ✅

---

## Step 4: Access Your Site

**Your landing page is live!**

**Cloudflare URL:**
```
https://task-manager-landing.pages.dev
```

**Test it:**
- Open in browser
- Should see dark mode by default
- Test mobile menu (resize window)
- Test dark/light toggle (bottom right)

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain
1. Pages → `task-manager-landing` → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `www.digitaldream.work`
4. Click **Continue**

### 5.2 DNS Configuration
Cloudflare will automatically:
- Create CNAME record
- Enable SSL
- Configure CDN

**Wait 2-5 minutes** for DNS propagation

### 5.3 Test
```
https://www.digitaldream.work
```

---

## ✅ Checklist

- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Cloudflare Pages project created
- [ ] First deployment successful
- [ ] Site accessible via .pages.dev URL
- [ ] Custom domain added (optional)
- [ ] Dark mode works
- [ ] Mobile menu works
- [ ] All links work

---

## 🔄 Future Updates

**To update the landing page:**

```bash
# Make changes
vim index.html

# Commit and push
git add .
git commit -m "Update content"
git push

# Cloudflare auto-deploys in ~30 seconds!
```

---

## 📊 What You Get

✅ **Global CDN** (300+ locations)
✅ **Free SSL** (automatic HTTPS)
✅ **Unlimited bandwidth**
✅ **DDoS protection**
✅ **Analytics** (privacy-friendly)
✅ **Preview deployments** (for branches)
✅ **Auto-deploy** on git push

---

## 🎯 Next Steps

1. **Take screenshot** of your dashboard
2. **Upload** to Imgur or Cloudflare Images
3. **Replace** placeholder in `index.html`
4. **Push** update
5. **Share** your landing page! 🎉

---

**Need help?** Check DEPLOY_CLOUDFLARE.md for detailed instructions.
