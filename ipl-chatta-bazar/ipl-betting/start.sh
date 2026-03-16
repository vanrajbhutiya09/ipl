#!/bin/bash
# IPL Chatta Bazar - Quick Start Script
# Run: chmod +x start.sh && ./start.sh

echo "🏏 Starting IPL Chatta Bazar..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java not found. Install Java 17: https://adoptium.net${NC}"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from: https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Java and Node.js found${NC}"

# Start Backend
echo -e "${YELLOW}🚀 Starting Spring Boot backend on port 8080...${NC}"
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Install frontend deps if needed
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start Frontend
echo -e "${YELLOW}🎨 Starting React frontend on port 3000...${NC}"
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo -e "${GREEN}======================================"
echo "🏏 IPL CHATTA BAZAR IS RUNNING!"
echo "======================================"
echo -e "📱 Frontend:  http://localhost:3000"
echo -e "⚙️  Backend:   http://localhost:8080"
echo ""
echo -e "👑 Admin Login:"
echo -e "   Username: admin"
echo -e "   Password: admin123"
echo ""
echo -e "💡 To go live, run in a new terminal:"
echo -e "   ngrok http 8080   (for backend)"
echo -e "   ngrok http 3000   (for frontend)"
echo -e "======================================${NC}"

# Handle exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped all services.'" EXIT

# Keep running
wait
