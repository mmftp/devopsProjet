pipeline {
  agent any
  environment {
    VOTING_PORT = '5002'
    RESULT_PORT = '5001'
    POSTGRES_USER = 'postgres'
    POSTGRES_PASSWORD = 'postgres'
    OPTION_A = 'Cats'
    OPTION_B = 'Dogs'
  }
  stages {
    stage('Cloner le dépôt') {
      steps {
        git branch: 'main', url: 'https://github.com/mmftp/devopsProjet'
      }
    }
    stage('Construire les images') {
      steps {
        sh 'docker-compose build'
      }
    }
    stage('Lancer les services') {
      steps {
        sh 'docker-compose up -d'
      }
    }
    stage('Tester les applications HTTPS') {
      steps {
        script {
          // Test du result-app
          echo "Test de result-app en HTTPS..."
          sh '''
          for i in {1..15}; do
            echo "Tentative $i : vérification result-app HTTPS..."
            if docker exec votingappproject-result-app-1 curl -k -sf https://localhost:443 > /dev/null; then
              echo "✅ result-app accessible en HTTPS !"
              break
            fi
            if [ $i -eq 15 ]; then
              echo "❌ result-app HTTPS échec après 15 tentatives"
              docker logs votingappproject-result-app-1
              exit 1
            fi
            sleep 3
          done
          '''
          
          // Test du voting-app
          echo "Test de voting-app en HTTPS..."
          sh '''
          for i in {1..15}; do
            echo "Tentative $i : vérification voting-app HTTPS..."
            if docker exec votingappproject-voting-app-1 curl -k -sf https://localhost:443 > /dev/null; then
              echo "✅ voting-app accessible en HTTPS !"
              break
            fi
            if [ $i -eq 15 ]; then
              echo "❌ voting-app HTTPS échec après 15 tentatives"
              docker logs votingappproject-voting-app-1
              exit 1
            fi
            sleep 3
          done
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
                <p>Le déploiement de l'application de vote a échoué. Veuillez consulter les logs Jenkins pour plus de détails.</p>
                
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
          to: 'tpmmf45@gmail.com',
          mimeType: 'text/html'
        )
      }
    }
    success {
      echo '''
      🎉 Déploiement réussi ! 
      
      Applications accessibles sur :
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
                
                <h3>🎉 Déploiement réussi !</h3>
                <p>L'application de vote a été déployée avec succès en HTTPS.</p>
                
                <h4>Applications accessibles :</h4>
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
          to: 'tpmmf45@gmail.com',
          mimeType: 'text/html'
        )
      }
    }
    always {
      echo 'Nettoyage des ressources...'
      // Optionnel : nettoyage des containers si nécessaire
      // sh 'docker-compose down'
    }
  }
}
