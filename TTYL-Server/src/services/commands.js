/**
 * Handles commands
 * @param {*} socket 
 * @param {*} msg 
 * @param {*} utcTimestamp 
 */
function CommandHandler(socket, msg, utcTimestamp) {
    const cmd = msg.split(' ')[0].substring(1);
    const args = msg.split(' ').slice(1);
    
    switch (cmd) {
        case 'cmd':
            socket.emit('message-broadcast', { message: `Executed test CMD: ${cmd}`, userName: 'System', timestamp: utcTimestamp });
            break;
        default:
            socket.emit('message-broadcast', { message: `Unknown command: ${cmd}`, userName: 'System', timestamp: utcTimestamp });
            break;
    }
}

module.exports = { CommandHandler };