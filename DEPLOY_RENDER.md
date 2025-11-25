# 🚀 Deploy to Render (FREE Forever)

Render offers a **forever-free tier** perfect for beta testing!

## ⚡ Quick Summary

- ✅ **Free PostgreSQL** database
- ✅ **750 hours/month** (enough for 1 instance)
- ✅ **Auto-deploy** from GitHub
- ✅ **WebSocket support**
- ⚠️ **Auto-sleep** after 15min inactivity (first request takes ~30 seconds)
- ❌ No free Redis (use external service)

---

## Step 1: Push Code to GitHub

If not done already:
```powershell
cd d:\ERP
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 2: Create Render Account

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign in with **GitHub**

---

## Step 3: Deploy Backend

### 3.1 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository `ShreyasRaoVS/INORG`
3. Configure:

**Basic Settings:**
```
Name: inorg-backend
Region: Oregon (or closest to you)
Branch: main
Root Directory: (leave empty)
Runtime: Node
```

**Build & Deploy:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

**Instance Type:**
```
Free
```

### 3.2 Add Environment Variables

Click **"Advanced"** → **Environment Variables**:

```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this

# Leave DATABASE_URL empty - Render will auto-fill after adding PostgreSQL
# Leave REDIS_URL empty for now - we'll add external Redis later

CORS_ORIGIN=https://your-app-name.vercel.app
```

Click **"Create Web Service"**

⏳ Wait ~5 minutes for first deployment

---

## Step 4: Add PostgreSQL Database

### 4.1 Create Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:

```
Name: inorg-db
Database: inorg_db
User: inorg_user
Region: Same as your web service
```

3. Click **"Create Database"**

### 4.2 Connect Database to Web Service

1. Go to your web service → **"Environment"**
2. Click **"Add Environment Variable"**
3. Add:

```
Name: DATABASE_URL
Value: [Click "Select" → Choose your PostgreSQL database → Internal Database URL]
```

4. Click **"Save Changes"**

Your web service will automatically redeploy.

---

## Step 5: Initialize Database

### 5.1 Run Migrations

1. Go to your web service
2. Click **"Shell"** tab (terminal icon)
3. Run:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

✅ Database is now initialized with default accounts!

---

## Step 6: Add Redis (External - Free)

Since Render doesn't offer free Redis, use **Upstash** (free Redis):

### 6.1 Create Upstash Account

1. Go to https://upstash.com
2. Sign up (free account)
3. Click **"Create Database"**

```
Name: inorg-redis
Type: Redis
Region: Same as Render (Oregon)
```

### 6.2 Get Redis URL

1. Click on your database
2. Copy the **"REDIS_URL"** (starts with `redis://...`)

### 6.3 Add to Render

1. Go to Render → Your web service → **"Environment"**
2. Add variable:

```
Name: REDIS_URL
Value: [paste Upstash Redis URL]
```

3. Save changes (auto-redeploys)

---

## Step 7: Get Your Backend URL

After deployment succeeds:

1. Go to your web service dashboard
2. Copy the URL: `https://inorg-backend.onrender.com`

✅ **Save this URL** - you need it for frontend!

---

## Step 8: Test Backend

```bash
curl https://inorg-backend.onrender.com/api/health
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

⚠️ **First request may take 30 seconds** (cold start)

---

## Step 9: Deploy Frontend to Vercel

### 9.1 Go to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your repository

### 9.2 Configure Build

```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 9.3 Add Environment Variable

```
Name: VITE_API_URL
Value: https://inorg-backend.onrender.com/api
```

Click **"Deploy"**

⏳ Wait ~2 minutes

---

## Step 10: Update CORS

### 10.1 Get Vercel URL

After deployment, copy your Vercel URL:
```
https://your-app-name.vercel.app
```

### 10.2 Update Render Environment

1. Go to Render → Your web service → **"Environment"**
2. Update `CORS_ORIGIN`:

```
CORS_ORIGIN=https://your-app-name.vercel.app,https://your-app-name-git-main.vercel.app
```

3. Save (auto-redeploys)

---

## ✅ You're Live!

**Frontend:** `https://your-app-name.vercel.app`  
**Backend:** `https://inorg-backend.onrender.com`

### Default Login:
```
Email: admin@inorg.com
Password: admin123
```

⚠️ **Change password immediately!**

---

## 🎯 Important: Free Tier Limitations

### Auto-Sleep Behavior

Render free tier **sleeps after 15 minutes** of inactivity:

- ⏱️ First request after sleep: **30-60 seconds**
- ⚡ Subsequent requests: **instant**

### Solutions:

**Option 1: Keep Alive Service (Free)**

Use cron-job.org to ping every 14 minutes:

1. Go to https://cron-job.org
2. Create free account
3. Add job:
```
URL: https://inorg-backend.onrender.com/api/health
Schedule: */14 * * * * (every 14 minutes)
```

