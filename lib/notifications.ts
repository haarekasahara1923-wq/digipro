import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

interface LinkGroup {
  productName: string;
  driveLink: string;
  bonusLinks: { title: string; url: string }[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📧 BUYER PURCHASE EMAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function sendPurchaseEmail({
  buyerEmail, buyerName, productName, allLinks, amount,
}: {
  buyerEmail: string;
  buyerName: string;
  productName: string;
  allLinks: LinkGroup[];
  amount?: string | number;
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const storeUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://digipro-five.vercel.app';
  const year = new Date().getFullYear();
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const linksHTML = allLinks.map(({ productName: pName, driveLink, bonusLinks }, i) => `
    <div style="background:#1a1a1a;border-radius:14px;border:1px solid #2a2a2a;margin-bottom:16px;overflow:hidden;">
      <div style="background:#111;border-bottom:1px solid #2a2a2a;padding:12px 20px;">
        <span style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">
          ${allLinks.length > 1 ? `Product ${i + 1}` : 'Your Product'}
        </span>
        <p style="margin:4px 0 0;font-size:16px;color:#fff;font-weight:700;">${pName}</p>
      </div>
      <div style="padding:16px 20px;">
        <!-- Main download -->
        <p style="margin:0 0 10px;font-size:13px;color:#888;">📥 Main Download:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${bonusLinks?.length ? '16px' : '0'};">
          <tr>
            <td align="center">
              <a href="${driveLink}" style="display:inline-block;background:linear-gradient(135deg,#FFD700,#B8960C);color:#000;text-decoration:none;font-size:14px;font-weight:900;letter-spacing:0.5px;padding:14px 32px;border-radius:10px;">
                📥 Download ${pName}
              </a>
            </td>
          </tr>
        </table>
        <!-- Bonus links -->
        ${bonusLinks?.length ? `
        <div style="border-top:1px solid #2a2a2a;padding-top:12px;">
          <p style="margin:0 0 10px;font-size:12px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🎁 Free Bonus${bonusLinks.length > 1 ? 'es' : ''} Included:</p>
          ${bonusLinks.map(b => `
            <div style="margin-bottom:8px;">
              <a href="${b.url}" style="display:inline-flex;align-items:center;gap:6px;color:#FFD700;text-decoration:none;font-size:13px;font-weight:600;">
                🔗 ${b.title}
              </a>
            </div>
          `).join('')}
        </div>` : ''}
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#090909;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#090909;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border-radius:20px;overflow:hidden;border:1px solid #1f1f1f;">
      <!-- Gold banner -->
      <tr><td style="background:linear-gradient(135deg,#FFD700 0%,#F5A623 50%,#B8960C 100%);padding:36px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:32px;">🎉</p>
        <h1 style="margin:0;font-size:26px;font-weight:900;color:#000;letter-spacing:2px;text-transform:uppercase;">Payment Confirmed!</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#2a1a00;font-weight:600;">Your digital product${allLinks.length > 1 ? 's are' : ' is'} ready to download</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#FFD700;">Hello, ${buyerName}! 👋</h2>
        <p style="margin:0 0 24px;font-size:15px;color:#aaa;line-height:1.7;">
          Thank you for your purchase! Your payment has been <strong style="color:#4ade80;">successfully verified</strong>.
          ${allLinks.length > 1 ? `You've purchased <strong style="color:#fff;">${allLinks.length} products</strong>.` : ''}
        </p>
        <!-- Order details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Order Summary</p>
            <p style="margin:0 0 6px;font-size:15px;color:#fff;font-weight:600;">${productName}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-size:12px;color:#555;">Date</td><td align="right" style="font-size:12px;color:#888;">${date}</td></tr>
              ${amount ? `<tr><td style="font-size:12px;color:#555;padding-top:4px;">Amount Paid</td><td align="right" style="font-size:12px;color:#FFD700;font-weight:700;padding-top:4px;">₹${Number(amount).toLocaleString('en-IN')}</td></tr>` : ''}
              <tr><td style="font-size:12px;color:#555;padding-top:4px;">Status</td><td align="right" style="padding-top:4px;"><span style="font-size:11px;background:#052e16;color:#4ade80;border-radius:20px;padding:3px 10px;font-weight:700;">✓ PAID</span></td></tr>
            </table>
          </td></tr>
        </table>
        <!-- All download links -->
        <p style="margin:0 0 14px;font-size:15px;color:#ccc;font-weight:600;">
          ${allLinks.length > 1 ? '🎁 All Your Products:' : '📥 Your Download:'}
        </p>
        ${linksHTML}
        <!-- Warning -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1000;border-radius:10px;border-left:4px solid #FFD700;margin:20px 0;">
          <tr><td style="padding:14px 18px;"><p style="margin:0;font-size:13px;color:#ccaa00;line-height:1.6;">⚠️ <strong>Important:</strong> These download links are exclusively for you. Do not share them with others.</p></td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #222;margin:28px 0;"/>
        <p style="margin:0 0 8px;font-size:12px;color:#555;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Need Help?</p>
        <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">Reply to this email or contact us at ${process.env.EMAIL_USER || 'support@digipro.com'}</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#0d0d0d;border-top:1px solid #1a1a1a;padding:24px 40px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#FFD700;font-weight:700;">${storeName}</p>
        <a href="${storeUrl}" style="font-size:11px;color:#444;text-decoration:none;">${storeUrl}</a>
        <p style="margin:12px 0 0;font-size:11px;color:#333;">© ${year} ${storeName}. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  await transporter.sendMail({
    from: `"${storeName} 🛍️" <${process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `🎉 Purchase Confirmed — ${productName} | ${storeName}`,
    html,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 WHATSAPP (CallMeBot)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function sendViaCallMeBot(phone: string, message: string, apiKey: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) console.error('CallMeBot error:', await res.text());
}

export async function sendWhatsAppMessage({
  phoneNumber, buyerName, productName, allLinks,
}: {
  phoneNumber: string;
  buyerName: string;
  productName: string;
  allLinks: LinkGroup[];
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) { console.log('CALLMEBOT_API_KEY not set — skipping'); return; }

  const linksText = allLinks.map((l, i) => {
    let txt = `${allLinks.length > 1 ? `*${i + 1}. ${l.productName}*\n` : ''}📥 ${l.driveLink}`;
    if (l.bonusLinks?.length) {
      txt += `\n🎁 Bonuses:\n` + l.bonusLinks.map(b => `• ${b.title}: ${b.url}`).join('\n');
    }
    return txt;
  }).join('\n\n');

  const message =
    `🎉 *Payment Confirmed!*\n\n` +
    `Hello *${buyerName}*! 👋\n\n` +
    `Thank you for purchasing from *${storeName}*.\n\n` +
    `📦 *Your Download${allLinks.length > 1 ? 's' : ''}:*\n\n` +
    linksText + `\n\n` +
    `⚠️ Links are exclusively for you.\n— *${storeName} Team*`;

  try { await sendViaCallMeBot(phoneNumber, message, apiKey); } catch (e) { console.error(e); }
}

export async function sendAdminSaleAlert({
  buyerName, buyerEmail, buyerWhatsapp, productName, amount,
}: {
  buyerName: string; buyerEmail: string; buyerWhatsapp: string;
  productName: string; amount: string | number;
}) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const adminPhone = process.env.ADMIN_WHATSAPP;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey || !adminPhone) { console.log('Admin WhatsApp not configured'); return; }

  const now = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const message =
    `💰 *New Sale — ${storeName}!*\n\n` +
    `🛍️ *Product:* ${productName}\n` +
    `💵 *Amount:* ₹${Number(amount).toLocaleString('en-IN')}\n\n` +
    `👤 *Buyer:*\n• ${buyerName}\n• ${buyerEmail}\n• ${buyerWhatsapp}\n\n` +
    `🕐 ${now}`;

  try { await sendViaCallMeBot(adminPhone, message, apiKey); } catch (e) { console.error(e); }
}
