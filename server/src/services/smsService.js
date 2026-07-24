/**
 * Real-time SMS Gateway Service (Twilio / Fast2SMS / 2Factor integration)
 */
const sendOtpSms = async ({ toPhone, phoneOtp }) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromPhone) {
      const twilio = require('twilio')(accountSid, authToken);
      const message = await twilio.messages.create({
        body: `🔑 CampusRide Verification OTP: ${phoneOtp}. Valid for 10 minutes. Do not share.`,
        from: fromPhone,
        to: toPhone,
      });
      console.log('[SMS OTP Sent via Twilio] Message SID:', message.sid);
      return { success: true, sid: message.sid };
    }

    // Fast2SMS integration check
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey) {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: phoneOtp,
          numbers: toPhone.replace(/[^0-9]/g, '').slice(-10),
        }),
      });
      const data = await response.json();
      console.log('[SMS OTP Sent via Fast2SMS]:', data);
      return { success: true, data };
    }

    console.log(`[SMS Gateway Simulated] Sent OTP ${phoneOtp} to mobile number ${toPhone}`);
    return { success: true, simulated: true };
  } catch (error) {
    console.error('[SMS Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpSms,
};
