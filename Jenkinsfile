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

    stage('Tester result-app HTTPS') {
      steps {
        script {
          echo "Test de result-app en HTTPS..."
          
          sh '''
          for i in {1..15}; do
            echo "Tentative $i : vérification HTTPS..."
            if docker exec votingappproject-result-app-1 curl -k -sf https://localhost:443 > /dev/null; then
              echo "result-app accessible en HTTPS !"
              exit 0
            fi
            sleep 5
          done
          
          echo "Échec du test HTTPS"
          docker logs votingappproject-result-app-1
          exit 1
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
      echo 'Déploiement réussi ! result-app accessible sur https://localhost:5001'
    }
  }
}
