pipeline {

    agent any

    environment {

        FRONTEND_IMAGE = "dhruv110904/jeallo-frontend:latest"

        BACKEND_IMAGE = "dhruv110904/jeallo-backend:latest"
    }

    stages {

        stage('Create Frontend Env') {
            steps {

                writeFile file: 'jeallo/.env.production', text: '''
VITE_API_URL=http://43.205.113.7:8000

VITE_PUSHER_APP_KEY=jealloappkey

VITE_PUSHER_HOST=43.205.113.7

VITE_PUSHER_PORT=6001

VITE_PUSHER_SCHEME=http

VITE_PUSHER_CLUSTER=mt1
'''
            }
        }

        stage('Create Backend Env') {
            steps {

                writeFile file: 'jeallo-api/.env', text: '''
APP_NAME=Jeallo

APP_ENV=production

APP_DEBUG=false

APP_URL=http://43.205.113.7:8000

DB_CONNECTION=mysql

DB_HOST=db

DB_PORT=3306

DB_DATABASE=jeallo

DB_USERNAME=root

DB_PASSWORD=Dj@629409

FRONTEND_URL=http://43.205.113.7
'''
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
                ssh ubuntu@43.205.113.7"

                    cd jeallo &&

                    docker compose pull &&

                    docker compose up -d
                "
                '''
            }
        }
    }
}