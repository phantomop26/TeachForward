# TeachForward Deployment Guide

## 🚀 Deployment Options

### Option 1: Render (Easiest - Free Tier Available)

**Backend:**
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Name**: teachforward-backend
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `OPENAI_API_KEY`: your-key
     - `SECRET_KEY`: random-secret
     - `DATABASE_URL`: (use Render PostgreSQL)

**Frontend:**
1. New → Static Site
2. Configure:
   - **Name**: teachforward-frontend
   - **Root Directory**: `frontend/teachforward-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
3. Update API URLs in frontend to backend URL

---

### Option 2: Railway (Recommended)

**Backend:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up
railway variables set OPENAI_API_KEY=sk-xxx
railway variables set SECRET_KEY=xxx
```

**Frontend:**
Deploy to Vercel (see Option 3)

---

### Option 3: Vercel (Frontend) + Railway (Backend)

**Backend (Railway):**
1. Connect GitHub repo
2. Select `backend/` as root
3. Add environment variables
4. Deploy

**Frontend (Vercel):**
```bash
cd frontend/teachforward-frontend
npm install -g vercel
vercel
```

Update `src/` API URLs to your Railway backend URL.

---

### Option 4: DigitalOcean App Platform

**Backend:**
1. Create App → GitHub
2. Select repository
3. Component: Web Service
   - **Source Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`
4. Add PostgreSQL database
5. Environment variables

**Frontend:**
1. Add Component → Static Site
2. **Source Directory**: `frontend/teachforward-frontend`
3. **Build Command**: `npm install && npm run build`
4. **Output Directory**: `build`

---

### Option 5: Docker Deployment

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: teachforward
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/teachforward
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
    restart: always

  frontend:
    build: ./frontend/teachforward-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

**Create backend/Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create frontend/teachforward-frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 🔧 Pre-Deployment Checklist

### Backend:
- [ ] Set `OPENAI_API_KEY` in environment
- [ ] Set `SECRET_KEY` (use `openssl rand -hex 32`)
- [ ] Update `DATABASE_URL` for PostgreSQL
- [ ] Set `ALLOWED_ORIGINS` to include frontend URL
- [ ] Install production dependencies
- [ ] Test with `pytest`

### Frontend:
- [ ] Update API base URLs in code
- [ ] Build successfully (`npm run build`)
- [ ] Test production build locally
- [ ] Configure CORS in backend for production domain

### Database:
- [ ] Migrate from SQLite to PostgreSQL for production
- [ ] Run database migrations
- [ ] Backup strategy in place

---

## 🌍 Environment-Specific Configuration

### Development (.env):
```env
OPENAI_API_KEY=sk-xxx
DATABASE_URL=sqlite:////path/to/dev.db
SECRET_KEY=dev-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

### Production (.env):
```env
OPENAI_API_KEY=sk-xxx
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=<generated-secret-32-chars>
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

## 📊 Post-Deployment

### Monitoring:
- Set up logging (Sentry, LogRocket)
- Monitor API usage (OpenAI dashboard)
- Track errors and performance

### Security:
- Enable HTTPS
- Set strong SECRET_KEY
- Rotate API keys periodically
- Implement rate limiting

### Scaling:
- Use CDN for frontend static files
- Enable database connection pooling
- Add Redis for caching
- Horizontal scaling with load balancer

---

## 🆘 Common Issues

**CORS Errors:**
- Add frontend URL to `ALLOWED_ORIGINS` in backend
- Update `app/main.py` CORS configuration

**Database Connection:**
- Check `DATABASE_URL` format
- Verify database is running
- Check network/firewall settings

**OpenAI API Errors:**
- Verify API key is valid
- Check billing/credits
- Monitor rate limits

---

## 📝 Production Recommendations

1. **Use PostgreSQL** instead of SQLite
2. **Enable HTTPS** for both backend and frontend
3. **Set up monitoring** (Sentry, New Relic)
4. **Regular backups** of database
5. **Environment variables** for all secrets
6. **CI/CD pipeline** (GitHub Actions)
7. **Rate limiting** on API endpoints
8. **Caching** with Redis
9. **Load testing** before launch
10. **Documentation** for team

---

## 🎯 Quick Deploy Commands

**Render:**
```bash
# Backend deploys automatically from GitHub
# Frontend builds from: npm run build
```

**Vercel:**
```bash
cd frontend/teachforward-frontend
vercel --prod
```

**Railway:**
```bash
railway up
```

**Docker:**
```bash
docker-compose up -d
```

---

For detailed platform-specific guides, visit:
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [DigitalOcean Docs](https://docs.digitalocean.com)
