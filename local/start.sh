#!/bin/bash

# TeachForward - Startup Script
# Starts both backend (FastAPI) and frontend (React) servers

echo "🚀 Starting TeachForward Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Kill existing processes on ports 8000 and 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Install Backend Dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
cd ..

# Check for .env file
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found. Creating from example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "❗ Please edit backend/.env and add your OPENAI_API_KEY"
    fi
fi

# Start Backend
echo -e "${BLUE}📡 Starting Backend (FastAPI on port 8000)...${NC}"
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo "❌ Backend failed to start. Check logs/backend.log for errors."
    cat logs/backend.log
    exit 1
fi

# Install Frontend Dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend/teachforward-frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install -q
fi
cd ../..

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (React on port 3000)...${NC}"
cd frontend/teachforward-frontend
npm start > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to compile
echo "⏳ Waiting for frontend to compile..."
sleep 10

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
else
    echo "❌ Frontend failed to start. Check logs/frontend.log for errors."
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 TeachForward is now running!${NC}"
echo "=========================================="
echo ""
echo "📡 Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "📋 Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the application:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  or run: ./stop.sh"
echo ""
echo "📝 Logs are in the logs/ directory"
echo "=========================================="
