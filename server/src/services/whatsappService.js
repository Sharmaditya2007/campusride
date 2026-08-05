/**
 * Official Meta WhatsApp Cloud API Service & Direct Dispatch
 * Environment variables consumed:
 * - WHATSAPP_ACCESS_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 * - WHATSAPP_VERIFY_TOKEN
 */
const sendWhatsAppOtp = async ({ toPhone, phoneOtp }) => {
  try {
    // Sanitize and format phone number for WhatsApp international standard (e.g. 919876543210)
    let cleanPhone = (toPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const messageText = `🔑 *CollegeRide Security OTP*: Your 6-digit verification code is *${phoneOtp}*. Valid for 5 minutes. Do not share with anyone.`;
    const whatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // 1. Official Meta WhatsApp Cloud API Endpoint Call
    if (accessToken && phoneNumberId) {
      try {
        const metaApiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        const response = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: {
              preview_url: false,
              body: messageText,
            },
          }),
        });

        const metaData = await response.json();
        if (response.ok) {
          console.log('[Meta WhatsApp Cloud API Success] Sent message ID:', metaData.messages?.[0]?.id);
          return {
            success: true,
            provider: 'meta_whatsapp_cloud_api',
            whatsAppUrl,
          };
        }
        console.error('[Meta WhatsApp Cloud API Response Error]:', metaData);
      } catch (metaErr) {
        console.error('[Meta WhatsApp Cloud API Exception]:', metaErr.message);
      }
    } else {
      console.log('[WhatsApp Service Note] WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing in .env. System ready for Meta Cloud API credentials.');
    }

    return {
      success: true,
      provider: 'whatsapp_intent_fallback',
      whatsAppUrl,
    };
  } catch (error) {
    console.error('[WhatsApp Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppOtp,
};
