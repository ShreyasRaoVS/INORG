# 🚀 Deploy to Vercel (Free) - Complete Guide

## Architecture Overview

Since Vercel's free tier doesn't support long-running WebSocket servers, we'll use a **split deployment**:

- **Vercel**: Frontend (React app) - FREE
- **Railway**: Backend API + Database + Redis - FREE tier available

This is actually a **better architecture** for production scaling!

```
┌─────────────────────────────────────────┐
│  Users                                  │
└────────┬──────────────────┬─────────────┘
         │                  │
         │ (Static Files)   │ (API Calls)
         ▼                  ▼
    ┌─────────┐       ┌──────────────┐
    │ Vercel  │       │   Railway    │
    │ (React) │◄──────┤ (Node.js API)│
    └─────────┘       │   PostgreSQL │
         FREE         │   Redis      │
                      └──────────────┘
                           FREE
```

---

## Step 1: Deploy Backend to Railway (5 minutes)

### 1.1 Create Railway Account

1. Go to https://railway.app
2. Sign in with GitHub

### 1.2 Deploy Backend

1. Click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Choose your repository
4. Railway will auto-detect Node.js

### 1.3 Add Services

1. Click **"New"** → **"Database"** → **"PostgreSQL"**
2. Click **"New"** → **"Database"** → **"Redis"**

### 1.4 Configure Environment Variables

In Railway project settings, add:

```bash
NODE_ENV=production
PORT=5000
INSTANCE_ID=railway-instance-1

# These are auto-filled by Railway:
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Add these manually:
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars
CORS_ORIGIN=https://your-app-name.vercel.app

# Optional:
OPENAI_API_KEY=your-openai-key-if-you-have-one
```

### 1.5 Deploy Settings

Railway should auto-detect these, but verify:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `/` (or leave empty)

### 1.6 Initialize Database

Once deployed, open Railway's terminal and run:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

### 1.7 Copy Your API URL

After deployment, Railway gives you a URL like:
```
https://your-project.up.railway.app
```

**Save this URL!** You'll need it for Vercel.

---

## Step 2: Deploy Frontend to Vercel (3 minutes)

### 2.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign in with GitHub

### 2.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Vercel will auto-detect framework

### 2.3 Configure Build Settings

Vercel should detect these automatically:

- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.4 Add Environment Variable

Click **"Environment Variables"** and add:

```
Name:  VITE_API_URL
Value: https://your-project.up.railway.app/api
```

Replace with your actual Railway URL from Step 1.7.

### 2.5 Deploy

Click **"Deploy"** and wait ~2 minutes.

Your frontend will be live at:
```
https://your-app-name.vercel.app
```

---

## Step 3: Update Backend CORS (Important!)

### 3.1 Update Railway Environment

Go back to Railway → Your project → Variables

Update `CORS_ORIGIN` with your Vercel URL:

```bash
CORS_ORIGIN=https://your-app-name.vercel.app,https://your-app-name-git-main.vercel.app
```

**Note**: Include both production and preview URLs!

### 3.2 Redeploy Backend

Railway will auto-redeploy after you save the environment variable.

---

## Step 4: Test Your Deployment

### 4.1 Test Backend Health

```bash
curl https://your-project.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### 4.2 Test Frontend

1. Visit `https://your-app-name.vercel.app`
2. You should see the beautiful login page
3. Try logging in with: `admin@inorg.com` / `admin123`

### 4.3 Test Full Stack

1. Create a new account
2. Create a task
3. Send a chat message
4. Upload a document

All features should work!

---

## 📋 Complete Checklist

### Backend (Railway)
- [ ] Railway account created
- [ ] Repository connected
- [ ] PostgreSQL database added
- [ ] Redis instance added
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Database seeded
- [ ] API URL copied
- [ ] Health check passes

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] Repository imported
- [ ] Build settings configured
- [ ] VITE_API_URL set to Railway URL
- [ ] Deployment successful
- [ ] Can access login page
- [ ] Can login successfully

### Integration
- [ ] CORS_ORIGIN updated on Railway
- [ ] Backend redeployed
- [ ] Frontend can call API
- [ ] Real-time features work
- [ ] File uploads work

---

## 🎯 Default Accounts

After seeding the database:

**Admin:**
```
Email: admin@inorg.com
Password: admin123
```

**Test Users:**
```
john.doe@inorg.com / password123
jane.smith@inorg.com / password123
mike.johnson@inorg.com / password123
```

⚠️ **Change admin password immediately!**

---

## 💰 Costs

### Free Tier Limits

**Vercel (Frontend):**
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Preview deployments
- **Cost**: $0

**Railway (Backend):**
- ✅ 500 hours/month (good for 1-2 instances)
- ✅ PostgreSQL included
- ✅ Redis included
- **Cost**: $0 (with $5 free credit)

### When to Upgrade

**Vercel Pro** ($20/month):
- More team members
- Analytics
- Better support

**Railway Pro** ($20/month):
- More usage hours
- Better performance
- Priority support

You can run beta testing **completely free** for 1-2 months!

---

## 🔧 Troubleshooting

### Issue: "Network Error" in frontend

**Solution**: Check VITE_API_URL in Vercel environment variables

1. Go to Vercel → Your project → Settings → Environment Variables
2. Verify `VITE_API_URL` is correct
3. Redeploy: Vercel → Deployments → Three dots → Redeploy

