#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting affili.io development environment...${NC}\n"

# Kill any existing processes on ports 8000 and 5173
pkill -f "uvicorn" || true
pkill -f "vite" || true
sleep 1

# Start Backend
echo -e "${GREEN}[1/2] Starting Backend (FastAPI)...${NC}"
cd backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}Backend running at http://127.0.0.1:8000${NC}"
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}\n"

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo -e "${GREEN}[2/2] Starting Frontend (React + Vite)...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend running at http://localhost:5173${NC}"
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Both services are running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Keep script running
wait
