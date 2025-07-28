const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const async = require('async');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');

const app = express();

if (!fs.existsSync('/app/certs/key.pem') || !fs.existsSync('/app/certs/cert.pem')) {
  console.error("Certificats SSL non trouvés. Vérifie le volume Docker ou le pipeline Jenkins.");
  process.exit(1);
}

const server = https.createServer({
  key: fs.readFileSync('/app/certs/key.pem'),
  cert: fs.readFileSync('/app/certs/cert.pem')
}, app);

const io = require('socket.io')(server);

const port = process.env.PORT || 4000;

io.on('connection', function (socket) {
  socket.emit('message', { text : 'Welcome!' });

  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});

const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@db/postgres'
});

async.retry(
  { times: 1000, interval: 1000 },
  function(callback) {
    pool.connect(function(err, client, done) {
      if (err) {
        console.error("Waiting for db");
      }
      callback(err, client);
    });
  },
  function(err, client) {
    if (err) {
      return console.error("Giving up");
    }
    console.log("Connected to db");
    getVotes(client);
  }
);

function getVotes(client) {
  client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], function(err, result) {
    if (err) {
      console.error("Error performing query: " + err);
    } else {
      const votes = collectVotesFromResult(result);
      io.sockets.emit("scores", JSON.stringify(votes));
    }

    setTimeout(function() { getVotes(client); }, 1000);
  });
}

function collectVotesFromResult(result) {
  const votes = { a: 0, b: 0 };

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname + '/views/index.html'));
});

server.listen(port, function () {
  console.log('App running on HTTPS port ' + port);
});

