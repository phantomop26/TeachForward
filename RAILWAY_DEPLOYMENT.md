# Railway Deployment Guide

## 🚂 Deploying to Railway - Complete Guide

Railway automatically detects your Python/Node setup and deploys correctly.

---

## 📋 Prerequisites

1. ✅ **GitHub Account** - Code must be on GitHub
2. ✅ **Railway Account** - Sign up at [railway.app](https://railway.app)
3. ✅ **OpenAI API Key** - Ready to add as environment variable
4. ✅ **Push all changes to GitHub**

---

## 🚀 Deploy Backend (FastAPI + Python)

### 1. Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub
4. Select **`TeachForward`** repository

### 2. Add Backend Service

Railway will auto-detect the monorepo structure:

1. Click **"Add a Service"**
2. Select **"GitHub Repo"**
3. **Configure Service:**
   - **Name**: `backend` (or `teachforward-backend`)
   - **Root Directory**: `backend`
   - Leave everything else as default

Railway will automatically:
- ✅ Detect it's a Python app (from `requirements.txt`)
- ✅ Install Python dependencies
- ✅ Run `uvicorn app.main:app`

**The `backend/railway.toml` file tells Railway exactly how to build and run!**

### 3. Add PostgreSQL Database

1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatically:
   - Creates database
   - Sets `DATABASE_URL` environment variable
   - Your backend reads it automatically!

### 4. Add Environment Variables (🔒 SECURE - Keys Stay Hidden)

1. Click **backend service**
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add these:

```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
SECRET_KEY=use-command-below-to-generate
ALLOWED_ORIGINS=*
```

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

Copy the output and paste as `SECRET_KEY` value.

⚠️ **IMPORTANT**: 
- ✅ Railway encrypts these variables
- ✅ They're NEVER in your code
- ✅ They're NEVER in GitHub
- ✅ Only visible in Railway dashboard

### 5. Deploy Backend

1. Railway deploys automatically on setup
2. Wait 2-3 minutes
3. Click on **backend service** → **Settings** → **Domains**
4. Copy your backend URL (something like):
   ```
   https://teachforward-backend-production.up.railway.app
   ```

### 6. Test Backend

Open in browser:
```
https://your-backend-url.railway.app/health
```

Should show: `{"status":"ok"}`

API Docs:
```
https://your-backend-url.railway.app/docs
```

---

## 🎨 Deploy Frontend (React + TypeScript)

### 1. Update API URL in Frontend

**IMPORTANT**: Before deploying frontend, update it to use Railway backend URL.

Create `frontend/teachforward-frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

Replace `your-backend-url` with your actual Railway backend URL.

### 2. Update Frontend Code to Use Environment Variable

This is already done in your code, but verify files use:

```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Then in fetch calls:
fetch(`${API_BASE}/auth/login`, ...)
```

### 3. Commit Changes

```bash
cd /Users/sks/Documents/Funda/Documents/sd/senior-design
git add .
git commit -m "Add Railway deployment config and production env"
git push origin main
```

### 4. Add Frontend Service to Railway

1. In same Railway project, click **"New"** → **"GitHub Repo"**
2. Select **same repository** again
3. **Configure Service:**
   - **Name**: `frontend` (or `teachforward-frontend`)
   - **Root Directory**: `frontend/teachforward-frontend`
   - Leave other settings as default

Railway will automatically:
- ✅ Detect it's a Node/React app (from `package.json`)
- ✅ Run `npm install && npm run build`
- ✅ Serve with `serve` (from `railway.toml`)

**The `frontend/teachforward-frontend/railway.toml` file handles everything!**

### 5. Get Frontend URL

1. Click **frontend service**
2. Go to **Settings** → **Domains**
3. Copy your frontend URL:
   ```
   https://teachforward-frontend-production.up.railway.app
   ```

### 6. Update Backend CORS

Go back to **backend service** → **Variables** and update:

```
ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

Or set to `*` for testing (not recommended for production):
```
ALLOWED_ORIGINS=*
```

### 7. Redeploy Backend (if needed)

If you changed CORS:
- Click backend service
- Deployments → Click "..." on latest deployment → "Redeploy"

---

## ✅ Final Testing

### Test Backend:
```bash
curl https://your-backend-url.railway.app/health
# Should return: {"status":"ok"}
```

### Test Frontend:
1. Open: `https://your-frontend-url.railway.app`
2. Click **Register**
3. Create an account
4. Login and test features:
   - ✅ Dashboard loads
   - ✅ Can add courses in Grades
   - ✅ AI flashcards work (tests OpenAI key)
   - ✅ Calendar shows events

---

## 🔐 How API Keys Stay Secure

### On Railway (Production):

✅ **Environment Variables Tab**
- Go to service → Variables
- Add secrets there
- Railway encrypts them
- Not visible in logs or code

✅ **Never in Code**
```python
# ✅ GOOD - reads from environment
import os
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ❌ BAD - hardcoded
OPENAI_API_KEY = "sk-1234567890"
```

✅ **Never Committed**
Add to `.gitignore`:
```
# .gitignore
.env
.env.local
.env.production
backend/.env
backend/venv/
backend/__pycache__/
*.db
```

### Check Your .gitignore

```bash
cd /Users/sks/Documents/Funda/Documents/sd/senior-design
cat .gitignore
```

If `.env` is not there, add it:
```bash
echo "backend/.env" >> .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push
```

---

## 📊 Railway Dashboard Features

**Environment Variables** (🔒 Secure)
- Click service → Variables tab
- Add/edit/delete variables
- Automatically available to your app
- Encrypted at rest

**Logs**
- Real-time logs for debugging
- Click service → Deployments → View Logs

**Metrics**
- CPU, Memory, Network usage
- Click service → Metrics

**Domains**
- Custom domain setup
- SSL/HTTPS automatic

---

## 🔄 Automatic Deployments

Railway auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
# Railway automatically redeploys! 🚀
```

---

## 💰 Pricing

**Free Tier:**
- $5 credit/month
- Good for testing
- Sleeps after inactivity

**Hobby Plan ($5/month):**
- $5 credit included
- Always-on services
- No sleep

**Pay-as-you-go:**
- Beyond free credits
- ~$0.000463/GB-hour

---

## 🐛 Troubleshooting

### Backend won't start

1. Check logs: Service → Deployments → View Logs
2. Verify environment variables are set
3. Check `DATABASE_URL` is connected

### Database connection fails

```bash
# In Railway, database should auto-provide DATABASE_URL
# Make sure backend reads it:
```

In `backend/app/database.py`:
```python
import os
DATABASE_URL = os.getenv("DATABASE_URL")
```

### CORS errors

1. Update `ALLOWED_ORIGINS` in Railway backend variables
2. Include your Railway frontend URL

### Frontend can't reach backend

1. Update `.env.production` with correct backend URL
2. Rebuild frontend
3. Clear browser cache

---

## ✅ Deployment Checklist

**Before Deploying:**
- [ ] Code pushed to GitHub
- [ ] `.env` in `.gitignore`
- [ ] No hardcoded API keys in code
- [ ] Frontend API URLs use environment variable
- [ ] Database migrations ready (if any)

**Railway Setup:**
- [ ] Backend service created
- [ ] PostgreSQL database added
- [ ] Environment variables set (OPENAI_API_KEY, SECRET_KEY, ALLOWED_ORIGINS)
- [ ] Frontend service created
- [ ] Frontend `.env.production` configured
- [ ] CORS configured in backend

**Testing:**
- [ ] Backend health check: `https://your-backend.railway.app/health`
- [ ] API docs: `https://your-backend.railway.app/docs`
- [ ] Frontend loads: `https://your-frontend.railway.app`
- [ ] Can register/login
- [ ] API calls work
- [ ] AI features work (flashcards, etc.)

---

## 🎯 Quick Commands

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

**Check what's in git (avoid committing secrets):**
```bash
git status
git diff
```

**View Railway logs:**
```bash
# Or use Railway CLI
npm install -g @railway/cli
railway login
railway logs
```

---

## 📱 Your URLs After Deployment

- **Backend**: `https://teachforward-backend-production.up.railway.app`
- **API Docs**: `https://teachforward-backend-production.up.railway.app/docs`
- **Frontend**: `https://teachforward-frontend-production.up.railway.app`
- **Database**: (Internal, Railway provides `DATABASE_URL`)

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- FastAPI Deployment: https://docs.railway.app/guides/fastapi
- PostgreSQL Plugin: https://docs.railway.app/databases/postgresql

---

## 🆘 Need Help?

1. Check Railway logs
2. Verify environment variables
3. Test backend health: `/health`
4. Check API docs: `/docs`
5. Railway Discord: https://discord.gg/railway
