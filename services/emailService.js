/**
 * services/emailService.js
 */

const nodemailer = require("nodemailer");
const { Resend } = require("resend");

function buildEmailHTML({ name, orderId, items, totals, address, estimatedDelivery }) {
  const itemsHTML = items
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid #2a2a2a;">
        <div>
          <div style="font-size:15px;font-weight:500;color:#e0d8c8;line-height:1.4;">${item.name}</div>
          <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#666;margin-top:4px;">
            DERM APPROVED &nbsp;·&nbsp; ×${item.quantity}
          </div>
        </div>
        <div style="font-family:'Georgia',serif;font-size:17px;color:#c8b89a;white-space:nowrap;">
          ${(item.price * item.quantity).toLocaleString()} EGP
        </div>
      </div>`
    )
    .join("");

  // Safe formatting for address (which can be a string or a structured object from mongoose)
  let formattedAddress = "";
  if (address) {
    if (typeof address === "object") {
      formattedAddress = `${address.street || ""}${address.apt ? ", " + address.apt : ""}<br/>
                          ${address.city || ""}, ${address.state || ""} ${address.zip || ""}<br/>
                          ${address.country || ""}`;
    } else if (typeof address === "string") {
      formattedAddress = address.replace(/\n/g, "<br>");
    }
  }

  const addressHTML = formattedAddress
    ? `
      <div style="padding:20px 32px;border-bottom:1px solid #2a2a2a;">
        <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#555;margin-bottom:10px;">Shipping To</div>
        <div style="font-size:13px;font-weight:300;color:#777;line-height:1.8;">
          ${formattedAddress}
        </div>
      </div>`
    : "";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmed — ${orderId}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:30px 16px;background:#1a1a1a;font-family:'Jost',sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#111;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);">

      <!-- Header -->
      <div style="padding:36px 32px 28px;border-bottom:1px solid #2a2a2a;">
        <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;color:#e8e0d0;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:20px;">
          Lumiskin
        </div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#f0ebe0;line-height:1.2;">
          Thank you, <span style="color:#c8b89a;">${name}</span> 🌿
        </div>
        <p style="margin-top:10px;font-size:13px;font-weight:300;color:#777;line-height:1.6;">
          Your order has been confirmed. We'll send a tracking link once it ships.
        </p>
      </div>

      <!-- Order ID + Delivery -->
      <div style="display:flex;gap:16px;padding:20px 32px;border-bottom:1px solid #2a2a2a;">
        <div style="flex:1;background:#1c1c1c;border-radius:8px;padding:14px 16px;">
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#555;margin-bottom:6px;">Order ID</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:17px;color:#e0d8c8;font-weight:500;">${orderId}</div>
        </div>
        <div style="flex:1;background:#1c1c1c;border-radius:8px;padding:14px 16px;">
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#555;margin-bottom:6px;">Est. Delivery</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:17px;color:#e0d8c8;font-weight:500;line-height:1.3;">${estimatedDelivery}</div>
        </div>
      </div>

      <!-- Items -->
      <div style="padding:20px 32px;border-bottom:1px solid #2a2a2a;">
        <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#555;margin-bottom:4px;">Your Routine</div>
        ${itemsHTML}
      </div>

      <!-- Totals -->
      <div style="padding:20px 32px;border-bottom:1px solid #2a2a2a;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;font-weight:300;margin-bottom:8px;">
          <span>Subtotal</span><span>${totals.subtotal.toLocaleString()} EGP</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;font-weight:300;margin-bottom:8px;">
          <span>Shipping</span><span>${totals.shipping === 0 ? "Free" : `${totals.shipping.toLocaleString()} EGP`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;font-weight:300;margin-bottom:8px;">
          <span>Tax</span><span>${totals.tax.toLocaleString()} EGP</span>
        </div>
        <div style="height:1px;background:#2a2a2a;margin:12px 0;"></div>
        <div style="display:flex;justify-content:space-between;font-size:16px;color:#e0d8c8;font-weight:500;">
          <span>Total</span>
          <span style="font-family:'Cormorant Garamond',serif;font-size:20px;color:#c8b89a;">${totals.total.toLocaleString()} EGP</span>
        </div>
      </div>

      ${addressHTML}

      <!-- Footer -->
      <div style="padding:20px 32px;text-align:center;font-size:11px;color:#444;font-weight:300;letter-spacing:0.04em;">
        © 2026 Lumiskin &nbsp;·&nbsp; lumiskin028@gmail.com
      </div>

    </div>
  </body>
  </html>`;
}

async function sendConfirmationEmail(params) {
  try {
    const html = buildEmailHTML(params);

    if (process.env.NODE_ENV === "production") {
      // Production (Railway) — use Resend
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Lumiskin <onboarding@resend.dev>",
        to: params.email,
        subject: `Order Confirmed — ${params.orderId}`,
        html,
      });
    } else {
      // Localhost — use nodemailer with Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: `"Lumiskin" <${process.env.EMAIL_USER}>`,
        to: params.email,
        subject: `Order Confirmed — ${params.orderId}`,
        text: `Order Confirmed — ${params.orderId}\n\nThank you ${params.name}!\n\nOrder ID: ${params.orderId}\nTotal: ${params.totals.total.toLocaleString()} EGP\nEstimated Delivery: ${params.estimatedDelivery}`,
        html,
      });
    }

    console.log(`[emailService] ✉ Email sent to ${params.email}`);
    return { sent: true };
  } catch (error) {
    console.error("[emailService] Failed:", error);
    return { sent: false, error };
  }
}

module.exports = { sendConfirmationEmail };
