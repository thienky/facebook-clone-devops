pipeline {
    agent any

    environment {
        API_IMAGE = 'facebook_clone_api_image:latest'
        FE_IMAGE = 'facebook_clone_fe_image:latest'
        COMPOSE_DIR = '/home/ubuntu/facebook-clone-core'
        API_SERVICE = 'facebook_clone_api'
        FE_SERVICE = 'facebook_clone_fe'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/YOUR_USER/facebook-clone-core.git'
            }
        }

        stage('Build API Image') {
            steps {
                dir('facebook-clone-core') {
                    sh 'docker build -t ${API_IMAGE} -f Dockerfile --target runtime .'
                }
            }
        }

        stage('Build FE Image') {
            steps {
                dir('facebook-clone-fe') {
                    sh 'docker build -t ${FE_IMAGE} -f Dockerfile --build-arg VITE_API_URL=http://YOUR_VPS_IP:3301 .'
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ssh-login', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER'),
                    string(credentialsId: 'ip-server-run', variable: 'IP_SERVER_RUN')
                ]) {
                    sh '''
                        docker save ${API_IMAGE} | gzip | ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${IP_SERVER_RUN} "gunzip | docker load"
                        docker save ${FE_IMAGE} | gzip | ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${IP_SERVER_RUN} "gunzip | docker load"

                        ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${SSH_USER}@${IP_SERVER_RUN} "
                            cd ${COMPOSE_DIR}
                            docker compose up -d --force-recreate ${API_SERVICE} ${FE_SERVICE}
                            docker image prune -f
                        "
                    '''
                }
            }
        }
    }
}
