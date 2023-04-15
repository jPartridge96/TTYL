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
        writeLog(`Incoming connection from ${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort} [${socket.id}]`);

        const nickname = socket.handshake.query.nickname;

        addUser(nickname, socket.id);
        socket.broadcast.emit('user-list', [...userList.keys()]);
        socket.emit('user-list', [...userList.keys()]);

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
                    if (account == null) {
                        socket.emit('restore-session', false);
                    } else {
                        readProfileData(account.p_id).then((profile) => {
                            socket.emit('restore-session', { account, profile });
    
                            addUser(profile.nickname, socket.id);
                            socket.broadcast.emit('user-list', [...userList.keys()]);
                            socket.emit('user-list', [...userList.keys()]);
                        });
                    }
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

                addUser(profile.nickname, socket.id);
                socket.broadcast.emit('user-list', [...userList.keys()]);
                socket.emit('user-list', [...userList.keys()]);
            });
        }));

        socket.on('message', (data) => onMessageReceived(socket, data.nick, data.msg));

        // Deprecated?
        socket.on('disconnect', (reason) => {
            delUser(nickname, socket.id);
            socket.broadcast.emit('user-list', [...userList.keys()]);
            socket.emit('user-list', [...userList.keys()]);
            writeLog(`${nickname} has disconnected (${reason}). [${socket.id}]`);
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
 * @param {*} nickname 
 * @param {*} id 
 */
function addUser(nickname, id) {
    if(!userList.has(nickname)) {
        userList.set(nickname, new Set(id))
    } else {
        userList.get(nickname).add(id);
    }
}

// Deprecated?
/**
 * Delete user from the user list
 * @param {*} nickname 
 * @param {*} id 
 */
function delUser(nickname, id) {
    if(userList.has(nickname)) {
        let userIds = userList.get(nickname);
        if(userIds.size != 0) {
            userList.delete(nickname);
        }
    }
}

module.exports = { userList, setupSocket };