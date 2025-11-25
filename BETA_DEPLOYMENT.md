# 🚀 BETA DEPLOYMENT GUIDE

## Quick Deploy to Cloud (Choose One)

### Option 1: Railway (Easiest - 5 minutes)

Railway provides free hosting for beta testing with PostgreSQL and Redis included.

**Steps:**

1. **Create Account**: https://railway.app
2. **Click "New Project" → "Deploy from GitHub"**
3. **Connect your repo and add these environment variables:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled
   REDIS_URL=${{Redis.REDIS_URL}}           # Auto-filled
   JWT_SECRET=your-super-secret-key-change-this
   CORS_ORIGIN=https://your-app.railway.app
   ```

4. **Add Services**:
   - Click "New" → "Database" → "PostgreSQL"
   - Click "New" → "Database" → "Redis"

5. **Deploy**:
   ```bash
   # Railway will auto-detect and build
   # Your app will be live at: https://your-app.railway.app
   ```

**Cost**: Free tier (500 hours/month)

---

### Option 2: Render (Free tier available)

**Steps:**

1. **Create Account**: https://render.com
2. **Create PostgreSQL Database**:
   - Dashboard → "New +" → "PostgreSQL"
   - Name: `inorg-db`
   - Plan: Free
   - Copy the "Internal Database URL"

3. **Create Redis Instance**:
   - Dashboard → "New +" → "Redis"
   - Name: `inorg-redis`
   - Plan: Free (25MB)
   - Copy the "Internal Redis URL"

4. **Create Web Service**:
   - Dashboard → "New +" → "Web Service"
   - Connect GitHub repo
   - Name: `inorg-erp-api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   
5. **Add Environment Variables**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=<paste Internal Database URL>
   REDIS_URL=<paste Internal Redis URL>
   JWT_SECRET=your-super-secret-key-change-this
   CORS_ORIGIN=https://your-app.onrender.com
   PORT=10000
   ```

6. **Deploy**: Render will auto-deploy

**URL**: `https://your-app.onrender.com`

---

### Option 3: Heroku (Classic choice)

**Steps:**

1. **Install Heroku CLI**:
   ```powershell
   # Windows
   winget install Heroku.HerokuCLI
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   cd d:\ERP
   heroku create inorg-erp-beta
   ```

4. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

5. **Add Redis**:
   ```bash
   heroku addons:create heroku-redis:mini
   ```

6. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-key
   heroku config:set CORS_ORIGIN=https://inorg-erp-beta.herokuapp.com
   ```

7. **Deploy**:
   ```bash
   git push heroku main
   ```

8. **Run Migrations**:
   ```bash
   heroku run npm run prisma:migrate
   heroku run npm run prisma:seed
   ```

**URL**: `https://inorg-erp-beta.herokuapp.com`

---

### Option 4: DigitalOcean App Platform

**Steps:**

1. **Create Account**: https://digitalocean.com
2. **Create App**:
   - Apps → "Create App"
   - Choose GitHub repo
   - Select branch: `main`

3. **Add Resources**:
   - Add "Dev Database" (PostgreSQL)
   - Add "Dev Database" (Redis)

4. **Configure Build**:
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - HTTP Port: `8080`

