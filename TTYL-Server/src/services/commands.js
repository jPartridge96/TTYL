const { sendOTP, verifyOTP } = require('../utils/otp');

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
        case 'otpSend':
            switch (args.length) {
                case 3: // countryCode, areaCode, phoneNumber
                    sendOTP(args[0], args[1], args[2])
                    .then(sid => {
                        socket.emit('message-broadcast', { message: `A verification code has been sent to '${args[0]} (${args[1]}) ${args[2]}'.`, userName: 'System', timestamp: utcTimestamp });
                        socket.otpSid = sid;
                        socket.phNum = `${args[0]}${args[1]}${args[2]}`; // store the verification sid in the socket
                    })
                    .catch(error => {
                        console.error(error);
                        socket.emit('message-broadcast', { message: 'Failed to send OTP. Please try again later.', userName: 'System', timestamp: utcTimestamp });
                    });
                    break;
                default:
                    socket.emit('message-broadcast', { message: 'Incorrect command usage. Usage: /otpSend countryCode areaCode phoneNumber', userName: 'System', timestamp: utcTimestamp });
                    break;
            }
            break;
        case 'otpVerify':
            switch (args.length) {
                case 1: // verification code
                    if (socket.otpSid && socket.phNum) {
                        verifyOTP(socket.phNum, args[0])
                        .then(approved => {
                            if (approved) {
                                socket.emit('message-broadcast', { message: 'OTP verification succeeded.', userName: 'System', timestamp: utcTimestamp });
                                socket.otpSid = null;
                            } else {
                                socket.emit('message-broadcast', { message: 'OTP verification failed. Please check your code and try again.', userName: 'System', timestamp: utcTimestamp });
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            socket.emit('message-broadcast', { message: 'Failed to verify OTP. Please try again later.', userName: 'System', timestamp: utcTimestamp });
                        });
                    } else {
                        socket.emit('message-broadcast', { message: 'No OTP verification in progress.', userName: 'System', timestamp: utcTimestamp });
                    }
                    break;
                default:
                    socket.emit('message-broadcast', { message: 'Incorrect command usage. Usage: /otpVerify code', userName: 'System', timestamp: utcTimestamp });
                    break;
                }
            break;
        default:
            socket.emit('message-broadcast', { message: `Unknown command: ${cmd}`, userName: 'System', timestamp: utcTimestamp });
            break;
    }
}

module.exports = { CommandHandler };