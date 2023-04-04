const { writeLog } = require('../utils/logger');
const { CommandHandler } = require('../services/commands');

/**
 * Handle message received
 * @param {*} socket 
 * @param {*} userName 
 * @param {*} msg 
 */
function onMessageReceived(socket, userName, msg) {
    const utcTimestamp = new Date().toUTCString();
    const timestamp = new Date(utcTimestamp).toLocaleString('en-US', {hour12: false});
    const formattedTimestamp = timestamp.replace(',', '');

    if (msg.startsWith('/')) // Pass to commands.js if message starts with '/'
        CommandHandler(socket, msg, utcTimestamp);
    else {
        socket.broadcast.emit('message-broadcast', { message: msg, userName: userName, timestamp: formattedTimestamp });
        // socket.emit('message-broadcast', { message: msg, userName: userName, timestamp: formattedTimestamp });
        writeLog(`[${formattedTimestamp}] ${userName}: ${msg}`);
    }
}

/**
 * Handle message edited
 */
function onMessageEdit() {
    // When the user edits a message, the message is deleted and a new message is sent
}
/**
 * Handle message reply
 */
function onMessageReply() {

}

module.exports = { onMessageReceived };