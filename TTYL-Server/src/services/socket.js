const { writeLog } = require('../utils/logger');
const { onMessageReceived } = require('../services/chat');
const { verifyOtp, sendOtp } = require('../utils/otp');
const { createAccountData, readAccountData } = require('../services/account');
const { readProfileData } = require('../services/profile');

let userList = new Map();

/**
 * Setup socket.io
 * @param {*} io 
 */
function setupSocket(io) {
    io.on('connection', (socket) => {
        // Deprecated?
        let userName = socket.handshake.query.userName;
        addUser(userName, socket.id);
        socket.broadcast.emit('user-list', [...userList.keys()]);
        socket.emit('user-list', [...userList.keys()]);

        writeLog(`Incoming connection from ${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort} [${socket.id}]`);

        socket.on('send-otp', (phNum) => sendOtp(phNum)
        .then(sid => {
            socket.otpSid = sid; // store the verification sid in the socket
            socket.phNum = phNum;
        })
        .catch(error => {
            console.error(error);
        }));

        socket.on('verify-otp', (code) => verifyOtp(socket.phNum, code)
        .then(isVerified => {
            if (isVerified) {
                readAccountData(socket.phNum).then((account) => {
                    readProfileData(account.p_id).then((profile) => {
                        socket.emit('restore-session', { account, profile });
                    });
                });
                writeLog(`OTP verified for ${socket.phNum}`);

                socket.otpSid = null;
                socket.phNum = null;
            } else {
                socket.emit('otp-verification-failed');
                writeLog(`OTP verification failed for ${socket.phNum}`);
            }
        })
        .catch(error => {
            console.error(error);
        }));

        socket.on('create-account', (data) => createAccountData(data));

        socket.on('reload-session', (phNum) => readAccountData(phNum)
        .then((account) => {
            readProfileData(account.p_id).then((profile) => {
                socket.emit('restore-session', { account, profile });
            });
        }));

        socket.on('message', (msg) => onMessageReceived(socket, userName, msg));

        // Deprecated?
        socket.on('disconnect', (reason) => {
            delUser(userName, socket.id);
            socket.broadcast.emit('user-list', [...userList.keys()]);
            socket.emit('user-list', [...userList.keys()]);
            // writeLog(`${userName} has disconnected (${reason}). [${socket.id}]`);
        });

        socket.on('get-date', () => {
            const utcTimestamp = new Date().toUTCString();
            const timestamp = new Date(utcTimestamp).toLocaleString('en-US', {hour12: false});
            const formattedTimestamp = timestamp.replace(',', '');
            socket.emit('date', formattedTimestamp);
        });
    });
}

// Deprecated?
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

// Deprecated?
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