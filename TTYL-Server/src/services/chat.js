const { writeLog } = require('../utils/logger');
const { CommandHandler } = require('../services/commands');

/**
 * Handle message received
 * @param {*} socket 
 * @param {*} userName 
 * @param {*} msg 
 */
function onMessageReceived(socket, nickname, msg) {
    const utcTimestamp = new Date().toUTCString();
    const timestamp = new Date(utcTimestamp).toLocaleString('en-US', {hour12: false});
    const formattedTimestamp = timestamp.replace(',', '');

    if (msg.startsWith('/')) // Pass to commands.js if message starts with '/'
        CommandHandler(socket, msg);
    else {
        socket.broadcast.emit('message-broadcast', { message: msg, nickname: nickname});
        writeLog(`[${formattedTimestamp}] ${nickname}: ${msg}`);
    }
}

/**
 * Handle message edited
 */
function onMessageEdit() {

}

/**
 * Handle message reply
 */
function onMessageReply() {

}

module.exports = { onMessageReceived };