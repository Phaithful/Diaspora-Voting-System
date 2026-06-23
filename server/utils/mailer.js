const nodemailer = require('nodemailer');

const isDev = () => process.env.NODE_ENV !== 'production';

const createTransport = () => {
  // Always use configured SMTP credentials when available
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    // No credentials — return null (dev-only console mode)
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const sendOTPEmail = async (to, fullName, otp) => {
  // ALWAYS log OTP to console in dev so it's never lost
  if (isDev()) {
    console.log('\n╔══════════════════════════════════════╗');
    console.log(`║  OTP for ${to}`);
    console.log(`║  Code: ${otp}`);
    console.log('╚══════════════════════════════════════╝\n');
  }

  const transporter = createTransport();

  // If no transporter configured, skip sending (OTP already logged above)
  if (!transporter) {
    if (!isDev()) throw new Error('SMTP not configured');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Vote.ng — INEC Diaspora Portal" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your Vote.ng Login Verification Code',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
          <div style="background:#008751;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Vote.ng</h1>
            <p style="color:#A7F3D0;margin:4px 0 0;font-size:13px;">INEC Diaspora Voting Portal</p>
          </div>
          <div style="padding:32px 24px;">
            <p style="color:#1A1A1A;font-size:15px;margin:0 0 16px;">Dear <strong>${fullName}</strong>,</p>
            <p style="color:#374151;font-size:14px;margin:0 0 24px;">Use the verification code below to complete your login. This code expires in <strong>10 minutes</strong>.</p>
            <div style="background:#F0FBF4;border:2px dashed #008751;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
              <span style="font-size:36px;font-weight:700;color:#008751;letter-spacing:8px;">${otp}</span>
            </div>
            <p style="color:#6B7280;font-size:12px;margin:0;">If you did not request this code, please ignore this email. Do not share this code with anyone.</p>
          </div>
          <div style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="color:#9CA3AF;font-size:11px;margin:0;">© 2027 INEC Vote.ng — All rights reserved</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    // Email send failed — OTP was already logged to console above in dev
    if (isDev()) {
      console.error('[Mail] Send failed (OTP shown in console above):', err.message);
    } else {
      throw err;
    }
  }
};

module.exports = { sendOTPEmail };
