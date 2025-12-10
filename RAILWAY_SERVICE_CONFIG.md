# Railway Service Configuration

## IMPORTANT: Set Root Directory for Each Service!

### Backend Service Configuration:

1. Go to Railway Dashboard
2. Click on **backend service**
3. Go to **Settings** tab
4. Under **Source**, set:
   ```
   Root Directory: backend
   ```
5. Click **Save**

### Frontend Service Configuration:

1. Click on **frontend service**
2. Go to **Settings** tab
3. Under **Source**, set:
   ```
   Root Directory: frontend/teachforward-frontend
   ```
4. Click **Save**

---

## Why This Matters:

Railway needs to know WHERE to look for files:
- ❌ Without root directory → Looks in project root → Finds local/start.sh → Fails
- ✅ With root directory → Looks in backend/ or frontend/ → Finds nixpacks.toml → Works!

---

## After Setting Root Directories:

1. **Redeploy Backend**:
   - Click backend service → Deployments
   - Click "..." on latest → Redeploy

2. **Redeploy Frontend**:
   - Same for frontend service

---

## Expected Build Logs (Backend):

```
✓ Detected Python
✓ Installing requirements.txt
✓ Starting: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Expected Build Logs (Frontend):

```
✓ Detected Node.js
✓ Running: npm install
✓ Running: npm run build
✓ Starting: npx serve -s build
```

---

## If Still Not Working:

1. **Delete and Recreate Services**:
   - Remove both services from Railway
   - Add new service → GitHub Repo → Set root directory IMMEDIATELY
   - Add environment variables
   - Deploy

2. **Check Environment Variables**:
   - Backend needs: `OPENAI_API_KEY`, `SECRET_KEY`, `ALLOWED_ORIGINS`
   - Frontend needs: None (uses backend URL)

3. **Clear Railway Cache**:
   - Delete service
   - Wait 1 minute
   - Create new service with correct root directory
