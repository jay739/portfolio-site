# 🚀 GitHub Actions Auto-Build Setup

This setup allows you to push blog posts to GitHub and have them automatically built and deployed to your VPS without eating all your server memory.

## 📋 Prerequisites

1. GitHub repository for your portfolio
2. Docker Hub account (free)
3. SSH access to your VPS

## 🔧 Setup Steps

### 1. Create Docker Hub Repository

```bash
# Login to Docker Hub
docker login

# Or create account at: https://hub.docker.com
```

### 2. Push Your Code to GitHub

```bash
cd /opt/portfolio

# Initialize git if not already done
git init
git add .
git commit -m "Initial portfolio setup"

# Add your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

### 3. Set Up GitHub Secrets

Go to your GitHub repo → Settings → Secrets and Variables → Actions

Add these secrets:

- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token
- `VPS_HOST` - Your VPS IP address or domain
- `VPS_USERNAME` - SSH username (probably `root` or `jay739`)
- `VPS_SSH_KEY` - Your private SSH key (paste entire content)

### 4. Update docker-compose.yml (One-time change)

Replace the portfolio service build section with:

```yaml
services:
  portfolio:
    image: YOUR_DOCKERHUB_USERNAME/portfolio:latest
    container_name: portfolio
    # ... rest stays the same
```

Or run this command:

```bash
cd /opt/portfolio
nano docker-compose.yml
# Change: build: context/dockerfile lines
# To: image: your_dockerhub_username/portfolio:latest
```

### 5. Test the Workflow

```bash
# Add a new blog post
nano content/blog/test-auto-deploy.mdx

# Commit and push
git add .
git commit -m "Add new blog post"
git push

# Watch the action run on GitHub:
# https://github.com/YOUR_USERNAME/portfolio/actions
```

## 🎯 How It Works

1. You add/edit files and push to GitHub
2. GitHub Actions builds the Docker image (on GitHub's servers, not your VPS!)
3. Image is pushed to Docker Hub
4. GitHub Actions SSH into your VPS and pulls the new image
5. Your portfolio restarts with the new content

## 🛠️ Manual Build (If Needed)

If you need to build locally:

```bash
cd /opt/portfolio
sudo ./build-with-swap.sh
```

This safely increases swap, builds, then cleans up automatically.

## 📝 Adding New Blog Posts

```bash
# 1. Create your blog post
nano /opt/portfolio/content/blog/my-new-post.mdx

# 2. Commit and push
cd /opt/portfolio
git add content/blog/my-new-post.mdx
git commit -m "Add new blog post: My New Post"
git push

# 3. Wait 2-3 minutes - it deploys automatically!
```

## 🔍 Monitoring Builds

- GitHub Actions: https://github.com/YOUR_USERNAME/portfolio/actions
- Docker Hub: https://hub.docker.com/r/YOUR_USERNAME/portfolio

## ❓ Troubleshooting

**Build fails on GitHub Actions:**
- Check you added all the secrets correctly
- Verify Dockerfile has no syntax errors

**Deployment fails:**
- Check VPS_SSH_KEY is the complete private key
- Verify SSH access works: `ssh VPS_USERNAME@VPS_HOST`

**Image not updating:**
- Check Watchtower is running: `docker ps | grep watchtower`
- Manually pull: `cd /opt/portfolio && docker-compose pull && docker-compose up -d`
