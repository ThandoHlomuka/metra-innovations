# 🚀 Vercel Auto-Deployment Guide

## Automated Deployment from GitHub to Vercel

This project is configured for **automatic deployment** to Vercel whenever you push to the `main` branch.

---

## ✅ Setup Complete - What's Configured

### 1. GitHub Actions Workflow
- **File**: `.github/workflows/vercel-deploy.yml`
- **Triggers**: Push to `main` branch
- **Action**: Automatically deploys to Vercel Production

### 2. Vercel Configuration
- **File**: `vercel.json`
- **Features**:
  - Security headers (X-Frame-Options, X-XSS-Protection, etc.)
  - Cache-Control headers for static assets
  - Font caching with CORS
  - GitHub integration enabled

### 3. Performance Optimizations
- Critical CSS inlined
- Non-render-blocking resources
- Image optimization attributes
- Content visibility for below-fold sections

---

## 🔧 Vercel Setup Steps (One-Time)

### Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose **GitHub** and authorize Vercel
5. Select repository: `ThandoHlomuka/metra-innovations`
6. Click **"Import"**

### Step 2: Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other |
| **Build Command** | (leave empty) |
| **Output Directory** | (leave empty) |
| **Install Command** | (leave empty) |

### Step 3: Add Environment Variables (if needed)

For GitHub Actions deployment, add these to GitHub Secrets:

1. Go to GitHub → Repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN` - Get from [Vercel Account → Settings → Tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Found in Vercel project settings
   - `VERCEL_PROJECT_ID` - Found in Vercel project settings

### Step 4: Deploy

Click **"Deploy"** and Vercel will:
- Build your project
- Deploy to production
- Enable auto-deployment on every push to `main`

---

## 🔄 How Auto-Deployment Works

```
Push to GitHub main branch
        ↓
GitHub Actions triggers
        ↓
Runs vercel-deploy.yml workflow
        ↓
Deploys to Vercel Production
        ↓
Live URL updated (usually 30-60 seconds)
```

---

## 📊 Deployment Status

### Check Deployment Status

1. **GitHub Actions**: 
   - Visit: `https://github.com/ThandoHlomuka/metra-innovations/actions`
   - View workflow runs and deployment logs

2. **Vercel Dashboard**:
   - Visit: `https://vercel.com/dashboard`
   - View deployment history and status

3. **Preview URLs**:
   - Production: `https://metra-innovations.co.za`
   - Preview: `https://metra-innovations-git-main-*.vercel.app`

---

## 🛠 Manual Deployment (Optional)

If you need to deploy manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

---

## 📈 Post-Deployment Checklist

- [ ] Verify site loads correctly at production URL
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Check sitemap.xml is accessible
- [ ] Verify robots.txt is working
- [ ] Test all navigation links
- [ ] Check mobile responsiveness

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub Actions | https://github.com/ThandoHlomuka/metra-innovations/actions |
| PageSpeed Insights | https://pagespeed.web.dev/ |
| Vercel Documentation | https://vercel.com/docs |

---

## 🐛 Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs for errors
2. Verify Vercel token is valid
3. Ensure `vercel.json` is valid JSON

### Site Not Updating

1. Clear browser cache (Ctrl+Shift+R)
2. Check Vercel deployment status
3. Verify push was to `main` branch

### GitHub Actions Not Triggering

1. Check workflow is enabled in GitHub Actions tab
2. Verify branch name is `main`
3. Check secrets are configured correctly

---

**Last Updated**: 2026-04-01
**Version**: 2.0 (Performance Optimized)
