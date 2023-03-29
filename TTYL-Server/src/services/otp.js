const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.twilioAccSid, process.env.twilioAuth);
const serviceSid = process.env.twilioServSid;

async function sendOTP(countryCode, areaCode, phoneNumber) {
  const phNum = `${countryCode}${areaCode}${phoneNumber}`;

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

async function verifyOTP(phNum, code) {
  try {
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phNum, code });

    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error(error);
    throw new Error('Failed to verify OTP');
  }
}

module.exports = { sendOTP, verifyOTP };