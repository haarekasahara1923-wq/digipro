import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPurchaseEmail({
  buyerEmail,
  buyerName,
  productName,
  driveLink,
}: {
  buyerEmail: string;
  buyerName: string;
  productName: string;
  driveLink: string;
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #FFD700, #B8960C); padding: 40px; text-align: center; }
    .header h1 { color: #000; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; }
    .body { padding: 40px; color: #fff; }
    .body h2 { color: #FFD700; font-size: 22px; }
    .download-btn { display: inline-block; background: linear-gradient(135deg, #FFD700, #B8960C); color: #000; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 16px; margin: 20px 0; letter-spacing: 1px; }
    .footer { padding: 20px 40px; text-align: center; color: #555; font-size: 12px; border-top: 1px solid #222; }
    .warning { background: #1a1a1a; border-left: 3px solid #FFD700; padding: 12px 16px; border-radius: 4px; margin: 20px 0; color: #aaa; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 PURCHASE CONFIRMED!</h1>
    </div>
    <div class="body">
      <h2>Hello ${buyerName}!</h2>
      <p style="color:#ccc; line-height:1.7;">Thank you for purchasing <strong style="color:#FFD700;">${productName}</strong>. Your payment has been successfully verified.</p>
      <p style="color:#ccc;">Click the button below to access your product:</p>
      <div style="text-align:center;">
        <a href="${driveLink}" class="download-btn">📥 DOWNLOAD YOUR PRODUCT</a>
      </div>
      <div class="warning">
        ⚠️ This link is exclusively for you. Please do not share it with others.
      </div>
      <p style="color:#555; font-size:13px;">If the button doesn't work, copy this link:<br>
        <a href="${driveLink}" style="color:#FFD700; word-break:break-all;">${driveLink}</a>
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
      <p>For support, reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"${storeName}" <${process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `🎉 Your Purchase is Confirmed! - ${productName}`,
    html,
  });
}

export async function sendWhatsAppMessage({
  phoneNumber,
  buyerName,
  productName,
  driveLink,
}: {
  phoneNumber: string;
  buyerName: string;
  productName: string;
  driveLink: string;
}) {
  // Using CallMeBot (free WhatsApp API)
  // Register at: https://www.callmebot.com/blog/free-api-whatsapp-messages/
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!apiKey) {
    console.log('WhatsApp API key not set, skipping WhatsApp notification');
    return;
  }

  // Clean phone number (remove +, spaces, dashes)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  const message = `🎉 *Payment Confirmed!*\n\nHello *${buyerName}*!\n\nThank you for purchasing *${productName}* from *${storeName}*.\n\n📥 *Download your product here:*\n${driveLink}\n\n⚠️ This link is exclusively for you. Do not share it.\n\nThank you! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMessage}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('WhatsApp send failed:', await response.text());
    }
  } catch (error) {
    console.error('WhatsApp error:', error);
  }
}
