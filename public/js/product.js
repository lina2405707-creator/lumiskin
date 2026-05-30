async function addToCart(productName, price) {
    try {
        const res = await fetch('/user/cart/data');
        const data = await res.json();

        if (data.loggedIn) {
            // User is logged in — save to MongoDB
            const updatedCart = [...data.cart, { name: productName, price: price }];
            await fetch('/user/cart/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: updatedCart })
            });
        } else {
            // User is not logged in — save to localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push({ name: productName, price: price });
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        // ── Translated toast ──
        // Use LumiI18n.t() to get the right language string
        const toastSuffix = (window.LumiI18n && window.LumiI18n.t('product.toast'))
            || 'added to cart!';
        showToast(productName + ' ' + toastSuffix);

    } catch (e) {
        // Fallback to localStorage if something goes wrong
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({ name: productName, price: price });
        localStorage.setItem('cart', JSON.stringify(cart));

        const toastSuffix = (window.LumiI18n && window.LumiI18n.t('product.toast'))
            || 'added to cart!';
        showToast(productName + ' ' + toastSuffix);
    }
}

function showToast(message) {
    let toast = document.getElementById('lumiskin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'lumiskin-toast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
            background: rgb(147,97,62); color: #fff; padding: 14px 28px;
            border-radius: 50px; font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 15px; font-weight: 700; z-index: 9999;
            opacity: 0; transition: all 0.35s ease; pointer-events: none;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = '🛒 ' + message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
}