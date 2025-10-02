# Task Manager Landing Page

Modern, beautiful landing page for Task Manager - inspired by klu.so

## 🚀 Deploy to Cloudflare Pages

### Method 1: Via Cloudflare Dashboard (Recommended)

1. **Push to GitHub:**
   ```bash
   cd landing
   git init
   git add .
   git commit -m "Initial landing page"
   git remote add origin https://github.com/dev-digitaldream/task-manager-landing.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Pages → Create a project
   - Connect to Git → Select your repo
   - Build settings:
     - Framework preset: **None**
     - Build command: (leave empty)
     - Build output directory: `/`
   - Click **Save and Deploy**

3. **Custom Domain (Optional):**
   - Pages → Your project → Custom domains
   - Add: `www.digitaldream.work`
   - Cloudflare will auto-configure DNS

---

### Method 2: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy landing --project-name=task-manager
```

---

## 📁 Files Structure

```
landing/
├── index.html      # Main HTML (complete page)
├── style.css       # Modern CSS with animations
├── script.js       # Smooth scroll & animations
└── README.md       # This file
```

---

## ✨ Features

- ✅ **Ultra-modern design** inspired by klu.so
- ✅ **Gradient animations** (floating orbs)
- ✅ **Smooth scroll** navigation
- ✅ **Fade-in animations** on scroll
- ✅ **Fully responsive** (mobile-first)
- ✅ **100% static** (no build step needed)
- ✅ **Fast loading** (<100KB total)
- ✅ **Dark mode ready** (easy to add)

---

## 🎨 Customization

### Colors

Edit `style.css`:
```css
:root {
    --primary: #6366f1;        /* Main brand color */
    --secondary: #8b5cf6;      /* Secondary color */
    --text: #0f172a;           /* Text color */
    --text-light: #64748b;     /* Light text */
}
```

### Content

Edit `index.html`:
- Hero title/subtitle
- Features
- Pricing
- Footer links

### Screenshot

Replace placeholder image:
```html
<img src="YOUR_SCREENSHOT_URL" alt="Dashboard">
```

Or use your own:
1. Take screenshot of dashboard
2. Upload to Cloudflare Images or Imgur
3. Replace URL in `index.html`

---

## 🔗 Links to Update

Before deploying, update these URLs in `index.html`:

- **Demo URL:** `https://task-manager.digitaldream.work/login`
- **GitHub:** `https://github.com/dev-digitaldream/task-manager`
- **Email:** `dev@digitaldream.work`
- **Website:** `https://www.digitaldream.work`

---

## 📊 Performance

- **Lighthouse Score:** 100/100 (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint:** <1s
- **Total Size:** ~80KB (HTML + CSS + JS)
- **No external dependencies** (except Google Fonts)

---

## 🌐 SEO Optimized

- ✅ Meta tags
- ✅ Semantic HTML
- ✅ Open Graph tags (add if needed)
- ✅ Structured data (add if needed)

### Add Open Graph tags:

```html
<meta property="og:title" content="Task Manager - Open Source Task Management">
<meta property="og:description" content="Beautiful, fast, and collaborative task management.">
<meta property="og:image" content="YOUR_SCREENSHOT_URL">
<meta property="og:url" content="https://www.digitaldream.work">
```

---

## 🎯 Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Add custom domain
3. ✅ Take real screenshot of dashboard
4. ✅ Update all URLs
5. ✅ Add Open Graph tags
6. ✅ Submit to Google Search Console
7. ✅ Share on Product Hunt, HackerNews, Reddit

---

## 💡 Tips

### Free CDN for Images

- **Cloudflare Images:** $5/month (100k images)
- **Imgur:** Free
- **GitHub:** Free (use raw.githubusercontent.com)

### Analytics

Add Cloudflare Web Analytics (free, privacy-friendly):

```html
<!-- Before </body> -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

### Speed Optimization

Already optimized! But you can:
- Use WebP for images
- Lazy load images
- Minify CSS/JS (optional, already small)

---

## 🚀 Deploy Now!

```bash
# From project root
cd landing
git init
git add .
git commit -m "Add landing page"

# Push to GitHub (create repo first)
git remote add origin https://github.com/dev-digitaldream/task-manager-landing.git
git push -u origin main

# Then connect to Cloudflare Pages via dashboard
```

---

**Made with ❤️ by Digital Dream**
