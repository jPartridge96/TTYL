const { writeLog } = require('../utils/logger');
const db = require('../utils/database');
const { createProfileData } = require('./profile');

function createAccountData(data) {
    createProfileData(data.profData)
    .then((result) => {
        const p_id = result[0].insertId;
        return db.query(`INSERT INTO accounts (phone, first_name, last_name, dob, p_id)
                        VALUES ('${data.accData.phone}', '${data.accData.firstName}', '${data.accData.lastName}', '${data.accData.dob}', '${p_id}')`);
    })
    .then((result) => {
        writeLog(`Account created for '${data.accData.phone}' with ID ${result[0].insertId}`);
        return true;
    })
    .catch((error) => {
        writeLog('Error creating account data', error);
        return false;
    });
}

function readAccountData(phNum) {
    if(!phNum) {
        return false;
    }

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

function updateAccountData(id, account) {
    if(!id) {
        return false;
    }

    return db.query(`UPDATE accounts SET first_name = '${account.firstName}', first_name = '${account.lastName}' WHERE id = ${id}`)
    .then(writeLog(`An account with ID '${id}' has been updated`));
    
}

function deleteAccountData(id) {
    if(!id) {
        return false;
    }

    return db.query(`DELETE FROM accounts WHERE id = ${id};`)
    .then(writeLog(`An account with ID '${id}' has been deleted`));
}

module.exports = { createAccountData, readAccountData, updateAccountData, deleteAccountData };