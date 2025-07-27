# Dockerfile : Jenkins avec Docker préinstallé
FROM jenkins/jenkins:lts

USER root

# Installation Docker CLI
RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean

# Installer docker-compose
RUN curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose    

# Revenons à l'utilisateur Jenkins par défaut
USER jenkins

