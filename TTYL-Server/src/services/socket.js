const { writeLog } = require('../utils/logger');
const { onMessageReceived } = require('../services/chat');
const { verifyOtp, sendOtp } = require('../utils/otp');
const { createAccountData, readAccountData, updateAccountData, deleteAccountData } = require('../services/account');
const { createProfileData, readProfileData, updateProfileData, deleteProfileData, getProfilePhoto, updateProfilePhoto } = require('../services/profile');
const db = require('../utils/database');

let userList = [];
/**
 * Setup socket.io
 * @param {*} io 
 */
function setupSocket(io) {
    io.on('connection', (socket) => {
        const ipAddress = socket.request.connection.remoteAddress.replace(/^::ffff:/, '');
        let nickname = socket.handshake.query.nickname;
        
        writeLog(`Connection received from ${ipAddress}:${socket.request.connection.remotePort} [${nickname} / ${socket.id}]`);
        
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
    
                            getProfilePhoto(profile.id).then((avatar) => {
                                addUser(socket, profile.nickname, avatar);
                            });

                            writeLog(`${nickname} has connected. [${socket.id}]`);
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

                getProfilePhoto(profile.id).then((avatar) => {
                    addUser(socket, profile.nickname, avatar);
                });
            });
        }));

        socket.on('message', (data) => onMessageReceived(socket, data.nick, data.msg));

        socket.on('disconnect', (reason) => {
            delUser(socket); 
            writeLog(`${nickname} has disconnected (${reason}). [${socket.id}]`);
        });

        socket.on('upload-profile-photo', ([phNum, blob]) => {
            readAccountData(phNum)
            .then((account) => {
                updateProfilePhoto(blob, account.p_id);
            });
        });
        
        socket.on('retrieve-avatar', (phNum) => {
            readAccountData(phNum)
            .then((acc) => {
                try {
                    getProfilePhoto(acc.p_id).then((avatarUri) => {
                        if(avatarUri) {
                            socket.emit('send-avatar', avatarUri);
                        } else {
                            return false;
                        }
                    });
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

                nickname = profile.nickname;
                getProfilePhoto(acc.p_id).then((avatar) => {
                    updUser(socket, nickname, avatar);
                });
                
            });
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


/**
 * Add user to the user list
 * @param {*} socket 
 * @param {*} nickname 
 * @param {*} avatar 
 */
function addUser(socket, nickname, avatar) {
    let id = socket.id;
    userList.push({id, nickname, avatar});

    socket.broadcast.emit('user-list', userList);
    socket.emit('user-list', userList);
}

/**
 * Delete user from the user list
 * @param {*} socket 
 */
function delUser(socket) {
    const index = userList.findIndex(user => user.id === socket.id);
    if (index !== -1) {
        userList.splice(index, 1);
    }

    socket.broadcast.emit('user-list', userList);
    socket.emit('user-list', userList);
}

/**
 * Update the user's nickname in the user list
 * @param {*} socket  
 * @param {*} nickname
 * @param {*} avatar 
 */
function updUser(socket, nickname, avatar) {
    delUser(socket);
    addUser(socket, nickname, avatar);

    socket.broadcast.emit('user-list', userList);
    socket.emit('user-list', userList);
}

module.exports = { userList, setupSocket };