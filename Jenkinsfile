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
    }
    success {
      echo '''
      🎉 Déploiement réussi ! 
      
      Applications accessibles sur :
      • 🗳️  Voting-app (HTTPS): https://localhost:5002
      • 📊 Result-app (HTTPS): https://localhost:5001
      
      Note: Accepter les certificats auto-signés dans votre navigateur.
      '''
    }
  }
}
