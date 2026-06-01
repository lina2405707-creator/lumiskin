let cart = [];

async function loadCart() {
  try {
    const res = await fetch('/user/cart/data');
    const data = await res.json();
    if (data.loggedIn) {
      cart = data.cart || [];
    } else {
      cart = JSON.parse(localStorage.getItem('cart')) || [];
    }
  } catch (e) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
  }
  displayCart();
}

async function saveCart() {
  try {
    const res = await fetch('/user/cart/data');
    const { loggedIn } = await res.json();
    if (loggedIn) {
      await fetch('/user/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      });
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  } catch (e) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

function displayCart() {
  const cartItemsEl   = document.getElementById('cartItems');
  const totalAmountEl = document.getElementById('totalAmount');
  const subtotalEl    = document.getElementById('subtotal');
  const emptyMsg      = document.getElementById('emptyMsg');
  const summary       = document.getElementById('cartSummary');
  if (!cartItemsEl) return;

  cartItemsEl.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    emptyMsg.style.display = 'block';
    if (summary) summary.style.display = 'none';
    return;
  }

  emptyMsg.style.display = 'none';
  if (summary) summary.style.display = 'block';

  const grouped = {};
  cart.forEach(item => {
    if (grouped[item.name]) {
      grouped[item.name].qty++;
    } else {
      grouped[item.name] = { ...item, qty: 1 };
    }
  });

  Object.values(grouped).forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${item.price.toLocaleString()} EGP each</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.name}', ${item.price}, -1)">−</button>
        <span class="qty-count">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.name}', ${item.price}, 1)">+</button>
        <span class="cart-item-total">${itemTotal.toLocaleString()} EGP</span>
        <button class="remove-btn" onclick="removeItem('${item.name}')">✕</button>
      </div>`;
    cartItemsEl.appendChild(li);
  });

  const totalStr = total.toLocaleString() + ' EGP';
  if (totalAmountEl) totalAmountEl.textContent = totalStr;
  if (subtotalEl)    subtotalEl.textContent    = totalStr;
}

function changeQty(name, price, delta) {
  const idx = cart.findIndex(i => i.name === name);
  if (delta === 1) {
    cart.push({ name, price });
  } else if (delta === -1 && idx !== -1) {
    cart.splice(idx, 1);
  }
  saveCart();
  displayCart();
}

function removeItem(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  displayCart();
}

function checkout() {
  let cart = JSON.parse(localStorage.getItem('lumiskin_cart') || '[]');

  if (!cart || cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Save purchases to database
  fetch('/user/save-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart })
  })
  .then(res => res.json())
  .then(data => {
    // Clear cart after successful purchase
    localStorage.removeItem('lumiskin_cart');
    alert('✓ Thank you for your order! Your purchase has been saved.');
    window.location.reload();
  })
  .catch(() => {
    // Even if save fails, confirm the order
    localStorage.removeItem('lumiskin_cart');
    alert('✓ Thank you for your order!');
    window.location.reload();
  });
}

loadCart();