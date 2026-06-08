/**
 * services/emailService.js
 *
 * Sends a post-purchase confirmation email.
 */



/**
 * Builds a clean HTML email body for the order confirmation.
 */
function buildEmailHTML({ name, orderId, items, totals, address, estimatedDelivery }) {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece8;">
          <strong>${item.name}</strong><br/>
          <span style="color:#9a8f87;font-size:13px;">${item.step || ""}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece8;text-align:center;color:#6b6460;">
          ×${item.quantity}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece8;text-align:right;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#faf8f6;font-family:'Georgia',serif;color:#2c2420;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;">

        <tr>
          <td style="background:#2c2420;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#f5f0eb;font-size:22px;letter-spacing:4px;font-weight:400;">
              LUMISKIN
            </h1>
          </td>
        </tr>

        <tr><td style="padding:40px;">
          <p style="font-size:18px;margin:0 0 8px;">Thank you, ${name}. 🌿</p>
          <p style="color:#9a8f87;margin:0 0 32px;font-size:14px;line-height:1.6;">
            Your order has been confirmed. We'll send a tracking link once it ships.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#faf8f6;border-radius:4px;">
            <tr>
              <td style="padding:16px 20px;">
                <span style="font-size:12px;letter-spacing:2px;color:#9a8f87;text-transform:uppercase;">Order ID</span><br/>
                <strong style="font-size:15px;">${orderId}</strong>
              </td>
              <td style="padding:16px 20px;text-align:right;">
                <span style="font-size:12px;letter-spacing:2px;color:#9a8f87;text-transform:uppercase;">Est. Delivery</span><br/>
                <strong style="font-size:15px;">${estimatedDelivery}</strong>
              </td>
            </tr>
          </table>

          <p style="font-size:12px;letter-spacing:2px;color:#9a8f87;text-transform:uppercase;margin:0 0 12px;">
            Your Routine
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="padding:6px 0;color:#9a8f87;font-size:14px;">Subtotal</td>
              <td style="padding:6px 0;text-align:right;font-size:14px;">$${totals.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#9a8f87;font-size:14px;">Shipping</td>
              <td style="padding:6px 0;text-align:right;font-size:14px;">
                ${totals.shipping === 0 ? "Free" : "$" + totals.shipping.toFixed(2)}
              </td>
            </tr>
            ${totals.discount > 0 ? `
            <tr>
              <td style="padding:6px 0;color:#7d9e7a;font-size:14px;">Discount</td>
              <td style="padding:6px 0;text-align:right;font-size:14px;color:#7d9e7a;">
                -$${totals.discount.toFixed(2)}
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:6px 0;color:#9a8f87;font-size:14px;">Tax</td>
              <td style="padding:6px 0;text-align:right;font-size:14px;">$${totals.tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:14px 0 0;font-size:16px;font-weight:bold;border-top:1px solid #f0ece8;">
                Total
              </td>
              <td style="padding:14px 0 0;text-align:right;font-size:16px;font-weight:bold;border-top:1px solid #f0ece8;">
                $${totals.total.toFixed(2)}
              </td>
            </tr>
          </table>

          <div style="margin-top:32px;padding:20px;background:#faf8f6;border-radius:4px;">
            <p style="font-size:12px;letter-spacing:2px;color:#9a8f87;text-transform:uppercase;margin:0 0 10px;">
              Shipping To
            </p>
            <p style="margin:0;line-height:1.8;font-size:14px;">
              ${address.street}${address.apt ? ", " + address.apt : ""}<br/>
              ${address.city}, ${address.state} ${address.zip}<br/>
              ${address.country}
            </p>
          </div>
        </td></tr>

        <tr>
          <td style="padding:24px 40px;text-align:center;border-top:1px solid #f0ece8;">
            <p style="margin:0;font-size:12px;color:#c4bcb8;letter-spacing:1px;">
              Questions? Reply to this email or visit lumiskin.com/help<br/>
              © ${new Date().getFullYear()} Lumiskin. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * sendConfirmationEmail — call this after a successful order save.  
*/ 

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendConfirmationEmail(params) {
  try {
    const html = buildEmailHTML(params);

    await resend.emails.send({
  from: 'Lumiskin <onboarding@resend.dev>',
  to: 'lina2405707@gmail.com', 
  subject: `Order Confirmed — ${params.orderId}`,
  html,
});

    console.log(`[emailService] ✉ Email sent to ${params.email}`);
    return { sent: true };
  } catch (error) {
    console.error('[emailService] Failed:', error);
    return { sent: false, error };
  }
}
 module.exports = { sendConfirmationEmail };
 
