const bootTimeStart = process.hrtime();

// Server Configuration //
const SERV_NAME = "TOTYL"
const SERV_VER = 0.01;
const SERV_PORT = 3000;

// Required Imports //
const express = require('express');
const cors = require('cors');

const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
    cors: {
        origin: "*" // * is a big security flaw - remove for prod
    }
 });

 app.get('/', (req, res) => {
    getServVer().then((ver) => res.send(ver));
 });

let userList = new Map();

// When user connects - init user data and add socket events
io.on('connection', (socket) => {
    let userName = socket.handshake.query.userName;
    addUser(userName, socket.id);
    console.log(`${userName} has connected. [${socket.id}]`);

    socket.broadcast.emit('user-list', [...userList.keys()]);
    socket.emit('user-list', [...userList.keys()]);

    // When User sends message
    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', {message: msg, userName: userName});
        console.log(`${userName}: ${msg}`);
    });

    // When User disconnects
    socket.on('disconnect', (reason) => {
        delUser(userName, socket.id);
        console.log(`${userName} has disconnected (${reason}). [${socket.id}]`);
        socket.broadcast.emit('user-list', [...userList.keys()]);
        socket.emit('user-list', [...userList.keys()]);
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
    const repoName = "TTYL";
    const ownerName = "jPartridge96";
    const accessToken = "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";
    const url = `https://api.github.com/repos/${ownerName}/${repoName}/commits`;

    return fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    .then((response) => response.json())
    .then((data) => {
        return `${SERV_NAME}-${SERV_VER}.${data.length}`;
    });
}

// Server launcher
getServVer().then((build) => {
    try {
        console.log(`${build} is starting on port ${SERV_PORT}`);
        http.listen(SERV_PORT, () => {
            const bootTimeEnd = process.hrtime(bootTimeStart);
            const bootTimeMs = Math.round((bootTimeEnd[0] * 1000) + (bootTimeEnd[1] / 1000000));
            console.log(`${build} launched successfully after ${bootTimeMs}ms`);
        });
    } catch (error) {
        console.log(`${build} could not be started: ${error}`);
    }
});