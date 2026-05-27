pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "dhruv110904/jeallo-frontend:latest"
        BACKEND_IMAGE = "dhruv110904/jeallo-backend:latest"
    }

    stages {

        stage('Clone') {
            steps {
                git 'YOUR_GITHUB_REPO_URL'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t $FRONTEND_IMAGE ./jeallo'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t $BACKEND_IMAGE ./jeallo-api'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push $FRONTEND_IMAGE'
                sh 'docker push $BACKEND_IMAGE'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                ssh ubuntu@PRODUCTION_EC2_IP "
                    cd jeallo &&
                    docker compose pull &&
                    docker compose up -d
                "
                '''
            }
        }
    }
}