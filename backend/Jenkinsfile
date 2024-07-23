pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('DOCKER_HUB_CREDENTIAL')
        VERSION = "${env.BUILD_ID}"
    }

    tools {
        maven "Maven"
    }

    stages {
        stage('Maven Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'mvn test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh 'mvn clean org.jacoco:jacoco-maven-plugin:prepare-agent install sonar:sonar -Dsonar.host.url=http://52.221.240.96:9000/ -Dsonar.login=squ_8cddc80d679711a331bc68b8375cc7fd6b15a1a2'
            }
        }

        stage('Check Code Coverage') {
            steps {
                script {
                    def token = "squ_8cddc80d679711a331bc68b8375cc7fd6b15a1a2"
                    def sonarQubeUrl = "http://52.221.240.96:9000/api"
                    def componentKey = "online.syncio:backend"
                    def coverageThreshold = 80.0

                    def response = sh (
                        script: "curl -H 'Authorization: Bearer ${token}' '${sonarQubeUrl}/measures/component?component=${componentKey}&metricKeys=coverage'",
                        returnStdout: true
                    ).trim()

                    def coverage = sh (
                        script: "echo '${response}' | jq -r '.component.measures[0].value'",
                        returnStdout: true
                    ).trim()

                    echo "Coverage raw value: ${coverage}"

                    if (coverage == "null" || coverage == "") {
                        echo "Coverage information is not available. Skipping coverage check."
                    } else {
                        def coverageValue = coverage.toDouble()
                        echo "Coverage: ${coverageValue}%"

                        if (coverageValue < coverageThreshold) {
                            error "Coverage is below the threshold of ${coverageThreshold}%. Aborting the pipeline."
                        }
                    }
                }
            }
        }

        stage('Docker Build and Push') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh 'docker build -t chuthanh/dockerfile-backend:${VERSION} .'
                sh 'docker push chuthanh/dockerfile-backend:${VERSION}'
            }
        }

        stage('Cleanup Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Update Image Tag in GitOps') {
            steps {
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'git-ssh', url: 'git@github.com:synciowebb/deployment-folder.git']])
                script {
                    sh '''
                    sed -i "s/image:.*/image: chuthanh\\/dockerfile-backend:${VERSION}/" aws/backend-deployment.yaml
                    '''
                    sh 'git checkout main'
                    sh 'git add .'
                    sh 'git commit -m "Update image tag"'
                    sshagent(['git-ssh']) {
                        sh('git push')
                    }
                }
            }
        }
    }
}
