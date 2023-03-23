// Required Imports //
const express = require('express');
const cors = require('cors');
const fs = require('fs'); // File system R/W
const moment = require('moment-timezone'); // Timezone formatting
const mysql = require('mysql2');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*" // * is a big security flaw - remove for prod
    }
});

// Compile-time Monitoring //
const bootTimeStart = process.hrtime();

// Server Configuration //
const SERV_NAME = "TOTYL"
const SERV_VER = 0.01;
const SERV_PORT = 3000;

const PROD_VER = false;
const ENABLE_LOGGING = false;

// Server Logging //
const logsDir = './logs';
const fileName = `${logsDir}/totyl_${moment.utc().format('M-DD-YYYY_HH-mm-ss')}.log`;

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

if(ENABLE_LOGGING) {
    try {
        fs.closeSync(fs.openSync(fileName, 'w'));
        console.log(`Created log file: ${fileName}`);
    } catch (error) {
      console.error(`Failed to create log file: ${fileName}. Error: ${error}`);
    }
    const logStream = fs.createWriteStream(fileName, { flags: 'a' });
    
    app.get('/', (req, res) => {
        getServVer().then((ver) => res.send(ver));
    });
} else {
    console.log("Server Logging is disabled - files will not be saved.");
}

let userList = new Map();

// When user connects - init user data and add socket events
io.on('connection', (socket) => {
    let userName = socket.handshake.query.userName;
    addUser(userName, socket.id);
    writeLog(`${userName} has connected. [${socket.id}]`);

    socket.broadcast.emit('user-list', [...userList.keys()]);
    socket.emit('user-list', [...userList.keys()]);

    // When User sends message
    socket.on('message', (msg) => {
        const utcTimestamp = new Date().toUTCString();
        const timestamp = new Date(utcTimestamp).toLocaleString('en-US', {hour12: false});
        const formattedTimestamp = timestamp.replace(',', '');

        if (msg.startsWith('/')) { // Message is a command
            const cmd = msg.split(' ')[0].substring(1);
            const args = msg.split(' ').slice(1);
    
            switch (cmd) {
                case 'cmd':
                    socket.emit('message-broadcast', { message: `${userName} used command: ${cmd}`, userName: 'System', timestamp: utcTimestamp });
                    writeLog(`[${formattedTimestamp}] ${userName}: issued command: ${cmd}`);
                    break;
                default:
                    socket.emit('message-broadcast', { message: `Unknown command: ${cmd}`, userName: 'System', timestamp: utcTimestamp });
                    break;
            }
        } else {
            const message = { message: msg, userName: userName, timestamp: utcTimestamp };
            socket.broadcast.emit('message-broadcast', message);
            writeLog(`[${formattedTimestamp}] ${userName}: ${msg}`);
        }
    });

    // When User disconnects
    socket.on('disconnect', (reason) => {
        delUser(userName, socket.id);
        socket.broadcast.emit('user-list', [...userList.keys()]);
        socket.emit('user-list', [...userList.keys()]);
        writeLog(`${userName} has disconnected (${reason}). [${socket.id}]`);
    });
});

// Add the user to the chat room
function addUser(userName, id) {
    if(!userList.has(userName)) {
        userList.set(userName, new Set(id))
    } else {
        userList.get(userName).add(id);
    }
}

// Remove user from the chat room
function delUser(userName, id) {
    if(userList.has(userName)) {
        let userIds = userList.get(userName);
        if(userIds.size != 0) {
            userList.delete(userName);
        }
    }
}

//Add user to server
function addUsertoServer(name, email, password) {
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    connection.query(query, [name, email, password], (err, result) => {
        if (err) {
            writeLog('Error inserting data:', err.stack);
            return;
        }
        writeLog('Data inserted with ID:', result.insertId);
    });
} // addUsertoServer('John Doe', 'john.doe@example.com', 'johns_password');

// Returns FQSV using commit counts with GitHub API
// Format: <major>.<minor>.<commit>
function getServVer() {
    const token = "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";
    const url = `https://api.github.com/repos/jPartridge96/TTYL/commits`;

    return fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then((response) => response.json())
    .then((data) => {
        return `${SERV_NAME}-${SERV_VER}.${data.length}`;
    });
}

function writeLog(message) {
    console.log(message);
    if (ENABLE_LOGGING) {
        logStream.write(`${message}\n`);
    }
}

// Create SQL Connection
const connection = mysql.createConnection({
    host: 'localhost', //localhost unless hosted elsewhere
    user: 'root', //leave as root (the user you sign on with when you connect to server)
    password: '?', //password for that
    database: 'TTYLdb' //name the database
});

// Connects to DB - Server starts without DB if not a production version 
connection.connect((err) => {
    if(err && PROD_VER) {
        writeLog(`Error connecting to ${connection.database}: ${err}`);
        return;
    } else if(PROD_VER) {
        writeLog('Connected to server', connection.threadId);
    }
    initServer();
});

// Server Init
function initServer() {
    getServVer().then((build) => {
        try {
            writeLog(`${build} is starting on port ${SERV_PORT}`);
            http.listen(SERV_PORT, () => {
                const bootTimeEnd = process.hrtime(bootTimeStart);
                const bootTimeMs = Math.round((bootTimeEnd[0] * 1000) + (bootTimeEnd[1] / 1000000));
                writeLog(`${build} launched successfully after ${bootTimeMs}ms`);
            });
        } catch (err) {
            writeLog(`${build} could not be started: ${err}`);
        }
    });
}