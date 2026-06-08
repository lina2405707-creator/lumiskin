let cart = []; // [{ productId, name, price, image, quantity, step }]

/* ═══════════════════════════════════════════════════════
 *  LOAD
 * ═══════════════════════════════════════════════════════ */
async function loadCart() {
  try {
    const res  = await fetch('/user/cart/data');
    const data = await res.json();
    if (data.loggedIn) {
      cart = (data.cart || []).map(normalise);
    } else {
      cart = JSON.parse(localStorage.getItem('cart')) || [];
    }
  } catch (e) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
  }
  displayCart();
}

/* ═══════════════════════════════════════════════════════
 *  SAVE
 * ═══════════════════════════════════════════════════════ */
async function saveCart() {
  try {
    const res = await fetch('/user/cart/data');
    const { loggedIn } = await res.json();
    if (loggedIn) {
      await fetch('/user/cart/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cart })
      });
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  } catch (e) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

/* ═══════════════════════════════════════════════════════
 *  NORMALISE
 * ═══════════════════════════════════════════════════════ */
function normalise(item) {
  return {
    productId: item.productId || item._id || '',
    name:      item.name      || '',
    price:     parseFloat(item.price)  || 0,
    image:     item.image     || '',
    quantity:  parseInt(item.quantity) || 1,
    step:      item.step      || ''
  };
}

/* ═══════════════════════════════════════════════════════
 *  ADD TO CART
 *  Accepts EITHER an object OR (productId, name, price, image, step)
 * ═══════════════════════════════════════════════════════ */
function addToCart(productIdOrObj, name, price, image, step) {
  let item;
  if (typeof productIdOrObj === 'object' && productIdOrObj !== null) {
    item = normalise(productIdOrObj);
  } else {
    item = normalise({ productId: productIdOrObj, name, price, image, step, quantity: 1 });
  }

  const existing = cart.find(i => i.name === item.name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }
  saveCart();
  displayCart();
}

/* ═══════════════════════════════════════════════════════
 *  DISPLAY CART
 * ═══════════════════════════════════════════════════════ */
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
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (summary)  summary.style.display  = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summary)  summary.style.display  = 'block';

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-info">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" class="cart-item-img" style="width:48px;height:48px;object-fit:cover;border-radius:6px;margin-right:10px;">`
          : ''}
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${item.price.toLocaleString()} EGP each</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
        <span class="qty-count">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
        <span class="cart-item-total">${itemTotal.toLocaleString()} EGP</span>
        <button class="remove-btn" onclick="removeItem('${item.name}')">✕</button>
      </div>`;
    cartItemsEl.appendChild(li);
  });

  const totalStr = total.toLocaleString() + ' EGP';
  if (totalAmountEl) totalAmountEl.textContent = totalStr;
  if (subtotalEl)    subtotalEl.textContent    = totalStr;
}

/* ═══════════════════════════════════════════════════════
 *  CHANGE QUANTITY
 * ═══════════════════════════════════════════════════════ */
function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(i => i.name !== name);
  saveCart();
  displayCart();
}

/* ═══════════════════════════════════════════════════════
 *  REMOVE ITEM
 * ═══════════════════════════════════════════════════════ */
function removeItem(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  displayCart();
}

/* ═══════════════════════════════════════════════════════
 *  CHECKOUT
 * ═══════════════════════════════════════════════════════ */
function checkout() {
  if (!cart || cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  fetch('/user/save-purchase', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ items: cart })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/checkout';
    } else {
      alert('Checkout error: ' + data.message);
    }
  })
  .catch(err => {
    console.error('Checkout sync failed:', err);
    alert('An error occurred preparing checkout.');
  });
}

loadCart();
