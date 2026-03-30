# Deployment Guide - Metra Innovations

This guide will help you deploy the Metra Innovations website to GitHub and Vercel.

## 📋 Prerequisites

- Git installed on your computer
- GitHub account
- Vercel account (free tier is sufficient)

## 🚀 Step-by-Step Deployment

### Step 1: Initialize Git Repository

Open Command Prompt or PowerShell in the project folder:

```bash
cd "C:\Users\Thando Hlomuka\Desktop\Metra-Innovations"
git init
```

### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Repository name: `metra-innovations` (or your preferred name)
4. Description: "Metra Innovations - South African Software Development Company"
5. Choose Public or Private
6. **Do NOT** initialize with README (we already have one)
7. Click "Create repository"

### Step 3: Connect Local Repository to GitHub

Copy and run these commands from GitHub's instructions:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/metra-innovations.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Find and import your `metra-innovations` repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: (leave empty)
   - **Output Directory**: `./` (leave empty)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 5: Configure Custom Domain (Optional)

1. Purchase a domain (e.g., from GoDaddy, Namecheap)
2. In Vercel dashboard, go to your project settings
3. Click "Domains"
4. Add your domain: `metra-innovations.co.za`
5. Configure DNS records at your domain registrar:
   - **Type**: A Record
   - **Name**: @
   - **Value**: `76.76.21.21`
   - **TTL**: Automatic
6. Wait for DNS propagation (up to 48 hours)

## 📁 Project Structure

```
metra-innovations/
├── index.html          # Main HTML file
├── styles.css          # All styles
├── script.js           # All JavaScript
├── 404.html           # Custom 404 page
├── sitemap.xml        # SEO sitemap
├── robots.txt         # Crawler instructions
├── .htaccess          # Apache configuration
├── README.md          # Project documentation
├── DEPLOYMENT.md      # This file
└── .gitignore         # Git ignore rules
```

## 🔧 Build Configuration

This is a **static website** with no build process required. All files are ready to serve as-is.

### Vercel Settings

No `vercel.json` needed! Vercel automatically detects and serves static files.

**Default Configuration:**
- Build Command: None (static files)
- Output Directory: `./` (root)
- Install Command: None (no dependencies)

## 🌐 URLs After Deployment

After deployment, your site will be available at:

- **Vercel URL**: `https://metra-innovations.vercel.app`
- **Custom Domain**: `https://www.metra-innovations.co.za` (if configured)

## ✅ Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test contact form functionality
- [ ] Verify admin dashboard access
- [ ] Check mobile responsiveness
- [ ] Test all navigation links
- [ ] Verify social sharing works
- [ ] Test WhatsApp and call buttons
- [ ] Check 404 page works
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)
- [ ] Configure Google Business Profile

## 🔄 Updating Your Website

### Make Changes

1. Edit files locally
2. Test changes in browser
3. Commit changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will **automatically redeploy** when you push to GitHub!

### Force Redeploy

If needed, trigger a redeploy from Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click the three dots on latest deployment
4. Click "Redeploy"

## 📊 Environment Variables (If Needed)

This project uses localStorage for data persistence, so no environment variables are required.

If you add backend features later, add environment variables in:
- Vercel Dashboard → Project Settings → Environment Variables

## 🐛 Troubleshooting

### Site Not Loading

1. Check build logs in Vercel dashboard
2. Verify all files are pushed to GitHub
3. Check browser console for errors

### 404 on Page Refresh

This is a static site with hash-based routing. All routes work via `index.html#section`.

### CSS/JS Not Loading

Check file paths in HTML. They should be relative:
- ✅ `<link rel="stylesheet" href="styles.css">`
- ✅ `<script src="script.js"></script>`
- ❌ `<link rel="stylesheet" href="/styles.css">`

### Admin Dashboard Not Working

Admin data is stored in browser localStorage. Data persists on the same device/browser.

## 📈 Performance Optimization

The site is already optimized, but you can:

1. **Enable Vercel Analytics** (free)
   - Dashboard → Analytics → Enable

2. **Add Compression**
   - Vercel automatically enables Gzip/Brotli

3. **Enable Caching**
   - Vercel provides automatic CDN caching

## 🔒 Security

- HTTPS is automatic on Vercel
- CSP headers are configured in `.htaccess`
- All external resources use HTTPS

## 📞 Support

For deployment issues:
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- GitHub Support: [docs.github.com](https://docs.github.com)

---

**Ready to deploy?** Start with Step 1 above! 🚀
