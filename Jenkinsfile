pipeline {
    agent any
    tools {
        nodejs 'Node22' // Sesuaikan dengan nama di Global Tool Configuration
    }
    environment {
        TARGET_DIR = '/home/mchdfrhn/Project/inventory-js' // Ganti dengan folder tujuan lokal kamu
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/mchdfrhn/inventory-js.git', branch: 'master'
            }
        }
        stage('Verify Tools') {
            steps {
                sh '''
                    node -v
                    npm -v
                '''
            }
        }
        stage('Prepare Local Directory') {
            steps {
                sh '''
                    cp -r frontend/* ${TARGET_DIR}/frontend/
                    cp -r backend/* ${TARGET_DIR}/backend/
                '''
            }
        }
        stage('Install Dependencies') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir("${TARGET_DIR}/frontend") {
                            sh 'npm install'
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir("${TARGET_DIR}/backend") {
                            sh 'npm install'
                        }
                    }
                }
            }
        }
        stage('Run Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir("${TARGET_DIR}/frontend") {
                            sh 'npm test'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir("${TARGET_DIR}/backend") {
                            sh 'npm test'
                        }
                    }
                }
            }
        }
        stage('Build and Run') {
            when {
                branch 'master'
            }
            steps {
                // Build Frontend
                dir("${TARGET_DIR}/frontend") {
                    sh 'npm run dev'
                    sh 'echo "Frontend running on port 5173 (check pm2 list)"'
                }
                // Run Backend
                dir("${TARGET_DIR}/backend") {
                    sh 'npm run dev'
                    sh 'echo "Backend running on port 8000 (check pm2 list)"'
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline completed'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
    }
}