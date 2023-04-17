const { writeLog } = require('../utils/logger');
const db = require('../utils/database');

function createProfileData(profData) {
    return db.query(`INSERT INTO profiles (nickname, avatar)
    VALUES ('${profData.nickname}', '${profData.avatar}')`)
}

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

async function updateProfilePhoto(blob, p_id) {
    if(!p_id) {
        return false;
    }

    console.log(blob);
    
    try {
      await db.query(`UPDATE profiles SET avatar = '${blob}' WHERE id = ${p_id}`)
      .then(writeLog(`The avatar for profile with ID '${p_id}' has been updated`));
      
    } catch (err) {
      console.error('Error updating profile photo:', err);
    }
}


function updateProfileData(id, profile) {
    if(!id) {
        return false;
    }

    return db.query(`UPDATE profiles SET nickname = '${profile.nickname}' WHERE id = ${id}`)   
    .then(writeLog(`A profile with ID '${id}' has been updated`));
}
  
function deleteProfileData(id) {
    if(!id) {
        return false;
    }

    return db.query(`DELETE FROM profiles WHERE id = ${id};`)
    .then(writeLog(`A profile with ID '${id}' has been deleted`));
}

module.exports = { createProfileData, readProfileData, updateProfileData, updateProfilePhoto, deleteProfileData };