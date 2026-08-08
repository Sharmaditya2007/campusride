/**
 * Real-time SMS Gateway Service (Twilio / Fast2SMS / 2Factor integration for Indian Mobile Numbers)
 */
const sendOtpSms = async ({ toPhone, phoneOtp }) => {
  try {
    const clean10Digits = (toPhone || '').replace(/[^0-9]/g, '').slice(-10);

    // 1. Fast2SMS integration (Sends instant SMS OTP to ANY 10-digit Indian mobile number)
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
          numbers: clean10Digits,
        }),
      });
      const data = await response.json();
      console.log('[SMS OTP Sent via Fast2SMS to ' + clean10Digits + ']:', data);
      return { success: true, provider: 'fast2sms', data };
    }

    // 2. 2Factor.in Indian SMS Gateway integration
    const twoFactorKey = process.env.TWOFACTOR_API_KEY;
    if (twoFactorKey) {
      const url = `https://2factor.in/API/V1/${twoFactorKey}/SMS/${clean10Digits}/${phoneOtp}/CampusRide+OTP`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('[SMS OTP Sent via 2Factor to ' + clean10Digits + ']:', data);
      return { success: true, provider: '2factor', data };
    }

    // 3. Twilio International SMS integration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromPhone) {
      const twilio = require('twilio')(accountSid, authToken);
      const formattedToPhone = toPhone.startsWith('+') ? toPhone : `+91${clean10Digits}`;
      const message = await twilio.messages.create({
        body: `🔑 CampusRide Verification OTP: ${phoneOtp}. Valid for 5 minutes. Do not share.`,
        from: fromPhone,
        to: formattedToPhone,
      });
      console.log('[SMS OTP Sent via Twilio] Message SID:', message.sid);
      return { success: true, provider: 'twilio', sid: message.sid };
    }

    console.log(`[SMS Gateway Note] Sent OTP ${phoneOtp} to mobile number ${toPhone}`);
    return { success: true, simulated: true };
  } catch (error) {
    console.error('[SMS Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpSms,
};
