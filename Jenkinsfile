pipeline {
    agent any
    tools {
        nodejs 'Node22' // Sesuaikan dengan nama di Global Tool Configuration
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/mchdfrhn/inventory-js.git', credentialsId: 'github-credentials', branch: 'master'
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
        stage('Install and Test Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install
                        npm test
                    '''
                }
            }
        }
        stage('Install and Test Backend') {
            steps {
                dir('backend') {
                    sh '''
                        npm install
                        npm test
                    '''
                }
            }
        }
        stage('Deploy Locally') {
            when {
                branch 'master'
            }
            steps {
                dir('frontend') {
                    sh '''
                        npm run dev
                    '''
                }
                dir('backend') {
                    sh '''
                        npm run dev
                    '''
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