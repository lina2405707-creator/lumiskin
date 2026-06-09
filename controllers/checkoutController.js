/**
 * controllers/checkoutController.js
 */
const Order  = require("../models/Order");
const User   = require("../models/user"); 
const { sendConfirmationEmail } = require("../services/emailService");

const PROMO_CODES = {
  LUMISKIN10: { type: "percent",  value: 10 },
  WELCOME15:  { type: "percent",  value: 15 },
  FREESHIP:   { type: "shipping", value: 0  },
};

const TAX_RATE       = 0.085;
const SHIPPING_COSTS = { standard: 0, express: 15.00 };

function buildCart(rawCart) {
  const map = new Map();
  for (const i of (rawCart || [])) {
    const key   = i.name || '';
    const price = parseFloat(i.price)  || 0;
    const qty   = parseInt(i.quantity) || 1;
    if (map.has(key)) {
      map.get(key).quantity += qty;
    } else {
      map.set(key, {
        productId: i.productId || '',
        name:      key,
        price,
        image:     i.image || '',
        quantity:  qty,
        step:      i.step  || ''
      });
    }
  }
  return Array.from(map.values());
}

/* ─────────────────────────────────────────────────────────────── *
 * GET /checkout
 * ─────────────────────────────────────────────────────────────── */
exports.getCheckout = async (req, res) => {
  if (!req.session.userId) return res.redirect("/user/login");

  try {
    const userRecord = await User.findById(req.session.userId).select('cart');
    const cart = buildCart(userRecord?.cart);

    if (cart.length === 0) return res.redirect("/");

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    res.render("checkout", {
      title:    "Checkout — Lumiskin",
      cart,
      subtotal: subtotal.toFixed(2),
      formData: req.session.checkoutFormData || {},
      errors:   req.session.checkoutErrors   || {},
    });

    delete req.session.checkoutFormData;
    delete req.session.checkoutErrors;
  } catch (err) {
    console.error("[checkoutController] GET error:", err.message);
    res.status(500).redirect("/");
  }
};

/* ─────────────────────────────────────────────────────────────── *
 * POST /checkout
 * ─────────────────────────────────────────────────────────────── */
