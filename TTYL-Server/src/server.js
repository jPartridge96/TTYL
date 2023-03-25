// Required Imports //
const express = require('express');
const cors = require('cors');
const fs = require('fs'); // File system R/W
const moment = require('moment-timezone'); // Timezone formatting
const twilio = require('twilio');
const Database = require('./services/database');
const { query } = require('express');
require('dotenv').config({ path: '.env.local' });

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: process.env.corsOrigin // * is a big security flaw - remove for prod
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

const client = require('twilio')(process.env.twilioAccSid, process.env.twilioAuth);

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
                case 'otpSend':
                    switch (args.length) {
                        case 3: // Verification Code
                            socket.emit('message-broadcast', { message: `A verification code has been sent to '${args[0]} (${args[1]}) ${args[2]}.`, userName: 'System', timestamp: utcTimestamp });
                            verifyOTP(args[0], args[1], args[2]);
                            break;
                        default:
                            socket.emit('message-broadcast', { message: `Incorrect command usage. Please check syntax and try again.`, userName: 'System', timestamp: utcTimestamp });
                            break;
                    }
                    break;
                case 'otpVerify':
                    switch (args.length) {
                        case 1: // Phone Number
                            socket.emit('message-broadcast', { message: `The verification code you have entered is incorrect.`, userName: 'System', timestamp: utcTimestamp });
                            break;
                        default:
                            socket.emit('message-broadcast', { message: `Incorrect command usage. Please check syntax and try again.`, userName: 'System', timestamp: utcTimestamp });
                            break;
                    }
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

function verifyOTP(countryCode, areaCode, phoneNumber) {
    let phNum = `${countryCode}${areaCode}${phoneNumber}`;

    client.verify.v2.services(process.env.twilioServSid)
    .verifications
    .create({to: phNum, channel: 'sms'})
    .then(verification => writeLog(verification.status));
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
    const token = process.env.gitToken;
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

// Server Init
async function startServer() {
    const db = new Database(writeLog);
    
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
    }).then(() => {
        db.initDb();
    });
    
}


startServer();
