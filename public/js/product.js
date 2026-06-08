async function addToCart(productId, productName, price, image, step) {
    try {
        const res  = await fetch('/user/cart/data');
        const data = await res.json();

        // Build the full item object
        const newItem = {
            productId: productId || '',
            name:      productName,
            price:     parseFloat(price) || 0,
            image:     image || '',
            quantity:  1,
            step:      step  || ''
        };

        if (data.loggedIn) {
            // User is logged in — merge into DB cart (increment qty if exists)
            const cart = (data.cart || []).map(i => ({
                productId: i.productId || '',
                name:      i.name,
                price:     parseFloat(i.price) || 0,
                image:     i.image    || '',
                quantity:  parseInt(i.quantity) || 1,
                step:      i.step     || ''
            }));

            const existing = cart.find(i => i.name === productName);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push(newItem);
            }

            await fetch('/user/cart/save', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ cart })
            });
        } else {
            // Not logged in — use localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existing = cart.find(i => i.name === productName);
            if (existing) {
                existing.quantity = (parseInt(existing.quantity) || 1) + 1;
            } else {
                cart.push(newItem);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        const toastSuffix = (window.LumiI18n && window.LumiI18n.t('product.toast'))
            || 'added to cart!';
        showToast(productName + ' ' + toastSuffix);

    } catch (e) {
        // Fallback to localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(i => i.name === productName);
        if (existing) {
            existing.quantity = (parseInt(existing.quantity) || 1) + 1;
        } else {
            cart.push({ productId: productId || '', name: productName, price: parseFloat(price) || 0, image: image || '', quantity: 1, step: step || '' });
        }
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
        toast.style.opacity  = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
}

/* ── Tag translation ── */
var TAG_MAP = {
    en: {
        'HYDRATE'      : 'HYDRATE',
        'CLEANSE'      : 'CLEANSE',
        'REPAIR'       : 'REPAIR',
        'PROTECT'      : 'PROTECT',
        'SOOTHE'       : 'SOOTHE',
        'DERM APPROVED': 'DERM APPROVED',
        'MOISTURIZE'   : 'MOISTURIZE',
        'SPF'          : 'SPF',
        'TREAT'        : 'TREAT',
        'BRIGHTEN'     : 'BRIGHTEN'
    },
    ar: {
        'HYDRATE'      : 'ترطيب',
        'CLEANSE'      : 'تنظيف',
        'REPAIR'       : 'إصلاح',
        'PROTECT'      : 'حماية',
        'SOOTHE'       : 'تهدئة',
        'DERM APPROVED': 'موصى طبياً',
        'MOISTURIZE'   : 'ترطيب عميق',
        'SPF'          : 'حماية شمس',
        'TREAT'        : 'علاج',
        'BRIGHTEN'     : 'إشراق'
    }
};

function translateTags() {
    var lang = window.LumiI18n ? window.LumiI18n.lang() : 'en';
    var map  = TAG_MAP[lang] || TAG_MAP.en;
    document.querySelectorAll('[data-product-tag]').forEach(function (el) {
        var original = el.getAttribute('data-product-tag');
        el.textContent = map[original] || original;
    });
}

document.addEventListener('DOMContentLoaded', translateTags);
document.addEventListener('langchange',       translateTags);
