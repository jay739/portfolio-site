# 🚀 Jenkins CI/CD Pipeline Setup for Portfolio Site

This guide explains how to set up and use the Jenkins CI/CD pipeline for automated deployment of your portfolio site.

## 📋 Prerequisites

- Jenkins server with Docker support
- Docker and Docker Compose installed on Jenkins server
- Node.js and npm installed on Jenkins server
- Git repository access
- SSH access to your deployment server (if using remote deployment)

## 🔧 Jenkins Setup

### 1. Install Required Jenkins Plugins

Install these plugins in Jenkins:
- **Docker Pipeline** - For Docker operations
- **SSH Agent** - For SSH deployments (if using remote deployment)
- **Email Extension** - For email notifications
- **HTML Publisher** - For test coverage reports
- **Pipeline** - For pipeline support

### 2. Configure Jenkins Credentials

#### For Docker Registry (if using remote registry):
1. Go to **Manage Jenkins** → **Manage Credentials**
2. Add new credentials:
   - **Kind**: Username with password
   - **ID**: `docker-registry-credentials`
   - **Username**: Your registry username
   - **Password**: Your registry password

#### For SSH Deployment (if using remote deployment):
1. Go to **Manage Jenkins** → **Manage Credentials**
2. Add new credentials:
   - **Kind**: SSH Username with private key
   - **ID**: `deploy-ssh-key`
   - **Username**: Your deployment user
   - **Private Key**: Your SSH private key

### 3. Configure Email Notifications

1. Go to **Manage Jenkins** → **Configure System**
2. Configure **Extended E-mail Notification**:
   - **SMTP server**: Your SMTP server
   - **SMTP Port**: 587 (or your port)
   - **Use SSL**: Yes
   - **Use TLS**: Yes
   - **Username**: Your email username
   - **Password**: Your email password

## 🏗️ Pipeline Configuration

### 1. Create Jenkins Pipeline Job

1. Go to **New Item** → **Pipeline**
2. Name it `portfolio-site-pipeline`
3. Configure the pipeline:

#### General Settings:
- ✅ **Discard old builds** (keep last 10)
- ✅ **This project is parameterized** (optional)

#### Pipeline Configuration:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: Your portfolio repository
- **Credentials**: Your Git credentials
- **Branch Specifier**: `*/main`
- **Script Path**: `portfolio_site/Jenkinsfile`

### 2. Configure Build Triggers

Choose one or more:

#### Option A: Webhook (Recommended)
1. Install **GitHub Integration** plugin
2. Configure webhook in your GitHub repository
3. Set webhook URL: `http://your-jenkins-url/github-webhook/`

#### Option B: Polling
- **Poll SCM**: `H/5 * * * *` (every 5 minutes)

#### Option C: Manual
- No triggers - manual builds only

## 🔄 Pipeline Stages

The pipeline includes these stages:

### 1. **Checkout**
- Clones your repository

### 2. **Install Dependencies**
- Runs `npm ci` to install Node.js dependencies

### 3. **Lint & Format Check**
- Runs ESLint and format checks
- Ensures code quality

### 4. **Run Tests**
- Executes unit tests with coverage
- Runs E2E tests
- Publishes test reports

### 5. **Security Scan**
- Runs security vulnerability scans
- Uses Snyk or similar tools

### 6. **Build Docker Image**
- Builds using your existing `core.yml` configuration
- Creates tagged images for versioning

### 7. **Test Docker Image**
- Starts container for testing
- Verifies application functionality
- Tests blog endpoints

### 8. **Deploy to Production**
- Stops current container
- Rebuilds and starts new container
- Uses your existing Docker Compose setup

### 9. **Health Check**
- Verifies deployment success
- Tests live endpoints
- Ensures new blog posts are accessible

## 🚀 Manual Deployment

If you prefer manual deployment, use the provided script:

```bash
cd portfolio_site
./deploy.sh
```

This script:
- Installs dependencies
- Runs tests
- Builds Docker image
- Deploys using Docker Compose
- Performs health checks

## 📧 Notifications

The pipeline sends email notifications for:
- ✅ **Successful deployments** with links to new content
- ❌ **Failed deployments** with error details and logs

## 🔧 Customization

### Environment Variables

Update these in the `Jenkinsfile`:

```groovy
environment {
    DOCKER_IMAGE = 'portfolio-site'
    DOCKER_TAG = "${env.BUILD_NUMBER}"
    CONTAINER_NAME = 'portfolio'
    COMPOSE_FILE = '../core.yml'
}
```

### Email Recipients

Update the email addresses in the `Jenkinsfile`:

```groovy
to: 'your-email@example.com'
```

### Health Check URLs

Customize the health check URLs:

```groovy
curl -f https://jay739.dev/ || exit 1
curl -f https://jay739.dev/blog || exit 1
curl -f https://jay739.dev/blog/docker-series-part3 || exit 1
```

## 🐛 Troubleshooting

### Common Issues:

1. **Docker Permission Denied**
   ```bash
   # Add jenkins user to docker group
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

2. **Network Issues**
   ```bash
   # Ensure proxy_net exists
   docker network create proxy_net
   ```

3. **Port Conflicts**
   ```bash
   # Check if port 3000 is in use
   sudo netstat -tlnp | grep :3000
   ```

4. **Build Failures**
   - Check Jenkins console logs
   - Verify all dependencies are installed
   - Ensure Docker daemon is running

### Debug Mode

To run pipeline in debug mode, add this to your Jenkinsfile:

```groovy
options {
    timestamps()
    timeout(time: 1, unit: 'HOURS')
}
```

## 📊 Monitoring

### Jenkins Dashboard
- View build history and status
- Check test coverage reports
- Monitor deployment times

### Application Monitoring
- Use Netdata for system monitoring
- Check container health status
- Monitor application logs

## 🔒 Security Considerations

1. **Credentials Management**
   - Store secrets in Jenkins credentials
   - Never hardcode passwords in Jenkinsfile

2. **Network Security**
   - Use internal networks for containers
   - Restrict external access

3. **Image Security**
   - Scan images for vulnerabilities
   - Use minimal base images
   - Keep images updated

## 📈 Best Practices

1. **Version Control**
   - Always commit changes before deployment
   - Use meaningful commit messages
   - Tag releases

2. **Testing**
   - Run tests before deployment
   - Maintain good test coverage
   - Test in staging environment

3. **Rollback Strategy**
   - Keep previous image versions
   - Document rollback procedures
   - Test rollback process

4. **Monitoring**
   - Set up alerts for failures
   - Monitor application performance
   - Track deployment metrics

## 🎯 Next Steps

1. Set up the pipeline in Jenkins
2. Configure webhooks for automatic triggers
3. Test the deployment process
4. Monitor the first few deployments
5. Customize notifications and alerts

---

**Need help?** Check the Jenkins logs or refer to the troubleshooting section above. 