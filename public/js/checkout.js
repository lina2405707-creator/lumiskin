/**
 * public/js/checkout.js
 * Client-side validation, input formatting, and UX interactions.
 * Vanilla JS — no dependencies required.
 */

/* ═══════════════════════════════════════════════════════════════ *
 *  UTILITIES
 * ═══════════════════════════════════════════════════════════════ */

/** Show an inline error below a field */
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add("is-invalid");
  let err = field.parentElement.querySelector(".field-error");
  if (!err) {
    err = document.createElement("span");
    err.className = "field-error";
    field.parentElement.appendChild(err);
  }
  err.textContent = message;
}

/** Clear error for a field */
function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove("is-invalid");
  const err = field.parentElement.querySelector(".field-error");
  if (err) err.textContent = "";
}

/** Validate a single field and return true if valid */
function validateField(fieldId, validator) {
  const field = document.getElementById(fieldId);
  if (!field) return true;
  const error = validator(field.value);
  if (error) { showError(fieldId, error); return false; }
  clearError(fieldId);
  return true;
}

/* ═══════════════════════════════════════════════════════════════ *
 *  VALIDATORS
 * ═══════════════════════════════════════════════════════════════ */

const validators = {
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Please enter a valid email address.",
  required: (label) => (v) => v.trim() ? null : `${label} is required.`,
  phone:    (v) => {
    const d = v.replace(/\D/g, "");
    return d.length >= 7 && d.length <= 15 ? null : "Please enter a valid phone number.";
  },
  zip:      (v) => /^[A-Z0-9][A-Z0-9\s\-]{2,9}[A-Z0-9]$/i.test(v.trim()) ? null : "Please enter a valid postal / ZIP code.",
  cardNumber: (v) => {
    const d = v.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(d)) return "Please enter a valid card number.";
    // Luhn check
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = parseInt(d[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0 ? null : "Card number is invalid.";
  },
  expiry: (v) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim())) return "Use MM/YY format.";
    const [, m, y] = v.match(/^(\d{2})\/(\d{2})$/);
    const now = new Date();
    const exp = new Date(2000 + parseInt(y), parseInt(m) - 1, 1);
    return exp < new Date(now.getFullYear(), now.getMonth(), 1) ? "This card has expired." : null;
  },
  cvv:    (v) => /^\d{3,4}$/.test(v.trim()) ? null : "CVV must be 3 or 4 digits.",
};

/* ═══════════════════════════════════════════════════════════════ *
 *  INPUT FORMATTERS
 * ═══════════════════════════════════════════════════════════════ */

/** Format card number with spaces every 4 digits */
function formatCardNumber(input) {
  const pos    = input.selectionStart;
  const before = input.value.length;
  const digits = input.value.replace(/\D/g, "").slice(0, 19);
  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
  input.value = formatted;
  // Restore cursor position accounting for added spaces
  const added = formatted.length - before;
  input.setSelectionRange(pos + added, pos + added);
}

/** Format expiry to MM/YY */
function formatExpiry(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  input.value = v;
}

/* ═══════════════════════════════════════════════════════════════ *
 *  SHIPPING METHOD → live total update
 * ═══════════════════════════════════════════════════════════════ */

