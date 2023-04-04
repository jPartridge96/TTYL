const twilio = require('twilio');
const { writeLog } = require('./logger');
require('dotenv').config();

const client = twilio(process.env.twilioAccSid, process.env.twilioAuth);
const serviceSid = process.env.twilioServSid;

/**
 * Sends an OTP to the given phone number
 * @param {*} phNum 
 * @returns {string} verification sid
 */
async function sendOtp(phNum) {
  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phNum, channel: 'sms' });

    return verification.sid;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to send OTP');
  }
}

/**
 * Verifies the OTP code for the given phone number
 * @param {*} phNum 
 * @param {*} code
 * @returns {boolean} true if OTP is verified, false otherwise
 */
async function verifyOtp(phNum, code) {
  if(!phNum || !code){
    return false;
  }

  console.log(`Verifying OTP for ${phNum} with code ${code}`);

  try {
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phNum, code });

    return verificationCheck.status === 'approved';
  } catch (error) {
    writeLog(error);
    throw new Error('Failed to verify OTP');
  }
}

module.exports = { sendOtp, verifyOtp };