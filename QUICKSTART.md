# TeachForward - Quick Reference

##  Commands

**Start Application:**
```bash
./start.sh
```

**Stop Application:**
```bash
./stop.sh
```

**View Logs:**
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs  
tail -f logs/frontend.log
```

**Check Status:**
```bash
# Check if running
lsof -i:8000  # Backend
lsof -i:3000  # Frontend

# Test backend
curl http://localhost:8000/health
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📁 Important Files

```
backend/.env          # Configuration (API keys, secrets)
backend/dev.db        # SQLite database
uploads/              # Uploaded files
logs/                 # Application logs
```

## 🔑 First Time Setup

1. **Configure Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

2. **Start Application:**
```bash
cd ..
./start.sh
```

3. **Open Browser:**
- Go to http://localhost:3000
- Register a new account
- Start using TeachForward!

## 🐛 Troubleshooting

**Application won't start:**
```bash
# Clean everything and restart
./stop.sh
rm -rf backend/venv frontend/teachforward-frontend/node_modules
./start.sh
```

**Port already in use:**
```bash
# Kill processes
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Database issues:**
```bash
# Reset database (WARNING: deletes all data)
rm backend/dev.db
./stop.sh
./start.sh
```

**Check what went wrong:**
```bash
# View logs
cat logs/backend.log
cat logs/frontend.log
```

## 📊 Features Quick Access

After logging in:

- **Dashboard** → Overview, Calendar, Stats
- **Sessions** → Book tutoring sessions
- **Homework** → Submit and track assignments
- **Study Tools** → AI flashcards, quizzes, notes
- **Grades** → Track courses and GPA
- **Chat** → AI tutor chat
- **Profile** → Account settings

## 🔒 Default Test Account

After starting, register your own account at:
http://localhost:3000/register

## 💡 Tips

1. **First time?** → Start script installs all dependencies automatically
2. **Update code?** → Just run `./start.sh` again
3. **Production?** → See DEPLOYMENT.md for hosting options
4. **Logs?** → Always in `logs/` directory
5. **Stop cleanly?** → Use `./stop.sh` instead of Ctrl+C

## 📞 Support

- Check README.md for full documentation
- See DEPLOYMENT.md for deployment guides
- API docs at http://localhost:8000/docs
