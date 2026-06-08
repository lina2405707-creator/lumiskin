/**
 * public/js/checkout.js
 * Client-side validation, input formatting, and UX interactions.
 */

/* ═══════════════════════════════════════════════════════════════ *
 *  UTILITIES
 * ═══════════════════════════════════════════════════════════════ */

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

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove("is-invalid");
  const err = field.parentElement.querySelector(".field-error");
  if (err) err.textContent = "";
}

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

  email: (v) => {
    if (!v.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Please enter a valid email address.";
    return null;
  },

  fullName: (v) => {
    if (!v.trim()) return "Full name is required.";
    if (v.trim().length < 2) return "Full name must be at least 2 characters.";
    if (v.trim().split(/\s+/).length < 2) return "Please enter your first and last name.";
    return null;
  },

  phone: (v) => {
    if (!v.trim()) return "Phone number is required.";
    const d = v.replace(/\D/g, "");
    if (d.length < 7)  return "Phone number is too short.";
    if (d.length > 15) return "Phone number is too long.";
    return null;
  },

  street: (v) => {
    if (!v.trim()) return "Street address is required.";
    if (v.trim().length < 3) return "Please enter a complete street address.";
    return null;
  },

  apt: (v) => {
    if (!v.trim()) return null;
    if (v.trim().length > 20) return "Apartment / Suite is too long.";
    return null;
  },

  city: (v) => {
    if (!v.trim()) return "City is required.";
    if (v.trim().length < 2) return "Please enter a valid city name.";
    return null;
  },

  state: (v) => {
    if (!v.trim()) return "State / Region is required.";
    return null;
  },

  zip: (v) => {
    if (!v.trim()) return "Postal / ZIP code is required.";
    return null;
  },

  country: (v) => {
    if (!v.trim()) return "Country is required.";
    return null;
  },

  cardNumber: (v) => {
    if (!v.trim()) return "Card number is required.";
    const d = v.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(d)) return "Please enter a valid card number (13–19 digits).";
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = parseInt(d[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0 ? null : "Card number is invalid. Please check and try again.";
  },

  expiry: (v) => {
    if (!v.trim()) return "Expiry date is required.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim())) return "Please use MM/YY format.";
    const [, m, y] = v.match(/^(\d{2})\/(\d{2})$/);
    const now = new Date();
    const exp = new Date(2000 + parseInt(y), parseInt(m) - 1, 1);
    return exp < new Date(now.getFullYear(), now.getMonth(), 1) ? "This card has expired." : null;
  },

  cvv: (v) => {
    if (!v.trim()) return "CVV is required.";
    if (!/^\d{3,4}$/.test(v.trim())) return "CVV must be 3 or 4 digits.";
    return null;
  },

  cardName: (v) => {
    if (!v.trim()) return "Name on card is required.";
    if (v.trim().length < 2) return "Please enter the full name on your card.";
    return null;
  },
};

/* ═══════════════════════════════════════════════════════════════ *
 *  INPUT FORMATTERS
 * ═══════════════════════════════════════════════════════════════ */

function formatCardNumber(input) {
  const pos      = input.selectionStart;
  const before   = input.value.length;
  const digits   = input.value.replace(/\D/g, "").slice(0, 19);
  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
  input.value    = formatted;
  const added    = formatted.length - before;
  input.setSelectionRange(pos + added, pos + added);
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  input.value = v;
}

function formatPhone(input) {
  input.value = input.value.replace(/[^\d\s\+\-\(\)]/g, "");
}

/* ═══════════════════════════════════════════════════════════════ *
 *  SHIPPING METHOD → live total update
 * ═══════════════════════════════════════════════════════════════ */

function updateTotals() {
  const method   = document.querySelector('input[name="shippingMethod"]:checked');
  const shipping = method && method.value === "express" ? 15.00 : 0.00;
  const subtotal = parseFloat(document.getElementById("js-subtotal")?.dataset.value || 0);
  const discount = parseFloat(document.getElementById("js-discount")?.dataset.value || 0);
  const taxRate  = 0.085;
  const taxable  = subtotal - discount;
  const tax      = taxable * taxRate;
  const total    = taxable + shipping + tax;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl("js-shipping-display", shipping === 0 ? "Free" : `${shipping.toLocaleString()} EGP`);
  setEl("js-tax-display",      `${tax.toFixed(2)} EGP`);
  setEl("js-total-display",    `${total.toFixed(2)} EGP`);

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
  toggle();
}

/* ═══════════════════════════════════════════════════════════════ *
 *  PROMO CODE (AJAX) — syncs to hidden form input
 * ═══════════════════════════════════════════════════════════════ */

function initPromoCode() {
  const btn        = document.getElementById("apply-promo-btn");
  const input      = document.getElementById("promoCode");
  const hidden     = document.getElementById("promoCode-hidden");
  const msg        = document.getElementById("promo-message");
  if (!btn || !input) return;

  btn.addEventListener("click", async () => {
    const code = input.value.trim();
    if (!code) {
      msg.textContent = "Please enter a promo code.";
      msg.className   = "promo-message error";
      return;
    }

    btn.disabled    = true;
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
        // ✅ Sync promo code to hidden input inside the form
        if (hidden) hidden.value = code;

        input.disabled  = true;
        btn.textContent = "Applied ✓";
        btn.classList.add("applied");

        const discountEl = document.getElementById("js-discount");
        if (discountEl && data.promo.type === "percent") {
          const subtotal = parseFloat(document.getElementById("js-subtotal")?.dataset.value || 0);
          const disc     = subtotal * (data.promo.value / 100);
          discountEl.dataset.value = disc.toFixed(2);
          discountEl.textContent   = `-${disc.toFixed(2)} EGP`;
          discountEl.parentElement.classList.remove("hidden");
        }
        if (data.promo.type === "shipping") {
          const standard = document.querySelector('input[name="shippingMethod"][value="standard"]');
          if (standard) standard.checked = true;
        }
        updateTotals();
      } else {
        btn.disabled    = false;
        btn.textContent = "Apply";
      }
    } catch {
      msg.textContent = "Could not apply code. Try again.";
      msg.className   = "promo-message error";
      btn.disabled    = false;
      btn.textContent = "Apply";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); btn.click(); }
  });
}