function updateTotals() {
  const method    = document.querySelector('input[name="shippingMethod"]:checked');
  const shipping  = method && method.value === "express" ? 15.00 : 0.00;
  const subtotal  = parseFloat(document.getElementById("js-subtotal")?.dataset.value || 0);
  const discount  = parseFloat(document.getElementById("js-discount")?.dataset.value || 0);
  const taxRate   = 0.085;
  const taxable   = subtotal - discount;
  const tax       = taxable * taxRate;
  const total     = taxable + shipping + tax;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl("js-shipping-display", shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`);
  setEl("js-tax-display",      `$${tax.toFixed(2)}`);
  setEl("js-total-display",    `$${total.toFixed(2)}`);

  // Keep hidden input in sync for server
  const hiddenShipping = document.getElementById("js-shipping-value");
  if (hiddenShipping) hiddenShipping.value = shipping.toFixed(2);
}

/* ═══════════════════════════════════════════════════════════════ *
 *  BILLING ADDRESS TOGGLE
 * ═══════════════════════════════════════════════════════════════ */

function initBillingToggle() {
  const checkbox = document.getElementById("billingSame");
  const section  = document.getElementById("billing-address-section");
  if (!checkbox || !section) return;

  function toggle() {
    if (checkbox.checked) {
      section.classList.add("hidden");
      section.querySelectorAll("input, select").forEach((el) => (el.disabled = true));
    } else {
      section.classList.remove("hidden");
      section.querySelectorAll("input, select").forEach((el) => (el.disabled = false));
    }
  }

  checkbox.addEventListener("change", toggle);
  toggle(); // run on load
}

/* ═══════════════════════════════════════════════════════════════ *
 *  PROMO CODE (AJAX)
 * ═══════════════════════════════════════════════════════════════ */

function initPromoCode() {
  const btn    = document.getElementById("apply-promo-btn");
  const input  = document.getElementById("promoCode");
  const msg    = document.getElementById("promo-message");
  if (!btn || !input) return;

  btn.addEventListener("click", async () => {
    const code = input.value.trim();
    if (!code) { msg.textContent = "Please enter a promo code."; msg.className = "promo-message error"; return; }

    btn.disabled = true;
    btn.textContent = "Applying…";

    try {
      const res  = await fetch("/checkout/validate-promo", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code }),
      });
      const data = await res.json();

      msg.textContent = data.message;
      msg.className   = `promo-message ${data.valid ? "success" : "error"}`;

      if (data.valid) {
        input.disabled = true;
        btn.textContent = "Applied ✓";
        btn.disabled = true;
        btn.classList.add("applied");

        // Store discount for live total calculation
        const discountEl = document.getElementById("js-discount");
        if (discountEl && data.promo.type === "percent") {
          const subtotal = parseFloat(document.getElementById("js-subtotal")?.dataset.value || 0);
          const disc = subtotal * (data.promo.value / 100);
          discountEl.dataset.value = disc.toFixed(2);
          discountEl.textContent   = `-$${disc.toFixed(2)}`;
          discountEl.parentElement.classList.remove("hidden");
        }
        if (data.promo.type === "shipping") {
          // force shipping to 0 by checking standard
          const standard = document.querySelector('input[name="shippingMethod"][value="standard"]');
          if (standard) { standard.checked = true; }
        }
        updateTotals();
      } else {
        btn.disabled = false;
        btn.textContent = "Apply";
      }
    } catch {
      msg.textContent = "Could not apply code. Try again.";
      msg.className   = "promo-message error";
      btn.disabled    = false;
      btn.textContent = "Apply";
    }
  });

  // Also trigger on Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); btn.click(); }
  });
}

/* ═══════════════════════════════════════════════════════════════ *
 *  PAYMENT METHOD TABS (Card / PayPal / Apple Pay)
 * ═══════════════════════════════════════════════════════════════ */

function initPaymentTabs() {
  const tabs    = document.querySelectorAll(".payment-tab");
  const panels  = document.querySelectorAll(".payment-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t)   => t.classList.remove("active"));
      panels.forEach((p) => p.classList.add("hidden"));
      tab.classList.add("active");
      const panel = document.getElementById(`panel-${tab.dataset.method}`);
      if (panel) panel.classList.remove("hidden");
    });
  });
}

/* ═══════════════════════════════════════════════════════════════ *
 *  FORM SUBMISSION — validation + loading state
 * ═══════════════════════════════════════════════════════════════ */

function initFormSubmission() {
  const form   = document.getElementById("checkout-form");
  const btn    = document.getElementById("place-order-btn");
  if (!form || !btn) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    // Contact
    valid &= validateField("email",    validators.email);
    valid &= validateField("fullName", validators.required("Full name"));
    valid &= validateField("phone",    validators.phone);

    // Shipping address
    valid &= validateField("street",  validators.required("Street address"));
    valid &= validateField("city",    validators.required("City"));
    valid &= validateField("state",   validators.required("State / Region"));
    valid &= validateField("zip",     validators.zip);
    valid &= validateField("country", validators.required("Country"));

    // Active payment method
    const activeTab = document.querySelector(".payment-tab.active");
    const method    = activeTab ? activeTab.dataset.method : "card";
    if (method === "card") {
      valid &= validateField("cardNumber", validators.cardNumber);
      valid &= validateField("expiry",     validators.expiry);
      valid &= validateField("cvv",        validators.cvv);
      valid &= validateField("cardName",   validators.required("Name on card"));
    }

    // Billing if different
    const billingSame = document.getElementById("billingSame");
    if (billingSame && !billingSame.checked) {
      valid &= validateField("billingStreet",  validators.required("Billing street"));
      valid &= validateField("billingCity",    validators.required("Billing city"));
      valid &= validateField("billingState",   validators.required("Billing state"));
      valid &= validateField("billingZip",     validators.zip);
      valid &= validateField("billingCountry", validators.required("Billing country"));
    }

    if (!valid) {
      // Scroll to first error
      const firstErr = form.querySelector(".is-invalid");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // All good — show loading state and submit
    btn.disabled = true;
    btn.classList.add("loading");
    btn.innerHTML = `
      <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/>
      </svg>
      Processing…
    `;
    form.submit();
  });

  // Real-time validation on blur
  const liveFields = [
    ["email",      validators.email],
    ["fullName",   validators.required("Full name")],
    ["phone",      validators.phone],
    ["street",     validators.required("Street address")],
    ["city",       validators.required("City")],
    ["zip",        validators.zip],
    ["cardNumber", validators.cardNumber],
    ["expiry",     validators.expiry],
    ["cvv",        validators.cvv],
    ["cardName",   validators.required("Name on card")],
  ];

  liveFields.forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("blur", () => validateField(id, v));
  });
}

/* ═══════════════════════════════════════════════════════════════ *
 *  INPUT EVENT LISTENERS (formatting)
 * ═══════════════════════════════════════════════════════════════ */

function initFormatters() {
  const cardInput   = document.getElementById("cardNumber");
  const expiryInput = document.getElementById("expiry");

  if (cardInput)   cardInput.addEventListener("input",   () => formatCardNumber(cardInput));
  if (expiryInput) expiryInput.addEventListener("input", () => formatExpiry(expiryInput));
}

/* ═══════════════════════════════════════════════════════════════ *
 *  ACCORDION SECTIONS (mobile UX)
 * ═══════════════════════════════════════════════════════════════ */

function initAccordion() {
  document.querySelectorAll(".section-header").forEach((header) => {
    header.addEventListener("click", () => {
      const section = header.closest(".form-section");
      section.classList.toggle("collapsed");
    });
  });
}

/* ═══════════════════════════════════════════════════════════════ *
 *  INIT
 * ═══════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  initBillingToggle();
  initPromoCode();
  initPaymentTabs();
  initFormSubmission();
  initFormatters();
  initAccordion();
  updateTotals();

  // Update totals when shipping method changes
  document.querySelectorAll('input[name="shippingMethod"]').forEach((radio) => {
    radio.addEventListener("change", updateTotals);
  });
});