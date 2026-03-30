#!/bin/bash

# Portfolio Site Deployment Script
# This script rebuilds and redeploys the portfolio site using the existing Docker Compose setup

set -e  # Exit on any error

echo "🚀 Starting Portfolio Site Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found. Please run this script from the portfolio_site directory."
    exit 1
fi

# Check if core.yml exists in parent directory
if [ ! -f "../core.yml" ]; then
    print_error "core.yml not found in parent directory. Please ensure you're in the correct location."
    exit 1
fi

print_status "📦 Installing dependencies..."
# Try npm ci first, fallback to npm install if lock file is out of sync
if ! npm ci; then
    print_warning "⚠️  Lock file out of sync, updating dependencies..."
    npm install
fi

print_status "🔍 Running linting checks..."
npm run lint

print_status "🧪 Running tests..."
npm run test:coverage

print_status "🐳 Building Docker image..."
cd ..
docker-compose -f core.yml build portfolio

print_status "🛑 Stopping current portfolio container..."
docker-compose -f core.yml stop portfolio || true
docker-compose -f core.yml rm -f portfolio || true

print_status "🚀 Starting new portfolio container..."
docker-compose -f core.yml up -d portfolio

print_status "⏳ Waiting for container to be ready..."
sleep 30

print_status "🏥 Performing health checks..."

# Check if the application is responding
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    print_success "✅ Main site is responding"
else
    print_error "❌ Main site is not responding"
    exit 1
fi

# Check if blog is accessible
if curl -f http://localhost:3000/blog > /dev/null 2>&1; then
    print_success "✅ Blog page is accessible"
else
    print_error "❌ Blog page is not accessible"
    exit 1
fi

# Check if new blog post is available (if this is a new post deployment)
if curl -f http://localhost:3000/blog/docker-series-part3 > /dev/null 2>&1; then
    print_success "✅ New blog post is available"
else
    print_warning "⚠️  New blog post not found (this is normal if it's not a new post)"
fi

print_status "🧹 Cleaning up old images..."
docker image prune -f

print_success "🎉 Portfolio site deployment completed successfully!"
print_success "🌐 Site is available at: https://jay739.dev"
print_success "📝 Blog is available at: https://jay739.dev/blog"

# Show container status
echo ""
print_status "📊 Container Status:"
docker-compose -f core.yml ps portfolio 