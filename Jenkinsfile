pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    // ===== Variables projet =====
    DOCKERHUB_NAMESPACE = 'tpmmf'     
    IMAGE_TAG = 'dev'                 

    // ===== Variables apps (inchangées) =====
    VOTING_PORT = '5002'
    RESULT_PORT = '5001'
    POSTGRES_USER = 'postgres'
    POSTGRES_PASSWORD = 'postgres'
    OPTION_A = 'Cats'
    OPTION_B = 'Dogs'

    // ===== Notification =====
    EMAIL_TO = 'tpmmf45@gmail.com'
  }

  stages {

    stage('Cloner le dépôt') {
      steps {
        git branch: 'main', url: 'https://github.com/mmftp/devopsProjet'
      }
    }

    stage('Version') {
      steps {
        script {
          def shortSha = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${shortSha}"
          echo "IMAGE_TAG=${env.IMAGE_TAG}"
        }
      }
    }

    stage('Build images') {
      steps {
        // Build en utilisant les champs image: du docker-compose.yml
        sh 'docker-compose build'
      }
    }

    stage('Démarrer les services') {
      steps {
        sh 'docker-compose up -d'
      }
    }

    stage('Tests HTTPS (sanity checks)') {
      steps {
        script {
          // Test result-app en HTTPS via curl depuis le conteneur
          echo "Test de result-app en HTTPS..."
          sh '''
          for i in {1..15}; do
            echo "Tentative $i : vérification result-app HTTPS..."
            if docker-compose exec -T result-app curl -k -sf https://localhost:443 > /dev/null; then
              echo "✅ result-app accessible en HTTPS !"
              break
            fi
            if [ $i -eq 15 ]; then
              echo "❌ result-app HTTPS échec après 15 tentatives"
              docker-compose logs result-app
              exit 1
            fi
            sleep 3
          done
          '''

          // Test voting-app en HTTPS via curl depuis le conteneur
          echo "Test de voting-app en HTTPS..."
          sh '''
          for i in {1..15}; do
            echo "Tentative $i : vérification voting-app HTTPS..."
            if docker-compose exec -T voting-app curl -k -sf https://localhost:443 > /dev/null; then
              echo "✅ voting-app accessible en HTTPS !"
              break
            fi
            if [ $i -eq 15 ]; then
              echo "❌ voting-app HTTPS échec après 15 tentatives"
              docker-compose logs voting-app
              exit 1
            fi
            sleep 3
          done
          '''
        }
      }
    }

    stage('Login & Push vers Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-mmftp',
                                          usernameVariable: 'DOCKERHUB_USER',
                                          passwordVariable: 'DOCKERHUB_PASS')]) {
          sh '''
            echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin docker.io

            # Push des tags versionnés (un seul dépôt : ${DOCKERHUB_NAMESPACE}/voting-app)
            docker push docker.io/${DOCKERHUB_NAMESPACE}/voting-app:voting-app-${IMAGE_TAG}
            docker push docker.io/${DOCKERHUB_NAMESPACE}/voting-app:result-app-${IMAGE_TAG}
            docker push docker.io/${DOCKERHUB_NAMESPACE}/voting-app:worker-${IMAGE_TAG}

            # (Optionnel) Publier aussi des alias "latest" par service
            docker tag docker.io/${DOCKERHUB_NAMESPACE}/voting-app:voting-app-${IMAGE_TAG}  docker.io/${DOCKERHUB_NAMESPACE}/voting-app:voting-app-latest
            docker tag docker.io/${DOCKERHUB_NAMESPACE}/voting-app:result-app-${IMAGE_TAG}  docker.io/${DOCKERHUB_NAMESPACE}/voting-app:result-app-latest
            docker tag docker.io/${DOCKERHUB_NAMESPACE}/voting-app:worker-${IMAGE_TAG}      docker.io/${DOCKERHUB_NAMESPACE}/voting-app:worker-latest

            docker push docker.io/${DOCKERHUB_NAMESPACE}/voting-app:voting-app-latest
            docker push docker.io/${DOCKERHUB_NAMESPACE}/voting-app:result-app-latest
            docker push docker.io/${DOCKERHUB_NAMESPACE}/voting-app:worker-latest

            docker logout docker.io
          '''
        }
      }
    }
  }

  post {
    failure {
      echo 'Le pipeline a échoué.'
      script {
        def buildDuration = currentBuild.durationString.replace(' and counting', '')
        emailext (
          subject: "❌ ÉCHEC - Pipeline DevOps Voting App - Build #${BUILD_NUMBER}",
          body: """
            <html>
            <body style="font-family: Arial, sans-serif;">
              <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px;">
                <h2 style="color: #721c24;">❌ Pipeline échoué</h2>
                <p><strong>Projet :</strong> DevOps Voting Application</p>
                <p><strong>Build :</strong> #${BUILD_NUMBER}</p>
                <p><strong>Branche :</strong> main</p>
                <p><strong>Durée :</strong> ${buildDuration}</p>
                <p><strong>Timestamp :</strong> ${new Date()}</p>
                <h3>Détails de l'échec :</h3>
                <p>Le déploiement a échoué. Consulte les logs Jenkins pour plus de détails.</p>
                <p><a href="${BUILD_URL}" style="background-color: #dc3545; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px;">Voir les logs Jenkins</a></p>
                <hr style="margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                  Notification automatique de Jenkins CI/CD<br>
                  Repository: https://github.com/mmftp/devopsProjet
                </p>
              </div>
            </body>
            </html>
          """,
          to: "${EMAIL_TO}",
          mimeType: 'text/html'
        )
      }
    }

    success {
      echo '''
      🎉 Déploiement & Push réussis !

      Applications accessibles en local :
      • 🗳️  Voting-app (HTTPS): https://localhost:5002
      • 📊 Result-app (HTTPS): https://localhost:5001

      Note: Accepter les certificats auto-signés dans votre navigateur.
      '''
      script {
        def buildDuration = currentBuild.durationString.replace(' and counting', '')
        emailext (
          subject: "✅ SUCCÈS - Pipeline DevOps Voting App - Build #${BUILD_NUMBER}",
          body: """
            <html>
            <body style="font-family: Arial, sans-serif;">
              <div style="background-color: #d1edff; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px;">
                <h2 style="color: #0c5460;">✅ Pipeline réussi</h2>
                <p><strong>Projet :</strong> DevOps Voting Application</p>
                <p><strong>Build :</strong> #${BUILD_NUMBER}</p>
                <p><strong>Branche :</strong> main</p>
                <p><strong>Durée :</strong> ${buildDuration}</p>
                <p><strong>Timestamp :</strong> ${new Date()}</p>

                <h3>Images publiées (dépôt unique)</h3>
                <ul>
                  <li><code>docker.io/${DOCKERHUB_NAMESPACE}/voting-app:voting-app-${IMAGE_TAG}</code> (+ <code>voting-app-latest</code>)</li>
                  <li><code>docker.io/${DOCKERHUB_NAMESPACE}/voting-app:result-app-${IMAGE_TAG}</code> (+ <code>result-app-latest</code>)</li>
                  <li><code>docker.io/${DOCKERHUB_NAMESPACE}/voting-app:worker-${IMAGE_TAG}</code> (+ <code>worker-latest</code>)</li>
                </ul>

                <h4>Apps locales :</h4>
                <ul>
                  <li>🗳️ <strong>Voting-app (HTTPS):</strong> <a href="https://localhost:5002">https://localhost:5002</a></li>
                  <li>📊 <strong>Result-app (HTTPS):</strong> <a href="https://localhost:5001">https://localhost:5001</a></li>
                </ul>

                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 3px; margin: 15px 0;">
                  <strong>Note:</strong> Accepter les certificats auto-signés dans votre navigateur.
                </div>

                <h4>Configuration du vote :</h4>
                <ul>
                  <li><strong>Option A :</strong> ${OPTION_A}</li>
                  <li><strong>Option B :</strong> ${OPTION_B}</li>
                </ul>

                <p><a href="${BUILD_URL}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px;">Voir les détails du build</a></p>
                <hr style="margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">
                  Notification automatique de Jenkins CI/CD<br>
                  Repository: https://github.com/mmftp/devopsProjet
                </p>
              </div>
            </body>
            </html>
          """,
          to: "${EMAIL_TO}",
          mimeType: 'text/html'
        )
      }
    }

    always {
      echo 'Nettoyage des ressources...'
      // Optionnel : arrêt / nettoyage si tu ne veux pas garder les services en route
      // sh 'docker-compose down -v'
    }
  }
}