/* ═══════════════════════════════════════════════════════════════ *
 *  PAYMENT METHOD TABS
 *  ✅ FIX: updates hidden paymentMethod input so controller knows COD vs card
 * ═══════════════════════════════════════════════════════════════ */

function initPaymentTabs() {
  const tabs            = document.querySelectorAll(".payment-tab");
  const panels          = document.querySelectorAll(".payment-panel");
  const billingToggle   = document.querySelector(".billing-toggle");
  const paymentMethodEl = document.getElementById("paymentMethod");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t)   => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      panels.forEach((p) => p.classList.add("hidden"));

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const panel = document.getElementById(`panel-${tab.dataset.method}`);
      if (panel) panel.classList.remove("hidden");

      // ✅ Update hidden input so the server knows which payment method was chosen
      if (paymentMethodEl) paymentMethodEl.value = tab.dataset.method;

      // Hide billing toggle for COD
      if (billingToggle) {
        billingToggle.style.display = tab.dataset.method === "cod" ? "none" : "";
      }

      // Clear card errors when switching to COD
      if (tab.dataset.method !== "card") {
        ["cardNumber", "expiry", "cvv", "cardName"].forEach(clearError);
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════ *
 *  FORM SUBMISSION
 *  ✅ FIX: validates zip/country, skips card validation for COD
 * ═══════════════════════════════════════════════════════════════ */

function initFormSubmission() {
  const form = document.getElementById("checkout-form");
  const btn  = document.getElementById("place-order-btn");
  if (!form || !btn) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    // ── Contact ──────────────────────────────────────────────────
    valid &= validateField("email",    validators.email);
    valid &= validateField("fullName", validators.fullName);
    valid &= validateField("phone",    validators.phone);

    // ── Shipping Address ─────────────────────────────────────────
    valid &= validateField("street",  validators.street);
    valid &= validateField("apt",     validators.apt);
    valid &= validateField("city",    validators.city);
    valid &= validateField("state",   validators.state);
    valid &= validateField("zip",     validators.zip);     // ✅ was missing
    valid &= validateField("country", validators.country); // ✅ was missing

    // ── Payment ──────────────────────────────────────────────────
    const activeTab = document.querySelector(".payment-tab.active");
    const method    = activeTab ? activeTab.dataset.method : "card";

    if (method === "card") {
      // ✅ Only validate card fields when card tab is active
      valid &= validateField("cardNumber", validators.cardNumber);
      valid &= validateField("expiry",     validators.expiry);
      valid &= validateField("cvv",        validators.cvv);
      valid &= validateField("cardName",   validators.cardName);

      const billingSame = document.getElementById("billingSame");
      if (billingSame && !billingSame.checked) {
        valid &= validateField("billingStreet", validators.street);
        valid &= validateField("billingCity",   validators.city);
        valid &= validateField("billingState",  validators.state);
      }
    }
    // ✅ COD: no card fields needed at all

    if (!valid) {
      const firstErr = form.querySelector(".is-invalid");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // All valid — submit with loading state
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

  // ── Real-time blur validation ─────────────────────────────────
  const liveFields = [
    ["email",    validators.email],
    ["fullName", validators.fullName],
    ["phone",    validators.phone],
    ["street",   validators.street],
    ["apt",      validators.apt],
    ["city",     validators.city],
    ["state",    validators.state],
    ["zip",      validators.zip],
    ["country",  validators.country],
  ];

  liveFields.forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("blur", () => validateField(id, v));
  });

  // Card fields only validate on blur when card tab is active
  const cardFields = [
    ["cardNumber", validators.cardNumber],
    ["expiry",     validators.expiry],
    ["cvv",        validators.cvv],
    ["cardName",   validators.cardName],
  ];

  cardFields.forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("blur", () => {
      const activeTab = document.querySelector(".payment-tab.active");
      if (activeTab && activeTab.dataset.method === "card") {
        validateField(id, v);
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════ *
 *  INPUT FORMATTERS + RESTRICTIONS
 * ═══════════════════════════════════════════════════════════════ */

function initFormatters() {
  const cardInput    = document.getElementById("cardNumber");
  const expiryInput  = document.getElementById("expiry");
  const phoneInput   = document.getElementById("phone");

  if (cardInput)   cardInput.addEventListener("input",   () => formatCardNumber(cardInput));
  if (expiryInput) expiryInput.addEventListener("input", () => formatExpiry(expiryInput));
  if (phoneInput)  phoneInput.addEventListener("input",  () => formatPhone(phoneInput));
}

/* ═══════════════════════════════════════════════════════════════ *
 *  ACCORDION SECTIONS
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

  document.querySelectorAll('input[name="shippingMethod"]').forEach((radio) => {
    radio.addEventListener("change", updateTotals);
  });
});