exports.postCheckout = async (req, res) => {
  if (!req.session.userId) return res.redirect("/user/login");

  const f = req.body;

  try {
    const userRecord = await User.findById(req.session.userId).select('cart');
    const cart = buildCart(userRecord?.cart);
    if (cart.length === 0) return res.redirect("/");

    /* ── Determine payment method ───────────────────────────────── */
    const isCOD = (f.paymentMethod === "cod");

    /* ── Server-side validation ─────────────────────────────────── */
    const errors = {};
    const required = (field, label) => {
      if (!f[field] || !f[field].trim()) errors[field] = `${label} is required.`;
    };

    // Always required
    required("email",    "Email address");
    required("fullName", "Full name");
    required("phone",    "Phone number");
    required("street",   "Street address");
    required("city",     "City");
    required("state",    "State / Region");
    required("zip",      "Postal / ZIP code");
    required("country",  "Country");

    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    // Card fields — only required when paying by card
    if (!isCOD) {
      required("cardName", "Name on card");

      const cardDigits = (f.cardNumber || "").replace(/\s/g, "");
      if (!cardDigits || !/^\d{13,19}$/.test(cardDigits)) {
        errors.cardNumber = "Please enter a valid card number.";
      }
      if (!f.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test((f.expiry || "").trim())) {
        errors.expiry = "Use MM/YY format.";
      }
      if (!f.cvv || !/^\d{3,4}$/.test((f.cvv || "").trim())) {
        errors.cvv = "CVV must be 3 or 4 digits.";
      }

      if (f.billingSame !== "on") {
        required("billingStreet",  "Billing street address");
        required("billingCity",    "Billing city");
        required("billingState",   "Billing state");
        required("billingZip",     "Billing postal code");
        required("billingCountry", "Billing country");
      }
    }

    if (Object.keys(errors).length > 0) {
      console.log("[checkoutController] Validation errors:", errors);
      req.session.checkoutFormData = f;
      req.session.checkoutErrors   = errors;
      return res.redirect("/checkout");
    }

    /* ── Pricing calculations ───────────────────────────────────── */
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let   shipping = SHIPPING_COSTS[f.shippingMethod] ?? 0;
    let   discount = 0;

    const promo = PROMO_CODES[(f.promoCode || "").toUpperCase()];
    if (promo) {
      if (promo.type === "percent")  discount = subtotal * (promo.value / 100);
      if (promo.type === "shipping") shipping = 0;
    }

    const taxable = subtotal - discount;
    const tax     = taxable * TAX_RATE;
    const total   = taxable + shipping + tax;

    const daysToAdd         = f.shippingMethod === "express" ? 2 : 7;
    const deliveryDate      = new Date(Date.now() + daysToAdd * 86400000);
    const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });

    const orderId = `LSK-${Date.now().toString(36).toUpperCase()}`;

    const orderData = {
      orderId,
      email:      f.email.trim(),
      fullName:   f.fullName.trim(),
      phone:      f.phone.trim(),
      subscribed: f.subscribe === "on",

      shippingAddress: {
        street:  f.street.trim(),
        apt:     (f.apt || "").trim(),
        city:    f.city.trim(),
        state:   f.state.trim(),
        zip:     f.zip.trim(),
        country: f.country.trim(),
      },

      billingAddress:
        (isCOD || f.billingSame === "on")
          ? undefined
          : {
              street:  f.billingStreet.trim(),
              apt:     (f.billingApt || "").trim(),
              city:    f.billingCity.trim(),
              state:   f.billingState.trim(),
              zip:     f.billingZip.trim(),
              country: f.billingCountry.trim(),
            },

      items: cart.map(i => ({
        productId: i.productId,
        name:      i.name,
        image:     i.image,
        step:      i.step,
        quantity:  i.quantity,
        price:     i.price,
      })),

      subtotal:  parseFloat(subtotal.toFixed(2)),
      shipping:  parseFloat(shipping.toFixed(2)),
      tax:       parseFloat(tax.toFixed(2)),
      discount:  parseFloat(discount.toFixed(2)),
      total:     parseFloat(total.toFixed(2)),

      paymentMethod:     isCOD ? "cod" : "card",
      shippingMethod:    f.shippingMethod || "standard",
      promoCode:         (f.promoCode || "").toUpperCase(),
      estimatedDelivery,
    };

    // 1. Save order to Orders collection
    const order = new Order(orderData);
    await order.save();
    console.log("[checkoutController] ✅ Order saved:", orderId);

    // 2. Update user: clear cart + add to purchases history
    const purchaseEntries = cart.map(i => ({
      name:  i.name,
      price: i.price * i.quantity,
      date:  new Date(),
    }));

    await User.findByIdAndUpdate(req.session.userId, {
      cart:      [],
      $push:     { purchases: { $each: purchaseEntries } },
    });
    console.log("[checkoutController] ✅ User cart cleared and purchases updated");

    // 3. Send confirmation email (non-blocking — don't let email failure crash checkout)
    try {
      await sendConfirmationEmail({
        email:   orderData.email,
        name:    orderData.fullName,
        orderId,
        items:   orderData.items,
        totals:  { subtotal, shipping, tax, discount, total },
       address: [
  orderData.shippingAddress.street,
  orderData.shippingAddress.apt,
  `${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zip}`,
  orderData.shippingAddress.country,
].filter(Boolean).join("\n"),
        estimatedDelivery,
      });
    } catch (emailErr) {
      console.error("[checkoutController] ⚠️ Email failed (order still saved):", emailErr.message);
    }

    // 4. Store confirmation data in session for the confirmation page
    req.session.orderConfirmation = {
      orderId,
      estimatedDelivery,
      email: orderData.email,
      name:  orderData.fullName,
      total: total.toFixed(2),
    };

    return res.redirect("/checkout/confirmation");

  } catch (err) {
    console.error("[checkoutController] ❌ Order save failed:", err);
    req.session.checkoutFormData = f;
    req.session.checkoutErrors   = {
      general: "Something went wrong processing your order. Please try again.",
    };
    return res.redirect("/checkout");
  }
};

/* ─────────────────────────────────────────────────────────────── *
 * GET /checkout/confirmation
 * ─────────────────────────────────────────────────────────────── */
exports.getConfirmation = (req, res) => {
  const data = req.session.orderConfirmation;
  if (!data) return res.redirect("/");
  delete req.session.orderConfirmation;
  res.render("confirmation", { title: "Order Confirmed — Lumiskin", ...data });
};

/* ─────────────────────────────────────────────────────────────── *
 * POST /checkout/validate-promo  (AJAX)
 * ─────────────────────────────────────────────────────────────── */
exports.validatePromo = (req, res) => {
  const code  = (req.body.code || "").toUpperCase().trim();
  const promo = PROMO_CODES[code];
  if (!promo) return res.json({ valid: false, message: "Invalid promo code." });

  let message = "";
  if (promo.type === "percent")  message = `${promo.value}% discount applied!`;
  if (promo.type === "shipping") message = "Free shipping applied!";

  return res.json({ valid: true, promo, message });
};
