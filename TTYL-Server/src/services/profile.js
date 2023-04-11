const { writeLog } = require('../utils/logger');
const db = require('../utils/database');

function readProfileData(p_id) {
    if(!p_id) {
        return false;
    }
    
    return db.query(`SELECT * FROM profiles WHERE id='${p_id}'`)
    .then((rows) => {
        if (rows.length > 0) {
            const accData = rows[0][0];
            return accData;
        } else {
            return false;
        }
    })
    .catch((error) => {
        writeLog('Error reading profile data:', error);
        return false;
    });
}

module.exports = { readProfileData };