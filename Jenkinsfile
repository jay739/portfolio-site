pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'portfolio-site'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'portfolio'
        COMPOSE_FILE = '../core.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out source code...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js dependencies...'
                sh '''
                    # Try npm ci first, fallback to npm install if lock file is out of sync
                    if ! npm ci; then
                        echo "⚠️  Lock file out of sync, updating dependencies..."
                        npm install
                    fi
                '''
            }
        }
        
        stage('Lint & Format Check') {
            steps {
                echo '🔍 Running linting and format checks...'
                sh 'npm run lint'
                sh 'npm run format:check || true'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'npm run test:coverage'
                
                echo '🧪 Running E2E tests...'
                sh 'npm run e2e:headless'
            }
            post {
                always {
                    echo '📊 Publishing test results...'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo '🔒 Running security scans...'
                sh 'npm run security-check'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image using existing compose setup...'
                script {
                    // Build using the existing core.yml configuration
                    sh '''
                        cd ..
                        docker-compose -f core.yml build portfolio
                        docker tag docker_services_portfolio:latest portfolio-site:${BUILD_NUMBER}
                        docker tag docker_services_portfolio:latest portfolio-site:latest
                    '''
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                echo '🧪 Testing Docker image...'
                sh '''
                    # Start container for testing using the same config as production
                    docker run -d --name test-portfolio \
                        -p 3001:3000 \
                        --network proxy_net \
                        portfolio-site:${BUILD_NUMBER}
                    
                    # Wait for container to be ready
                    sleep 30
                    
                    # Test if the application is responding
                    curl -f http://localhost:3001/ || exit 1
                    
                    # Test blog endpoint specifically
                    curl -f http://localhost:3001/blog || exit 1
                    
                    # Test new blog post
                    curl -f http://localhost:3001/blog/ci-cd-test-post || exit 1
                    
                    # Clean up test container
                    docker stop test-portfolio
                    docker rm test-portfolio
                '''
            }
        }
        

        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to production using existing compose setup...'
                script {
                    // Deploy using Docker Compose
                    sh '''
                        cd ..
                        
                        echo "🛑 Stopping current portfolio container..."
                        docker-compose -f core.yml stop portfolio
                        docker-compose -f core.yml rm -f portfolio
                        
                        echo "🔄 Rebuilding portfolio service..."
                        docker-compose -f core.yml build portfolio
                        
                        echo "🚀 Starting portfolio service..."
                        docker-compose -f core.yml up -d portfolio
                        
                        echo "🧹 Cleaning up old images..."
                        docker image prune -f
                        
                        echo "✅ Deployment completed!"
                    '''
                }
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo '🏥 Performing health checks...'
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        sh '''
                            # Wait for deployment to stabilize
                            sleep 60
                            
                            # Check if the application is responding
                            curl -f https://jay739.dev/ || exit 1
                            
                            # Check if blog is accessible
                            curl -f https://jay739.dev/blog || exit 1
                            
                            # Check if new blog post is available
                            curl -f https://jay739.dev/blog/ci-cd-test-post || exit 1
                            
                            echo "✅ All health checks passed!"
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo '🎉 Pipeline completed successfully!'
            script {
                if (env.BRANCH_NAME == 'main') {
                    // Send success notification
                    emailext (
                        subject: "✅ Portfolio Site Deployed Successfully - Build #${env.BUILD_NUMBER}",
                        body: """
                        <h2>🎉 Deployment Successful!</h2>
                        <p><strong>Build:</strong> #${env.BUILD_NUMBER}</p>
                        <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                        <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                        <p><strong>Deployed to:</strong> https://jay739.dev</p>
                        <p><strong>New Blog Post:</strong> https://jay739.dev/blog/docker-series-part3</p>
                        """,
                        to: 'your-email@example.com'
                    )
                }
            }
        }
        failure {
            echo '❌ Pipeline failed!'
            script {
                // Send failure notification
                emailext (
                    subject: "❌ Portfolio Site Deployment Failed - Build #${env.BUILD_NUMBER}",
                    body: """
                    <h2>❌ Deployment Failed!</h2>
                    <p><strong>Build:</strong> #${env.BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                    <p><strong>Console Log:</strong> <a href="${env.BUILD_URL}console">View Log</a></p>
                    """,
                    to: 'your-email@example.com'
                )
            }
        }
    }
} 