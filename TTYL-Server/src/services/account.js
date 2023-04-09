const { writeLog } = require('../utils/logger');
const db = require('../utils/database');

function createAccountData(accData, profData) {
    return db.query(`INSERT INTO profiles (nickname, avatar)
                    VALUES ('${profData.nickname}', NULL)`)
    .then((result) => {
        const p_id = result.insertId;
        return db.query(`INSERT INTO accounts (phone, first_name, last_name, dob, p_id)
                        VALUES ('${accData.phone}', '${accData.firstName}', '${accData.lastName}', '${accData.dob}', '${p_id}')`);
    })
    .then((result) => {
        console.log(`Account created for '${accData.phNum}' with ID ${result.insertId}`);
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

module.exports = { readAccountData };