// Compile-time Monitoring //
const bootTimeStart = process.hrtime();

// Required Imports //
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const db = require('./utils/database');
const { setupSocket } = require('./services/socket');
const { writeLog } = require('./utils/logger');
const config = JSON.parse(fs.readFileSync('config.json'));

const app = express();
var server = null;

// SSL //
if(process.env.sslCert && process.env.sslCa && process.env.sslKey && process.env.enable_ssl === 'true') {
    const cert = fs.readFileSync(path.join(__dirname, process.env.sslCert));
    const ca = fs.readFileSync(path.join(__dirname, process.env.sslCa));
    const key = fs.readFileSync(path.join(__dirname, process.env.sslKey));

    server = https.createServer({ cert, ca, key }, app);
} else {
  server = http.createServer(app);
}

// Sockets //
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        exposedHeaders: ['Access-Control-Allow-Origin']
    }
});


/**
 * Returns the FQSV of the server
 * @returns {string} FQSV
 */
function getServVer() {
    const token = process.env.gitToken;
    const url = `https://api.github.com/repos/jPartridge96/TTYL/commits?sha=main&per_page=500`;

    return fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then((response) => response.json())
    .then((data) => {
        return `${config.app.name}-${config.app.version}.${data.length}`;
    });
}

/**
 * Starts the server
 */
async function startServer() {    
    // Socket.io Setup
    setupSocket(io);

    const build = await getServVer();
    try {
      writeLog(`${build} is starting on port ${config.server.port}`);
      server.listen(config.server.port, () => {
        const bootTimeEnd = process.hrtime(bootTimeStart);
        const bootTimeMs = Math.round((bootTimeEnd[0] * 1000) + (bootTimeEnd[1] / 1000000));
        writeLog(`${build} launched successfully after ${bootTimeMs}ms`);
      });
    } catch (err) {
      writeLog(`${build} could not be started: ${err}`);
    }
  
    if (config.server.create_database) {
      writeLog(`CREATE_DATABASE set to true - Initializing databases`);
      db.initTables();
    }
  }


// Server Setup //
app.get('/', (req, res) => {
    getServVer().then((ver) => res.send(ver));
});

// REST DB IMG
app.get('/api/image/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = `SELECT avatar FROM profiles WHERE id = ${id}`;
    const results = await db.connection.query(query);
    const avatarBuffer = results[0][0].avatar;
    const avatarBase64 = avatarBuffer.toString('base64');
    const avatarDataUri = `data:image/png;base64,${avatarBase64}`;
    
    res.status(200).send(avatarDataUri);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch image data' });
    console.log(error);
  }
});

startServer();