**Option 2: Upgrade to Paid** ($7/month)
- No sleep
- Always instant response

---

## 📊 Cost Breakdown

| Service | Free Tier | Cost After Free | When to Upgrade |
|---------|-----------|-----------------|------------------|
| **Render Web** | 750 hrs/mo | $7/mo per service | Need no sleep |
| **Render PostgreSQL** | FREE forever | $7/mo for more | Need more storage |
| **Upstash Redis** | FREE forever | $0.20/100k ops | High traffic |
| **Vercel** | FREE forever | $20/mo | Need team features |

**Total for beta:** $0/month ✅

---

## 🔧 Troubleshooting

### Issue: "Application Error" on Render

**Check Logs:**
1. Render dashboard → Your service → **"Logs"**
2. Look for errors

**Common fixes:**
- Verify `npm run build` succeeds
- Check environment variables are set
- Ensure `DATABASE_URL` is connected

### Issue: Database connection failed

**Solution:**
```bash
# In Render Shell:
npm run prisma:generate
npm run prisma:migrate:deploy
```

### Issue: CORS Error in frontend

**Solution:**
1. Check `CORS_ORIGIN` in Render includes your Vercel URL
2. Ensure no trailing slashes
3. Redeploy after changes

### Issue: Redis connection failed

**Solution:**
1. Verify `REDIS_URL` in Render environment
2. Check Upstash database is active
3. Test Redis URL:
```bash
curl -X POST https://YOUR_UPSTASH_URL/ping
```

### Issue: 30-second cold start

**Expected behavior on free tier!**

Solutions:
- Use cron-job.org to keep alive (free)
- Upgrade to paid plan ($7/mo)
- Show loading spinner in frontend

---

## 🚀 Monitoring Your App

### View Logs

**Render:**
```
Dashboard → Your service → Logs (real-time)
```

**Application Monitoring:**
```
GET https://inorg-backend.onrender.com/api/monitoring/errors/recent
GET https://inorg-backend.onrender.com/api/monitoring/analytics
```

(Admin access required)

---

## 📈 Scaling Options

### Current Setup (Free):
- 1 backend instance
- PostgreSQL database
- Redis (Upstash)
- Frontend on Vercel

### When to Upgrade:

**Render Starter ($7/mo):**
- No sleep/cold starts
- Better performance
- 24/7 availability

**Multiple Instances ($7 each):**
- Already configured for multi-instance!
- Just duplicate web service
- Redis handles clustering automatically

---

## 🎨 Custom Domain (Optional)

### Add to Vercel:
1. Vercel → Settings → Domains
2. Add: `erp.yourdomain.com`
3. Update DNS records

### Add to Render:
1. Render → Settings → Custom Domains
2. Add: `api.yourdomain.com`
3. Update DNS records

### Update CORS:
```
CORS_ORIGIN=https://erp.yourdomain.com
```

---

## 🔄 Auto-Deploy

Both Render and Vercel auto-deploy on `git push`!

```powershell
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render deploys backend automatically
# Vercel deploys frontend automatically
# Live in ~3-5 minutes!
```

---

## ✅ Deployment Checklist

### Backend (Render):
- [ ] Web service created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Database seeded
- [ ] Redis (Upstash) connected
- [ ] Health check passes
- [ ] Backend URL copied

### Frontend (Vercel):
- [ ] Project imported
- [ ] Build settings configured
- [ ] VITE_API_URL set
- [ ] Deployment successful
- [ ] Login page loads
- [ ] Can login successfully

### Integration:
- [ ] CORS_ORIGIN updated
- [ ] Backend redeployed
- [ ] Frontend can call API
- [ ] Real-time chat works
- [ ] File uploads work

---

## 💡 Pro Tips

1. **Keep Alive:** Use cron-job.org to prevent sleep
2. **Monitoring:** Check `/api/monitoring/errors/recent` daily
3. **Logs:** Render keeps logs for 7 days (free)
4. **Preview:** Render creates preview for PRs
5. **Environment:** Use separate prod/staging branches

---

## 🆘 Need Help?

**Render Support:**
- Community: https://community.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

**Your App:**
- Health: `https://your-backend.onrender.com/api/health`
- Errors: `https://your-backend.onrender.com/api/monitoring/errors/recent`

---

## 🎉 Success!

Your ERP is now live on Render + Vercel!

**Forever free** with these limitations:
- ⏱️ 30s cold start after 15min inactivity
- ✅ Perfect for beta testing
- 💰 Upgrade to $7/mo when ready for production

**Next steps:**
1. Share Vercel URL with beta testers
2. Monitor errors via `/api/monitoring/errors/recent`
3. Upgrade when you get real users

---

**Deploy time:** ~15 minutes  
**Monthly cost:** $0 (free forever)  
**Difficulty:** Easy
