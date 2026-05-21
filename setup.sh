#!/bin/bash

# Property Management System - Supabase Deployment Setup Script
# This script helps you prepare for deployment

echo "================================"
echo "Supabase Deployment Setup Helper"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
echo -e "${BLUE}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

echo ""
echo -e "${BLUE}Setting up project for Supabase...${NC}"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env - Please fill in your Supabase credentials${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

if [ ! -f "frontend/.env.production" ]; then
    echo -e "${YELLOW}Creating frontend/.env.production${NC}"
    cp frontend/.env.example frontend/.env.production
    echo -e "${GREEN}✓ Created frontend/.env.production - Please fill in your credentials${NC}"
else
    echo -e "${GREEN}✓ frontend/.env.production already exists${NC}"
fi

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"

echo -e "${YELLOW}Backend dependencies...${NC}"
cd backend
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Backend dependency installation may have issues${NC}"
fi
cd ..

echo -e "${YELLOW}Frontend dependencies...${NC}"
cd frontend
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend dependency installation may have issues${NC}"
fi
cd ..

# Generate JWT Secret suggestion
echo ""
echo -e "${BLUE}Generating suggested JWT_SECRET...${NC}"
if command -v openssl &> /dev/null; then
    JWT_SECRET=$(openssl rand -base64 32)
else
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
fi
echo -e "${GREEN}Suggested JWT_SECRET:${NC}"
echo -e "${YELLOW}$JWT_SECRET${NC}"
echo ""
echo "Copy this to your backend/.env as JWT_SECRET value"

# Summary
echo ""
echo "================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your Supabase credentials"
echo "2. Edit frontend/.env.production with your credentials"
echo "3. Create Supabase project: https://supabase.com"
echo "4. Run migrations in Supabase SQL Editor"
echo "5. Test locally: npm run dev (in each folder)"
echo "6. Deploy to Vercel when ready"
echo ""
echo "For detailed instructions, see DEPLOYMENT_QUICK_START.md"
echo ""
