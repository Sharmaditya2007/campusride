const nodemailer = require('nodemailer');

/**
 * Send real-time OTP verification email to registered student
 */
const sendOtpEmail = async ({ toEmail, recipientName, emailOtp, phoneOtp }) => {
  try {
    let transporter;

    // Check if SMTP environment variables exist
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Use Ethereal test SMTP service for instant real email delivery testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: '"CampusRide Safety Team" <no-reply@campusride.edu>',
      to: toEmail,
      subject: `🔑 Your CampusRide Verification OTP Code: ${emailOtp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #090d16; color: #f8fafc; padding: 30px; border-radius: 16px; border: 1px solid #1e293b;">
          <h2 style="color: #10b981; margin-top: 0;">CampusRide Verification</h2>
          <p>Hello <strong>${recipientName || 'Student'}</strong>,</p>
          <p>Thank you for registering on <strong>CampusRide</strong>. To verify your student identity and mobile phone number, use the real-time OTP codes below:</p>
          
          <div style="background: #0f172a; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #334155;">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">University Email OTP</div>
            <div style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 6px; margin: 8px 0;">${emailOtp}</div>
            
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;" />
            
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Mobile SMS OTP</div>
            <div style="font-size: 32px; font-weight: bold; color: #06b6d4; letter-spacing: 6px; margin: 8px 0;">${phoneOtp}</div>
          </div>

          <p style="font-size: 12px; color: #94a3b8;">This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">CampusRide Student Safety Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[Email OTP Sent] Ethereal Live Email Link:', previewUrl);
    }
    return { success: true, previewUrl };
  } catch (error) {
    console.error('[Email OTP Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
};
