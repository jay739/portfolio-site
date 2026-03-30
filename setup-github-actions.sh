#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  GitHub Actions Setup - Step by Step Instructions     ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo ""

echo -e "${YELLOW}📋 PREREQUISITES CHECKLIST:${NC}"
echo -e "${GREEN}✓${NC} Docker Hub account created"
echo -e "${GREEN}✓${NC} Portfolio on GitHub: https://github.com/jay739/portfolio-site"
echo -e "${GREEN}✓${NC} Workflow files committed (ready to push)"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Get Your Docker Hub Credentials${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Go to: https://hub.docker.com/settings/security"
echo "2. Click 'New Access Token'"
echo "3. Description: 'GitHub Actions Portfolio'"
echo "4. Access permissions: Read, Write, Delete"
echo "5. Click 'Generate'"
echo "6. COPY THE TOKEN (you'll only see it once!)"
echo ""
read -p "Press ENTER when you have your Docker Hub token..."
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Get Your VPS SSH Key${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "We'll copy your SSH private key to clipboard..."
echo ""

if [ -f ~/.ssh/id_rsa ]; then
    echo -e "${GREEN}Found SSH key: ~/.ssh/id_rsa${NC}"
    echo ""
    echo "Copy this ENTIRE key (including BEGIN and END lines):"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    cat ~/.ssh/id_rsa
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
elif [ -f ~/.ssh/id_ed25519 ]; then
    echo -e "${GREEN}Found SSH key: ~/.ssh/id_ed25519${NC}"
    echo ""
    echo "Copy this ENTIRE key (including BEGIN and END lines):"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    cat ~/.ssh/id_ed25519
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${RED}No SSH key found. Generating one...${NC}"
    ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
    cat ~/.ssh/id_ed25519
fi
echo ""
read -p "Press ENTER when you've copied the SSH key..."
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Add GitHub Secrets${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Go to: https://github.com/jay739/portfolio-site/settings/secrets/actions"
echo ""
echo "2. Click 'New repository secret' for each:"
echo ""
echo "   ${GREEN}DOCKER_USERNAME${NC}"
echo "   Value: Your Docker Hub username"
echo ""
echo "   ${GREEN}DOCKER_PASSWORD${NC}"
echo "   Value: The token you generated in Step 1"
echo ""
echo "   ${GREEN}VPS_HOST${NC}"
echo "   Value: $(hostname -I | awk '{print $1}')"
echo ""
echo "   ${GREEN}VPS_USERNAME${NC}"
echo "   Value: root"
echo ""
echo "   ${GREEN}VPS_SSH_KEY${NC}"
echo "   Value: The SSH key from Step 2 (entire key)"
echo ""
read -p "Press ENTER when all secrets are added..."
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Update docker-compose.yml${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "What is your Docker Hub username? " DOCKER_USERNAME
echo ""

# Backup current docker-compose.yml
cp /opt/portfolio/docker-compose.yml /opt/portfolio/docker-compose.yml.backup

# Create updated version
cat > /opt/portfolio/docker-compose.yml.new << EOF
services:
  portfolio:
    image: ${DOCKER_USERNAME}/portfolio:latest
    container_name: portfolio
    ports:
      - "3000:3000"
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - NODE_OPTIONS=--max-old-space-size=2048
    mem_limit: 2g
    memswap_limit: 3g
    networks:
      - default
      - batcave_default
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  sentry-webhook:
    build:
      context: .
      dockerfile: Dockerfile.webhook
    container_name: sentry-webhook
    ports:
      - "3007:3007"
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - "NODE_ENV=production"
    networks:
      - default
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

networks:
  default:
    driver: bridge
  batcave_default:
    external: true
EOF

mv /opt/portfolio/docker-compose.yml.new /opt/portfolio/docker-compose.yml

echo -e "${GREEN}✓ docker-compose.yml updated!${NC}"
echo -e "${YELLOW}  (Backup saved as docker-compose.yml.backup)${NC}"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 5: Push to GitHub${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Pushing workflow and changes to GitHub..."
cd /opt/portfolio
git add docker-compose.yml
git commit -m "Update docker-compose for automated builds"
git push origin main
echo ""
echo -e "${GREEN}✓ Pushed to GitHub!${NC}"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 6: Watch the Magic Happen${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "The GitHub Action should start automatically!"
echo ""
echo "Monitor here: https://github.com/jay739/portfolio-site/actions"
echo ""
echo "Build takes ~5-10 minutes on first run"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 Setup Complete!                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📝 Next time you add a blog post:${NC}"
echo ""
echo "  cd /opt/portfolio"
echo "  nano content/blog/my-new-post.mdx"
echo "  git add ."
echo "  git commit -m 'Add new blog post'"
echo "  git push"
echo ""
echo "  Then watch it auto-deploy! 🚀"
echo ""