5. **Environment Variables**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=${db.DATABASE_URL}
   REDIS_URL=${redis.DATABASE_URL}
   JWT_SECRET=your-secret
   CORS_ORIGIN=${APP_URL}
   ```

6. **Deploy**: Click "Create Resources"

**Cost**: $5/month for basic app + $7/month for dev DBs

---

## Database Setup

### Run Migrations

After deploying, initialize your database:

**Railway/Render:**
```bash
# SSH into your deployment
npm run prisma:generate
npm run prisma:migrate deploy
npm run prisma:seed
```

**Heroku:**
```bash
heroku run npm run prisma:migrate deploy
heroku run npm run prisma:seed
```

### Seed with Test Data

Your seed file will create:
- Admin user: `admin@inorg.com` / `admin123`
- 3 Departments (Engineering, Marketing, Sales)
- 5 Test users
- Sample projects and tasks

---

## Beta Testing Setup

### 1. Update CORS Origins

In your deployment environment variables, add allowed origins:

```bash
CORS_ORIGIN=https://your-frontend.com,https://your-api.com
```

### 2. Enable Beta Features

Add to `.env`:
```bash
BETA_MODE=true
ALLOW_SIGNUPS=true
```

### 3. Set Up Monitoring

Your app now has monitoring endpoints:

- **Health Check**: `GET /api/health`
- **Recent Errors**: `GET /api/monitoring/errors/recent`
- **Error Stats**: `GET /api/monitoring/errors/stats`
- **Analytics**: `GET /api/monitoring/analytics`

**Note**: All monitoring routes require ADMIN role.

---

## Access Your Beta App

### Default Admin Login

```
Email: admin@inorg.com
Password: admin123
```

**⚠️ IMPORTANT**: Change this password immediately after first login!

### Test User Accounts

The seed file creates these test accounts:
```
john.doe@inorg.com / password123
jane.smith@inorg.com / password123
mike.johnson@inorg.com / password123
sarah.williams@inorg.com / password123
david.brown@inorg.com / password123
```

---

## Beta Testing Checklist

### Pre-Launch

- [ ] Deploy backend to cloud provider
- [ ] Run database migrations
- [ ] Seed database with test data
- [ ] Test admin login
- [ ] Verify all API endpoints work
- [ ] Test WebSocket connection
- [ ] Check error logging is working

### Beta Testing Phase

- [ ] Invite 10-20 beta testers
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Plan feature improvements

### Monitoring During Beta

```bash
# Check health
curl https://your-app.com/api/health

# View errors (admin token required)
curl https://your-app.com/api/monitoring/errors/recent \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# View analytics
curl https://your-app.com/api/monitoring/analytics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Performance Tips for Beta

### 1. Database Connection Pooling

Already configured! Connection limit: 2 per instance

### 2. Redis Caching

Use caching for frequent queries:

```typescript
import { cache } from './config/redis';

// Cache for 5 minutes
const users = await cache.get('all-users') || 
  await prisma.user.findMany().then(data => {
    cache.set('all-users', data, 300);
    return data;
  });
```

### 3. Monitor Resource Usage

Check your hosting dashboard for:
- Memory usage
- CPU usage  
- Database connections
- Response times

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution**:
```bash
# Verify DATABASE_URL is set correctly
echo $DATABASE_URL

# Test connection
npm run prisma:studio
```

### Issue: "Redis connection failed"

**Solution**:
```bash
# Check REDIS_URL
echo $REDIS_URL

# Test Redis locally
redis-cli ping
```

### Issue: "CORS errors"

**Solution**: Update CORS_ORIGIN in environment variables to include your frontend URL

### Issue: "WebSocket not connecting"

**Solution**: Make sure your hosting provider supports WebSocket connections (Railway, Render, Heroku all do)

---

## Scaling During Beta

### If you hit limits:

**Railway**: Upgrade to Pro ($20/month)
- More resources
- Custom domains
- Priority support

**Render**: Upgrade to Starter ($7/month)
- Better performance
- Custom domains

**Add More Instances** (if traffic grows):
```bash
# Railway: Scale replicas
# Render: Add more instances in settings
# Heroku: Scale dynos
heroku ps:scale web=2
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (auto on most platforms)
- [ ] Limit API rate limiting (built-in)
- [ ] Regular security updates: `npm audit fix`
- [ ] Backup database daily

---

## Collecting Beta Feedback

### Built-in Monitoring

Access monitoring dashboard as admin:
```
https://your-app.com/monitoring/errors
https://your-app.com/monitoring/analytics
```

### Error Tracking

All errors are automatically logged with:
- Timestamp
- User info
- Request details
- Stack trace (dev only)

### User Activity

Track user engagement:
- Login frequency
- Feature usage
- Common workflows
- Error patterns

---

## Next Steps

1. **Deploy**: Choose a hosting provider above
2. **Test**: Verify everything works
3. **Invite**: Send beta invite to testers
4. **Monitor**: Check logs daily
5. **Iterate**: Fix bugs and improve
6. **Launch**: When ready, upgrade to production tier

Your ERP is production-ready! 🎉

## Support

For issues during beta:
- Check `/api/monitoring/errors/recent` for backend errors
- Review browser console for frontend errors
- Monitor hosting provider dashboard
- Check database connection counts

---

**Beta Version**: 1.0.0-beta
**Last Updated**: November 25, 2025
