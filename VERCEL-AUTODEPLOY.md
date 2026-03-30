# Vercel Auto-Deploy Configuration Guide

## ✅ Auto-Deploy is Configured!

Your website is now configured for **automatic deployment** on Vercel. Every push to the `main` branch will automatically trigger a deployment.

---

## 🚀 How Auto-Deploy Works

### Vercel GitHub Integration (Primary Method)

When you connect your repository to Vercel:

1. **Push to GitHub** → You push code to `main` branch
2. **GitHub Webhook** → GitHub notifies Vercel
3. **Vercel Builds** → Vercel automatically builds your site
4. **Deploy Live** → New version goes live in seconds

**No GitHub Actions needed!** Vercel handles everything automatically.

---

## 📋 Setup Steps

### Step 1: Connect Repository to Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Sign in with GitHub
3. Click **"Import Git Repository"**
4. Find and select `ThandoHlomuka/metra-innovations`
5. Click **"Import"**
6. Click **"Deploy"**

### Step 2: Verify Auto-Deploy is Enabled

After connecting:

1. Go to your project on Vercel: **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click on `metra-innovations`
3. Go to **Settings** → **Git**
4. Ensure **"Auto-Deploy"** is enabled for `main` branch

---

## 🔄 How to Trigger Auto-Deploy

### Make Changes and Push

```bash
# Make your changes to files
# Then:

git add .
git commit -m "Description of changes"
git push origin main
```

### Vercel Will Automatically:

1. Detect the push
2. Start building (takes ~10-30 seconds)
3. Deploy to production
4. Update your live site

---

## 📊 Monitor Deployments

### Vercel Dashboard
- **URL**: https://vercel.com/ThandoHlomuka/metra-innovations
- View all deployments
- Check build logs
- Rollback if needed

### GitHub Checks
- Go to your repository
- Click on **"Actions"** tab
- See deployment status

---

## 🔧 Configuration Files

### vercel.json
Configures how Vercel builds and deploys your site:

```json
{
  "framework": null,
  "buildCommand": null,
  "outputDirectory": null,
  "github": {
    "silent": false
  }
}
```

**Settings:**
- `framework: null` - Static site (no build process)
- `buildCommand: null` - No build command needed
- `outputDirectory: null` - Serve from root directory
- `github.silent: false` - Show deployment status on GitHub

### .github/workflows/vercel-deploy.yml
Optional GitHub Actions workflow for advanced deployment control.

**Note:** This is optional! Vercel's GitHub integration handles auto-deploy automatically. Use this only if you need custom deployment logic.

---

## 🎯 Deployment URLs

After connecting to Vercel:

- **Production**: `https://metra-innovations.vercel.app`
- **Preview**: Auto-generated for pull requests
- **Custom Domain**: Configure in Vercel settings

---

## ⚡ Quick Test

Test auto-deploy right now:

```bash
# Make a small change
echo "<!-- Test -->" >> index.html

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Then check: **vercel.com/dashboard**

You should see a new deployment starting!

---

## 🔐 Environment Variables (If Needed)

If you add features that need environment variables:

1. Go to Vercel Dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add variables
5. Redeploy

**Current project doesn't need any environment variables!**

---

## 📱 Deployment Notifications

### Enable Notifications:

1. Vercel Dashboard → **Account Settings** → **Notifications**
2. Choose:
   - Email notifications
   - Slack notifications
   - GitHub status checks

### GitHub Status Checks:

Vercel will automatically post deployment status to GitHub:
- ✅ Success checkmark on commits
- ❌ Failed deployment alerts
- 🔗 Direct link to live preview

---

## 🐛 Troubleshooting

### Auto-Deploy Not Triggering?

1. Check **Settings** → **Git** in Vercel
2. Ensure `main` branch is selected
3. Check GitHub webhooks: **Repository Settings** → **Webhooks**
4. Verify Vercel webhook exists and is active

### Build Fails?

1. Check build logs in Vercel dashboard
2. Verify all file paths are correct
3. Ensure no syntax errors in HTML/CSS/JS

### Site Not Updating?

1. Clear browser cache (Ctrl+Shift+R)
2. Check deployment status on Vercel
3. Verify you pushed to `main` branch

---

## 📊 Deployment Features

### Automatic Features:

- ✅ **HTTPS** - Automatic SSL certificate
- ✅ **CDN** - Global edge network
- ✅ **Compression** - Gzip and Brotli
- ✅ **Caching** - Automatic cache headers
- ✅ **Preview Deployments** - For pull requests
- ✅ **Rollbacks** - Instant rollback to previous versions

---

## 🎉 Success!

Once connected, your workflow is:

1. **Code** → Make changes locally
2. **Commit** → `git commit -m "Changes"`
3. **Push** → `git push origin main`
4. **Deploy** → Vercel auto-deploys
5. **Live** → Site updates in seconds!

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)

---

**Your auto-deploy is ready! Just connect to Vercel and push!** 🚀
