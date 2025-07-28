FROM node:18-slim

# add curl for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tini && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/app

RUN npm install -g nodemon

COPY package*.json ./

RUN npm ci && \
 npm cache clean --force && \
 mv /usr/local/app/node_modules /node_modules

# Copie le code + les certificats
COPY . .

# Copie les certificats SSL dans un répertoire standard
COPY certs/ /usr/local/certs/

#Expose port HTTPS
ENV PORT 443
EXPOSE 443

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]

