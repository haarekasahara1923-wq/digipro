import nodemailer from 'nodemailer';

// ─── Gmail SMTP Transporter ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📧  BUYER PURCHASE EMAIL  (sent to buyer after payment)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendPurchaseEmail({
  buyerEmail,
  buyerName,
  productName,
  driveLink,
  amount,
}: {
  buyerEmail: string;
  buyerName: string;
  productName: string;
  driveLink: string;
  amount?: string | number;
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const storeUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://digipro-five.vercel.app';
  const year = new Date().getFullYear();
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Purchase Confirmed — ${storeName}</title>
</head>
<body style="margin:0;padding:0;background:#090909;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090909;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#111111;border-radius:20px;overflow:hidden;border:1px solid #1f1f1f;">

          <!-- ── TOP GOLD BANNER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#FFD700 0%,#F5A623 50%,#B8960C 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:32px;">🎉</p>
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#000;letter-spacing:2px;text-transform:uppercase;">
                Payment Confirmed!
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:#2a1a00;font-weight:600;">
                Your digital product is ready to download
              </p>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="padding:40px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 8px;font-size:20px;color:#FFD700;font-weight:700;">
                Hello, ${buyerName}! 👋
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#aaaaaa;line-height:1.7;">
                Thank you for your purchase! Your payment has been
                <strong style="color:#4ade80;">successfully verified</strong>
                and your product is ready for you.
              </p>

              <!-- Product Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#1a1a1a;border-radius:14px;border:1px solid #2a2a2a;margin-bottom:28px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">
                      Product Purchased
                    </p>
                    <p style="margin:0 0 12px;font-size:18px;color:#ffffff;font-weight:700;">
                      ${productName}
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:#555555;">Order Date</td>
                        <td align="right" style="font-size:12px;color:#888888;">${date}</td>
                      </tr>
                      ${amount ? `
                      <tr>
                        <td style="font-size:12px;color:#555555;padding-top:6px;">Amount Paid</td>
                        <td align="right" style="font-size:12px;color:#FFD700;font-weight:700;padding-top:6px;">₹${Number(amount).toLocaleString('en-IN')}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="font-size:12px;color:#555555;padding-top:6px;">Status</td>
                        <td align="right" style="padding-top:6px;">
                          <span style="font-size:11px;background:#052e16;color:#4ade80;border-radius:20px;padding:3px 10px;font-weight:700;">
                            ✓ PAID
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Download CTA -->
              <p style="margin:0 0 16px;font-size:15px;color:#cccccc;text-align:center;">
                Click the button below to access your product:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:4px 0 28px;">
                    <a href="${driveLink}"
                      style="display:inline-block;background:linear-gradient(135deg,#FFD700,#B8960C);color:#000000;text-decoration:none;font-size:16px;font-weight:900;letter-spacing:1px;padding:18px 48px;border-radius:12px;text-transform:uppercase;">
                      📥 Download Your Product
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#1a1000;border-radius:10px;border-left:4px solid #FFD700;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#ccaa00;line-height:1.6;">
                      ⚠️ <strong>Important:</strong> This download link is exclusively for you.
                      Please do not share it with others.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:12px;color:#555555;">
                If the button doesn't work, copy and open this link in your browser:
              </p>
              <p style="margin:0;font-size:12px;word-break:break-all;">
                <a href="${driveLink}" style="color:#FFD700;text-decoration:none;">${driveLink}</a>
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />

              <!-- What's next -->
              <p style="margin:0 0 12px;font-size:13px;color:#888888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                What happens next?
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
      ['📧', 'This email is your purchase receipt — save it.'],
      ['📥', 'Click the download button above to access your product.'],
      ['💬', 'Need help? Reply to this email and we\'ll assist you.'],
    ].map(([icon, text]) => `
                <tr>
                  <td style="padding:5px 0;vertical-align:top;width:28px;">
                    <span style="font-size:15px;">${icon}</span>
                  </td>
                  <td style="padding:5px 0;font-size:13px;color:#888888;line-height:1.5;">
                    ${text}
                  </td>
                </tr>`).join('')}
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#0d0d0d;border-top:1px solid #1a1a1a;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#FFD700;font-weight:700;">${storeName}</p>
              <p style="margin:0 0 8px;font-size:12px;color:#555555;">Premium Digital Products</p>
              <a href="${storeUrl}" style="font-size:11px;color:#444444;text-decoration:none;">${storeUrl}</a>
              <p style="margin:12px 0 0;font-size:11px;color:#333333;">
                © ${year} ${storeName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;

  await transporter.sendMail({
    from: `"${storeName} 🛍️" <${process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `🎉 Your Purchase is Confirmed — ${productName} | ${storeName}`,
    html,
  });
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱  WHATSAPP NOTIFICATIONS
//
// HOW IT WORKS:
//   1. Buyer's WhatsApp  → via CallMeBot (buyer must have messaged the bot once)
//   2. Admin's WhatsApp  → via CallMeBot to ADMIN_WHATSAPP number (sale alert)
//
// CallMeBot registration: https://www.callmebot.com/blog/free-api-whatsapp-messages/
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function sendViaCallMeBot(phone: string, message: string, apiKey: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMsg}&apikey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    console.error('CallMeBot error:', body);
  }
}

// ── Send WhatsApp to buyer ──────────────────────────────────────────────────
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
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!apiKey) {
    console.log('CALLMEBOT_API_KEY not set — skipping buyer WhatsApp');
    return;
  }

  const message =
    `🎉 *Payment Confirmed!*\n\n` +
    `Hello *${buyerName}*! 👋\n\n` +
    `Thank you for purchasing *${productName}* from *${storeName}*.\n\n` +
    `📥 *Your download link:*\n${driveLink}\n\n` +
    `⚠️ This link is exclusively for you. Do not share it.\n\n` +
    `Thank you for your trust! 🙏\n` +
    `— *${storeName} Team*`;

  try {
    await sendViaCallMeBot(phoneNumber, message, apiKey);
  } catch (error) {
    console.error('Buyer WhatsApp send failed:', error);
  }
}

// ── Send Sale Alert to Admin's WhatsApp ────────────────────────────────────
export async function sendAdminSaleAlert({
  buyerName,
  buyerEmail,
  buyerWhatsapp,
  productName,
  amount,
}: {
  buyerName: string;
  buyerEmail: string;
  buyerWhatsapp: string;
  productName: string;
  amount: string | number;
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const adminPhone = process.env.ADMIN_WHATSAPP;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!apiKey || !adminPhone) {
    console.log('Admin WhatsApp not configured — skipping sale alert');
    return;
  }

  const now = new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const message =
    `💰 *New Sale — ${storeName}!*\n\n` +
    `🛍️ *Product:* ${productName}\n` +
    `💵 *Amount:* ₹${Number(amount).toLocaleString('en-IN')}\n\n` +
    `👤 *Buyer Details:*\n` +
    `• Name: ${buyerName}\n` +
    `• Email: ${buyerEmail}\n` +
    `• WhatsApp: ${buyerWhatsapp}\n\n` +
    `🕐 *Time:* ${now}`;

  try {
    await sendViaCallMeBot(adminPhone, message, apiKey);
  } catch (error) {
    console.error('Admin sale alert WhatsApp failed:', error);
  }
}
