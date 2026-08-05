/**
 * Real-time WhatsApp OTP Service (WhatsApp Deep-Link Intent & Twilio WhatsApp API)
 */
const sendWhatsAppOtp = async ({ toPhone, phoneOtp }) => {
  try {
    // Sanitize and format phone number for WhatsApp international standard (+91 for India)
    let cleanPhone = (toPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const messageText = `🔑 *CampusRide Security OTP*: Your 6-digit verification code is *${phoneOtp}*. Valid for 10 minutes. Do not share.`;
    const whatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

    // Optional Twilio WhatsApp API integration check
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (accountSid && authToken) {
      try {
        const twilio = require('twilio')(accountSid, authToken);
        await twilio.messages.create({
          body: messageText,
          from: fromWhatsApp,
          to: `whatsapp:+${cleanPhone}`,
        });
        console.log('[WhatsApp API Sent via Twilio] To:', cleanPhone);
      } catch (twErr) {
        console.warn('[Twilio WhatsApp Warning]:', twErr.message);
      }
    }

    return {
      success: true,
      whatsAppUrl,
      phoneOtp,
    };
  } catch (error) {
    console.error('[WhatsApp Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppOtp,
};
