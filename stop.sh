#!/bin/bash

# TeachForward - Stop Script
# Stops both backend and frontend servers

echo "🛑 Stopping TeachForward Application..."

# Kill processes on ports 8000 and 3000
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Deactivate virtual environment if active
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate 2>/dev/null
fi

echo "✅ Application stopped"
echo "📝 Logs are preserved in the logs/ directory"
