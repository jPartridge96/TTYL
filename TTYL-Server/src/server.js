// Compile-time Monitoring //
const bootTimeStart = process.hrtime();

// Server Configuration //
const SERV_NAME = "TOTYL"
const SERV_VER = 0.01;
const SERV_PORT = 3000;

const PROD_VER = false;
const ENABLE_LOGGING = false;
const CREATE_DATABASE = false;

// Required Imports //
const express = require('express');
const cors = require('cors');
const fs = require('fs'); // File system R/W
const moment = require('moment-timezone'); // Timezone formatting
require('dotenv').config({ path: '.env.local' });

const Database = require('./services/database');
const { sendOTP, verifyOTP } = require('./services/otp');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: process.env.corsOrigin // * is a big security flaw - remove for prod
    }
});



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
                        case 3: // countryCode, areaCode, phoneNumber
                            sendOTP(args[0], args[1], args[2])
                                .then(sid => {
                                socket.emit('message-broadcast', { message: `A verification code has been sent to '${args[0]} (${args[1]}) ${args[2]}'.`, userName: 'System', timestamp: utcTimestamp });
                                socket.otpSid = sid;
                                socket.phNum = `${args[0]}${args[1]}${args[2]}`; // store the verification sid in the socket
                                })
                                .catch(error => {
                                console.error(error);
                                socket.emit('message-broadcast', { message: 'Failed to send OTP. Please try again later.', userName: 'System', timestamp: utcTimestamp });
                                });
                            break;
                        default:
                            socket.emit('message-broadcast', { message: 'Incorrect command usage. Usage: /otpSend countryCode areaCode phoneNumber', userName: 'System', timestamp: utcTimestamp });
                            break;
                    }
                    break;
                case 'otpVerify':
                    switch (args.length) {
                        case 1: // verification code
                            if (socket.otpSid && socket.phNum) {
                                verifyOTP(socket.phNum, args[0])
                                    .then(approved => {
                                        if (approved) {
                                            socket.emit('message-broadcast', { message: 'OTP verification succeeded.', userName: 'System', timestamp: utcTimestamp });
                                            socket.otpSid = null;
                                        } else {
                                            socket.emit('message-broadcast', { message: 'OTP verification failed. Please check your code and try again.', userName: 'System', timestamp: utcTimestamp });
                                        }
                                    })
                                    .catch(error => {
                                        console.error(error);
                                        socket.emit('message-broadcast', { message: 'Failed to verify OTP. Please try again later.', userName: 'System', timestamp: utcTimestamp });
                                    });
                            } else {
                                socket.emit('message-broadcast', { message: 'No OTP verification in progress.', userName: 'System', timestamp: utcTimestamp });
                            }
                            break;
                        default:
                            socket.emit('message-broadcast', { message: 'Incorrect command usage. Usage: /otpVerify code', userName: 'System', timestamp: utcTimestamp });
                            break;
                    }
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
        if(CREATE_DATABASE) {
            writeLog(`CREATE_DATABASE set to true - Initializing databases`);
            db.initDb();
        }
    });
}
startServer();