const { writeLog } = require('../utils/logger');
const db = require('../utils/database');

function createAccountData(data) {
    return db.query(`INSERT INTO profiles (nickname, avatar)
                    VALUES ('${data.profData.nickname}', NULL)`)
    .then((result) => {
        const p_id = result[0].insertId;
        return db.query(`INSERT INTO accounts (phone, first_name, last_name, dob, p_id)
                        VALUES ('${data.accData.phone}', '${data.accData.firstName}', '${data.accData.lastName}', '${data.accData.dob}', '${p_id}')`);
    })
    .then((result) => {
        console.log(`Account created for '${data.accData.phone}' with ID ${result[0].insertId}`);
        return true;
    })
    .catch((error) => {
        writeLog('Error creating account data', error);
        return false;
    });
}

function readAccountData(phNum) {
    return db.query(`SELECT * FROM accounts WHERE phone='${phNum}'`)
    .then((rows) => {
        if (rows.length > 0) {
            const accData = rows[0][0];
            return accData;
        } else {
            return false;
        }
    })
    .catch((error) => {
        writeLog('Error reading account data:', error);
        return false;
    });
}

function updateAccountData() {

}

function deleteAccountData() {
    
}

module.exports = { readAccountData, createAccountData };