const fs = require('fs'); // File system R/W
const moment = require('moment-timezone'); // Timezone formatting
const config = JSON.parse(fs.readFileSync('config.json'));

const logsDir = './logs';
const fileName = `${logsDir}/totyl_${moment.utc().format('M-DD-YYYY_HH-mm-ss')}.log`;

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log file if logging is enabled
if(config.server.logging) {
    try {
        fs.closeSync(fs.openSync(fileName, 'w'));
        console.log(`Created log file: ${fileName}`);
    } catch (error) {
      console.error(`Failed to create log file: ${fileName}. Error: ${error}`);
    }
    const logStream = fs.createWriteStream(fileName, { flags: 'a' });
} else {
    console.log("Server Logging is disabled - files will not be saved.");
}

/**
 * Writes a message to the log file
 */
function writeLog(message) {
    console.log(message);
    if (config.server.logging) {
        logStream.write(`${message}\n`);
    }
}

module.exports = { writeLog };