#!/bin/bash
# Create a dedicated deploy user with minimal permissions

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔒 Creating Secure Deploy User${NC}"
echo "=================================="
echo ""

# Create deploy user
echo -e "${YELLOW}Creating 'deployer' user...${NC}"
useradd -m -s /bin/bash deployer || echo "User already exists"

# Add to docker group so it can manage containers
usermod -aG docker deployer

# Create SSH directory for deployer
mkdir -p /home/deployer/.ssh
chmod 700 /home/deployer/.ssh

# Generate SSH key for deployer
echo -e "${GREEN}Generating SSH key for deployer...${NC}"
ssh-keygen -t ed25519 -f /home/deployer/.ssh/id_ed25519 -N "" -C "deployer@backup-vps"

# Add to authorized_keys
cat /home/deployer/.ssh/id_ed25519.pub > /home/deployer/.ssh/authorized_keys
chmod 600 /home/deployer/.ssh/authorized_keys
chown -R deployer:deployer /home/deployer/.ssh

# Give deployer sudo access ONLY for docker commands (no password needed)
echo "# Allow deployer to run docker commands without password" > /etc/sudoers.d/deployer
echo "deployer ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/local/bin/docker-compose" >> /etc/sudoers.d/deployer
chmod 440 /etc/sudoers.d/deployer

# Give deployer ownership of portfolio directory
chown -R deployer:deployer /opt/portfolio

echo ""
echo -e "${GREEN}✅ Deploy user created!${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SSH Private Key for GitHub Actions:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat /home/deployer/.ssh/id_ed25519
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Update these GitHub Secrets:${NC}"
echo "  VPS_USERNAME → deployer (was: root)"
echo "  VPS_SSH_KEY → Use the key above"
echo ""
echo -e "${YELLOW}Test SSH access:${NC}"
echo "  ssh deployer@157.230.8.241"
echo ""
