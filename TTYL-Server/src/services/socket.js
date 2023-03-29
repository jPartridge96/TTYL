const { writeLog } = require('../utils/logger');
const { onMessageReceived } = require('../services/chat');

let userList = new Map();

/**
 * Setup socket.io
 * @param {*} io 
 */
function setupSocket(io) {
    io.on('connection', (socket) => {
        let userName = socket.handshake.query.userName;
        addUser(userName, socket.id);
        writeLog(`${userName} has connected. [${socket.id}]`);

        socket.broadcast.emit('user-list', [...userList.keys()]);
        socket.emit('user-list', [...userList.keys()]);

        socket.on('message', (msg) => onMessageReceived(socket, userName, msg));

        socket.on('disconnect', (reason) => {
            delUser(userName, socket.id);
            socket.broadcast.emit('user-list', [...userList.keys()]);
            socket.emit('user-list', [...userList.keys()]);
            writeLog(`${userName} has disconnected (${reason}). [${socket.id}]`);
        });
    });
}

/**
 * Add user to the user list
 * @param {*} userName 
 * @param {*} id 
 */
function addUser(userName, id) {
    if(!userList.has(userName)) {
        userList.set(userName, new Set(id))
    } else {
        userList.get(userName).add(id);
    }
}

/**
 * Delete user from the user list
 * @param {*} userName 
 * @param {*} id 
 */
function delUser(userName, id) {
    if(userList.has(userName)) {
        let userIds = userList.get(userName);
        if(userIds.size != 0) {
            userList.delete(userName);
        }
    }
}

module.exports = { userList, setupSocket };