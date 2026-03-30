#!/bin/bash
# Safe build script with temporary swap increase

set -e

TEMP_SWAP="/swapfile2"
SWAP_SIZE_MB=4096
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Portfolio Build Script with Memory Management${NC}"
echo "=================================================="

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run with sudo${NC}" 
   exit 1
fi

# Function to add temporary swap
add_swap() {
    if [ -f "$TEMP_SWAP" ]; then
        echo -e "${YELLOW}⚠️  Temporary swap already exists, removing old one...${NC}"
        swapoff "$TEMP_SWAP" 2>/dev/null || true
        rm -f "$TEMP_SWAP"
    fi
    
    echo -e "${GREEN}📦 Creating ${SWAP_SIZE_MB}MB temporary swap...${NC}"
    dd if=/dev/zero of="$TEMP_SWAP" bs=1M count=$SWAP_SIZE_MB status=progress
    chmod 600 "$TEMP_SWAP"
    mkswap "$TEMP_SWAP"
    swapon "$TEMP_SWAP"
    
    echo -e "${GREEN}✅ Temporary swap activated${NC}"
    free -h
}

# Function to remove temporary swap
remove_swap() {
    if [ -f "$TEMP_SWAP" ]; then
        echo -e "${YELLOW}🧹 Removing temporary swap...${NC}"
        swapoff "$TEMP_SWAP" 2>/dev/null || true
        rm -f "$TEMP_SWAP"
        echo -e "${GREEN}✅ Temporary swap removed${NC}"
        free -h
    fi
}

# Cleanup on exit (success or failure)
trap remove_swap EXIT INT TERM

# Add swap before build
add_swap

# Navigate to portfolio directory
cd "$(dirname "$0")"

# Build the portfolio
echo -e "${GREEN}🏗️  Building portfolio container...${NC}"
docker-compose build portfolio

echo -e "${GREEN}🚀 Restarting portfolio service...${NC}"
docker-compose up -d portfolio

echo -e "${GREEN}✅ Build complete! Temporary swap will be removed automatically.${NC}"
