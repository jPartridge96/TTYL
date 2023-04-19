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

async function getProfilePhoto(p_id) {
    return db.query('SELECT avatar FROM profiles WHERE id = ?', [p_id])
    .then((results) => {
        const avatarBuffer = results[0][0].avatar;
        const avatarBase64 = avatarBuffer.toString('base64');
        return `data:image/png;base64,${avatarBase64}`;
    })
}

async function updateProfilePhoto(blob, p_id) {
    if(!p_id) {
        return false;
    }
    
    try {
      await db.query(`UPDATE profiles SET avatar = ? WHERE id = ?`, [blob, p_id])
      .then(writeLog(`The avatar for profile with ID '${p_id}' has been updated`));
      
    } catch (err) {
      console.error('Error updating profile photo:', err);
    }
}

module.exports = { createProfileData, readProfileData, updateProfileData, deleteProfileData, getProfilePhoto, updateProfilePhoto };