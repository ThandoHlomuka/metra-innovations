# 🚀 Vercel Auto-Deployment Guide

## ⚡ Quick Start (Recommended - 2 Minutes)

**The easiest way to enable auto-deployment:**

1. **Run the setup script** (Windows):
   ```
   Double-click: vercel-deploy-setup.bat
   ```
   Then select option 1.

2. **OR manually connect at Vercel:**
   - Go to: https://vercel.com/new
   - Click **"Import Git Repository"**
   - Select **GitHub** → Authorize Vercel
   - Choose: `ThandoHlomuka/metra-innovations`
   - Click **"Deploy"**

**That's it!** Every push to `main` will automatically deploy to Vercel.

---

## ✅ What's Already Configured

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel config with security headers, caching, CSP |
| `.github/workflows/vercel-deploy.yml` | GitHub Actions workflow (optional) |
| `vercel-deploy-setup.bat` | One-click setup script |

---

## 🔧 Two Deployment Options

### Option 1: Vercel Native Integration ⭐ RECOMMENDED

**Benefits:**
- ✅ No configuration needed
- ✅ Automatic deployments in 30-60 seconds
- ✅ Preview deployments for pull requests
- ✅ Managed by Vercel (more reliable)

**Setup Steps:**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in (create account if needed)
3. Click **"Import Git Repository"**
4. Select **GitHub** and authorize Vercel access
5. Find and select: `ThandoHlomuka/metra-innovations`
6. Click **"Import"**
7. Keep default settings:
   - **Framework Preset:** Other
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
8. Click **"Deploy"**

### Option 2: GitHub Actions (Advanced)

**Benefits:**
- ✅ More control over deployment process
- ✅ Can add custom steps

**Requirements:**
- Vercel account with API token
- GitHub secrets configured

**Setup Steps:**

1. **Get Vercel Token:**
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Click **"Create Token"**
   - Copy the token

2. **Add GitHub Secrets:**
   - Go to GitHub → `ThandoHlomuka/metra-innovations` → Settings
   - Navigate to: **Secrets and variables** → **Actions**
   - Add these secrets:

   | Secret Name | Value |
   |-------------|-------|
   | `VERCEL_TOKEN` | Your Vercel API token |
   | `VERCEL_ORG_ID` | From Vercel project settings |
   | `VERCEL_PROJECT_ID` | From Vercel project settings |

3. **Trigger Deployment:**
   - Push to `main` branch
   - Or manually trigger from Actions tab

---

## 🔄 How Auto-Deployment Works

### Vercel Native (Option 1):
```
Push to GitHub main branch
        ↓
GitHub sends webhook to Vercel
        ↓
Vercel builds and deploys
        ↓
Live URL updated (~30 seconds)
```

### GitHub Actions (Option 2):
```
Push to GitHub main branch
        ↓
GitHub Actions workflow triggers
        ↓
Runs vercel-deploy.yml
        ↓
Deploys to Vercel Production
        ↓
Live URL updated (~60 seconds)
```

---

## 📊 Check Deployment Status

| Where | URL |
|-------|-----|
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Vercel Deployments** | https://vercel.com/[your-project]/deployments |
| **GitHub Actions** | https://github.com/ThandoHlomuka/metra-innovations/actions |

---

## 🧪 Test Auto-Deployment

Make a small change to test:

```bash
# Make a small change
echo "<!-- Test deployment -->" >> index.html

# Commit and push
git add index.html
git commit -m "test: trigger auto-deployment"
git push origin main
```

Then check:
1. **Vercel Dashboard** - Should show "Building" or "Ready"
2. **Your live site** - Should reflect changes in 30-60 seconds

---

## 🛠 Manual Deployment (Fallback)

If auto-deployment fails:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## 🐛 Troubleshooting

### Vercel Not Auto-Deploying

1. **Check if connected:**
   - Go to vercel.com/dashboard
   - Is your project listed?
   - If not, follow Option 1 setup above

2. **Check webhook:**
   - GitHub → Settings → Webhooks
   - Should have a Vercel webhook
   - If not, reconnect at vercel.com/new

3. **Check branch:**
   - Auto-deploy only works for `main` branch
   - Push to main: `git push origin main`

### GitHub Actions Failing

1. **Check secrets:**
   - Verify VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
   - Ensure no extra spaces in values

2. **Check workflow:**
   - GitHub → Actions tab
   - Is workflow enabled?
   - Check logs for specific errors

3. **Reinstall Vercel CLI:**
   ```bash
   npm uninstall -g vercel
   npm install -g vercel@latest
   ```

### Deployment Succeeds But Site Not Updating

1. **Clear browser cache:** Ctrl+Shift+R (hard refresh)
2. **Check Vercel cache:** Add cache-busting query to URL
3. **Wait 1-2 minutes:** CDN propagation can take time

---

## 📈 Post-Deployment Checklist

After first deployment:

- [ ] Site loads at production URL
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Check sitemap.xml is accessible
- [ ] Verify robots.txt is working
- [ ] Test all navigation links
- [ ] Check mobile responsiveness
- [ ] Verify security headers (use securityheaders.com)

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Vercel GitHub Integration | https://vercel.com/docs/git |
| GitHub Actions | https://github.com/ThandoHlomuka/metra-innovations/actions |
| PageSpeed Insights | https://pagespeed.web.dev/ |
| Vercel CLI Docs | https://vercel.com/docs/cli |

---

## 📞 Need Help?

1. **Vercel Documentation:** https://vercel.com/docs
2. **GitHub Actions Docs:** https://docs.github.com/actions
3. **Run Setup Script:** `vercel-deploy-setup.bat`

---

**Last Updated:** 2026-04-01
**Version:** 3.0 (Auto-Deploy Configured)
