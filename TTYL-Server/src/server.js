// Compile-time Monitoring //
const bootTimeStart = process.hrtime();

// Required Imports //
const express = require('express');
const fs = require('fs'); // File system R/W
require('dotenv').config({ path: '.env.local' });

const db = require('./utils/database');
const { setupSocket } = require('./services/socket');
const { writeLog } = require('./utils/logger');
const config = JSON.parse(fs.readFileSync('config.json'));

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: process.env.corsOrigin // * is a big security flaw - only allow your own domain
    }
});

/**
 * Returns the FQSV of the server
 * @returns {string} FQSV
 */
function getServVer() {
    const token = process.env.gitToken;
    const url = `https://api.github.com/repos/jPartridge96/TTYL/commits`;

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

    getServVer().then((build) => {
        try {
            writeLog(`${build} is starting on port ${config.server.port}`);
            http.listen(config.server.port, () => {
                const bootTimeEnd = process.hrtime(bootTimeStart);
                const bootTimeMs = Math.round((bootTimeEnd[0] * 1000) + (bootTimeEnd[1] / 1000000));
                writeLog(`${build} launched successfully after ${bootTimeMs}ms`);
            });
        } catch (err) {
            writeLog(`${build} could not be started: ${err}`);
        }
    }).then(() => {
        if(config.server.create_database) {
            writeLog(`CREATE_DATABASE set to true - Initializing databases`);
            db.initTables();
        }
    });
}

// Server Setup //
app.get('/', (req, res) => {
    getServVer().then((ver) => res.send(ver));
});
startServer();