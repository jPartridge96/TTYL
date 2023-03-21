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
    res.send(`${SERV_NAME}`);
 });

let userList = new Map();

// When user connects
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

try {
    let bootTime = 10;
    console.log(`${SERV_NAME}-${SERV_VER} is starting on port ${SERV_PORT}`);
    http.listen(SERV_PORT, () => {
        console.log(`${SERV_NAME}-${SERV_VER} launched successfully after ${bootTime}ms`);
    });
} catch (error) {
    console.log(`${SERV_NAME}-${SERV_VER} could not be started: ${error}`);
}