### Issue: "CORS Error"

**Solution**: Update CORS_ORIGIN on Railway

1. Railway → Your project → Variables
2. Update `CORS_ORIGIN` to include your Vercel URL
3. Railway will auto-redeploy

### Issue: "Database connection failed"

**Solution**: Check Railway database is running

1. Railway → PostgreSQL service → Check status
2. Open terminal: `npm run prisma:studio`
3. Verify tables exist

### Issue: WebSocket not connecting

**Solution**: WebSocket works on Railway!

Verify in Railway environment:
```bash
REDIS_URL=${{Redis.REDIS_URL}}  # Must be set
```

### Issue: "Railway deployment failed"

**Solution**: Check build logs

Common fixes:
1. Ensure `package.json` has all dependencies
2. Verify `"start": "node dist/server/index.js"` in scripts
3. Check `npm run build` works locally

---

## 🚀 Quick Deploy Commands

### Local Testing First

```powershell
# Update client API URL
cd client
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Test backend
cd ..
npm run build
npm start

# Test frontend (new terminal)
cd client
npm run dev
```

### Deploy to Railway (CLI method)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# Add databases through dashboard:
# https://railway.app/new
```

### Deploy to Vercel (CLI method)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd client
vercel

# Set environment variable
vercel env add VITE_API_URL
# Enter: https://your-railway-url.up.railway.app/api

# Redeploy with env
vercel --prod
```

---

## 📊 Monitoring Your Deployment

### Railway Logs

```bash
# View real-time logs
railway logs

# Or in dashboard: Railway → Your project → View logs
```

### Vercel Logs

```bash
# View deployment logs
vercel logs

# Or in dashboard: Vercel → Your project → Deployments → Logs
```

### Application Monitoring

As admin, access:
```
GET https://your-railway-url.up.railway.app/api/monitoring/errors/recent
GET https://your-railway-url.up.railway.app/api/monitoring/analytics
```

---

## 🎨 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Vercel → Your project → Settings → Domains
2. Add your domain: `erp.yourdomain.com`
3. Update DNS records as shown
4. Wait for verification (~10 minutes)

### Add Custom Domain to Railway

1. Railway → Your project → Settings → Domains
2. Click "Generate Domain" or add custom domain
3. Update DNS records if using custom domain

### Update CORS After Domain Change

In Railway environment variables:
```bash
CORS_ORIGIN=https://erp.yourdomain.com
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Vercel and Railway auto-deploy when you push to GitHub!

**How it works:**
1. Make changes locally
2. Commit: `git add . && git commit -m "fix: bug fix"`
3. Push: `git push origin main`
4. Railway deploys backend automatically
5. Vercel deploys frontend automatically
6. Live in ~2-3 minutes!

### Preview Deployments

**Vercel**: Every pull request gets a preview URL!
- Safe to test before merging
- Share with team for review

**Railway**: Can create separate environments
- Production branch: `main`
- Staging branch: `develop`

---

## 🎯 Environment Variables Reference

### Railway (Backend)

```bash
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<generate-strong-random-string>
CORS_ORIGIN=https://your-app.vercel.app

# Optional
INSTANCE_ID=railway-instance-1
OPENAI_API_KEY=<your-key>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-password>
```

### Vercel (Frontend)

```bash
# Required
VITE_API_URL=https://your-project.up.railway.app/api
```

---

## 📈 Scaling Your Deployment

### When You Need More

**Signs you need to upgrade:**
- Railway hours running out
- Slow response times
- Many concurrent users (100+)

**Railway Scaling:**
1. Upgrade to Railway Pro ($20/month)
2. Add more instances (already configured!)
3. Scale Redis for more memory

**Vercel Scaling:**
- Free tier handles 100GB bandwidth
- Vercel Edge Network auto-scales
- No action needed for most cases!

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Database initialized with seed data
- [ ] Admin login works
- [ ] Can create tasks/projects
- [ ] Real-time chat works
- [ ] File uploads work
- [ ] Monitoring endpoints accessible
- [ ] Error logging working
- [ ] HTTPS enabled (auto)
- [ ] Default admin password changed
- [ ] Custom domain configured (optional)

---

## 🎉 You're Live!

Your URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-project.up.railway.app`
- **Health Check**: `https://your-project.up.railway.app/api/health`

### Share with Beta Testers

Send them:
1. Your Vercel URL
2. `BETA_TESTING_GUIDE.md`
3. Default login credentials

### Monitor Your App

Check daily:
- Railway logs for errors
- Vercel analytics for usage
- Monitoring endpoints for bugs

---

## 💡 Pro Tips

1. **Use Railway's free $5 credit** - Perfect for beta
2. **Vercel preview URLs** - Test before deploying
3. **Environment variables** - Never commit secrets
4. **Monitor early** - Catch issues fast
5. **Deploy often** - Small changes, frequent updates

---

## 🆘 Need Help?

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

**Vercel Support:**
- Discord: https://vercel.com/discord
- Docs: https://vercel.com/docs

**Your App Monitoring:**
- Errors: `GET /api/monitoring/errors/recent`
- Analytics: `GET /api/monitoring/analytics`

---

**Ready to deploy?** Follow Step 1 above! 🚀

**Estimated time**: 10 minutes total
**Cost**: $0 (free tiers)
**Difficulty**: Easy
