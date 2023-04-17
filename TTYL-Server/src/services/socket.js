const { writeLog } = require('../utils/logger');
const { onMessageReceived } = require('../services/chat');
const { verifyOtp, sendOtp } = require('../utils/otp');
const { createAccountData, readAccountData, updateAccountData, deleteAccountData } = require('../services/account');
const { createProfileData, readProfileData, updateProfilePhoto, updateProfileData, deleteProfileData } = require('../services/profile');
const db = require('../utils/database');

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

        socket.on('upload-avatar', ([phNum, blob]) => {
            readAccountData(phNum)
            .then((account) => {
                updateProfilePhoto(blob, account.p_id);
            });
        });
        
        socket.on('retrieve-avatar', (phNum) => {
            readAccountData(phNum)
            .then(async (acc) => {
                try {
                    const query = `SELECT avatar FROM profiles WHERE id = ${acc.p_id}`;
                    const results = await db.connection.query(query);
                    
                    if(results){
                        const avatarBuffer = results[0][0].avatar;
                        const avatarBase64 = avatarBuffer.toString('base64');
                        const avatarDataUri = `data:image/png;base64,${avatarBase64}`;
                        
                        socket.emit('send-avatar', avatarDataUri);
                    } else {
                        return false;
                    }
                } catch (error) {
                    socket.emit('send-avatar', false)
                    writeLog(error);
                }
            });
        });

        socket.on('update-account', ([phNum, account, profile]) => {
            readAccountData(phNum)
            .then((acc) => {
                updateAccountData(acc.id, account);
                updateProfileData(acc.p_id, profile);
            })
        });

        socket.on('delete-account', (phNum) => {
            readAccountData(phNum)
            .then((acc) => {
                deleteAccountData(acc.id);
                deleteProfileData(acc.p_id);
            });
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