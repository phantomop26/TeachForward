# Railway Deployment Guide

## 🚂 Deploying to Railway

Railway is perfect for FastAPI + React apps with automatic PostgreSQL database provisioning.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **OpenAI API Key** - Ready to add as environment variable

---

## 🚀 Step-by-Step Deployment

### Part 1: Deploy Backend (FastAPI)

#### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `TeachForward` repository
5. Railway will detect it's a monorepo

#### 2. Configure Backend Service

1. **Add New Service** → "GitHub Repo"
2. **Settings**:
   - **Service Name**: `teachforward-backend`
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty, Railway auto-detects)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### 3. Add PostgreSQL Database

1. In your project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway will create a database and set `DATABASE_URL` automatically
3. Your backend will connect to it automatically!

#### 4. Set Environment Variables (🔒 THIS HIDES YOUR API KEYS)

1. Click on `teachforward-backend` service
2. Go to **"Variables"** tab
3. Add these variables:

```
OPENAI_API_KEY=sk-your-actual-openai-key-here
SECRET_KEY=generate-random-32-char-string-here
ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

**To generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

⚠️ **IMPORTANT**: 
- Railway environment variables are **encrypted and hidden**
- Never commit `.env` file to GitHub
- API keys stay secure in Railway dashboard

#### 5. Deploy Backend

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** manually
3. Wait for build to complete
4. Note your backend URL: `https://teachforward-backend.railway.app`

---

### Part 2: Deploy Frontend (React)

#### 1. Add Frontend Service

1. In same Railway project, click **"New"** → **"GitHub Repo"**
2. Select same repository
3. **Settings**:
   - **Service Name**: `teachforward-frontend`
   - **Root Directory**: `frontend/teachforward-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`

#### 2. Update Frontend API URLs

**Before deploying**, update your frontend to use Railway backend URL:

Create `frontend/teachforward-frontend/.env.production`:
```env
REACT_APP_API_URL=https://teachforward-backend.railway.app
```

Then update your API calls to use this:
```typescript
// In all fetch calls, replace:
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Example:
fetch(`${API_BASE}/auth/login`, ...)
```

#### 3. Add serve package

```bash
cd frontend/teachforward-frontend
npm install --save serve
```

Commit and push changes.

#### 4. Deploy Frontend

1. Railway will auto-deploy on push
2. Note your frontend URL: `https://teachforward-frontend.railway.app`

---

### Part 3: Configure CORS

Update backend CORS to allow your Railway frontend:

1. In Railway, go to backend **"Variables"**
2. Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://teachforward-frontend.railway.app
```

Or edit `backend/app/main.py` to read from environment:
```python
import os

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔐 How API Keys Stay Hidden

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
