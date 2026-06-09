// ── Section Switcher ──────────────────────────────────────────────────────────
// ── Section Switcher ──────────────────────────────────────────────────────────
function showSection(name) {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('productsSection').style.display  = 'none';
    document.getElementById('userSection').style.display      = 'none';
    document.getElementById(name + 'Section').style.display = 'block';
    
    // Save the active section in localStorage so it persists after page reload
    localStorage.setItem('activeAdminSection', name);
}

// ── Restore the last active section after page load ──────────────────────────
function restoreActiveSection() {
    const savedSection = localStorage.getItem('activeAdminSection');
    if (savedSection && savedSection !== 'dashboard') {
        showSection(savedSection);
    } else {
        showSection('dashboard');
    }
}

// ── Toast Notification ────────────────────────────────────────────────────────
function showToast(msg, isError = false) {
    const toast = document.getElementById('admin-toast');
    toast.textContent = msg;
    toast.className = isError ? 'error show' : 'show';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.className = toast.className.replace(' show',''); }, 3000);
}

// ── Image Preview (for file inputs) ──────────────────────────────────────────
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ── AJAX Delete Product (no page reload) ──────────────────────────────────────
// Person 4: Uses fetch() with DELETE method instead of page navigation
async function ajaxDeleteProduct(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
        const res  = await fetch(`/admin/delete-product/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();

        if (data.success) {
            // Remove the row from the DOM immediately — no page reload needed
            const row = document.getElementById(`product-row-${id}`);
            if (row) {
                row.style.transition = 'opacity 0.3s';
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            }

            // Update the dashboard product count
            const countEl = document.getElementById('productCount');
            if (countEl) countEl.textContent = parseInt(countEl.textContent) - 1;

            showToast(`"${name}" deleted successfully`);
        } else {
            showToast('Delete failed — please try again', true);
        }
    } catch (err) {
        console.error('Delete error:', err);
        showToast('Network error — please try again', true);
    }
}

// ── AJAX Delete User (no page reload) ────────────────────────────────────────
async function ajaxDeleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;

    try {
        const res  = await fetch(`/admin/delete-user/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();

        if (data.success) {
            const row = document.getElementById(`user-row-${id}`);
            if (row) {
                row.style.transition = 'opacity 0.3s';
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            }
            showToast(`User "${name}" deleted`);
        } else {
            showToast('Delete failed — please try again', true);
        }
    } catch (err) {
        showToast('Network error — please try again', true);
    }
}

// ── AJAX Add Product Form (with file upload via FormData) ─────────────────────
// Person 4: Uses fetch() to POST multipart/form-data so page does NOT reload
document.addEventListener('DOMContentLoaded', () => {
    restoreActiveSection();
    const form   = document.getElementById('addProductForm');
    const addBtn = document.getElementById('addBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // stop normal form submission

        addBtn.disabled    = true;
        addBtn.textContent = 'Adding…';

        // FormData automatically includes file inputs
        const formData = new FormData(form);

        try {
            const res  = await fetch('/admin/add-product', {
                method: 'POST',
                headers: { 'Accept': 'application/json',
                           'X-Requested-With': 'XMLHttpRequest' },
                body: formData   // multipart/form-data set automatically by browser
            });
            const data = await res.json();

            if (data.success) {
                showToast('✓ Product added successfully!');
                form.reset();

                // Hide previews
                document.getElementById('imgPreview').style.display  = 'none';
                document.getElementById('img2Preview').style.display = 'none';

                // Add the new row to the table dynamically
                appendProductRow(data.product);

                // Update dashboard count
                const countEl = document.getElementById('productCount');
                if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;

                // Remove "no products" row if it exists
                const emptyRow = document.getElementById('emptyProductsRow');
                if (emptyRow) emptyRow.remove();
            } else {
                showToast(data.error || 'Failed to add product', true);
            }
        } catch (err) {
            console.error('Add product error:', err);
            showToast('Network error — please try again', true);
        } finally {
            addBtn.disabled    = false;
            addBtn.textContent = '+ Add Product';
        }
    });
});

// ── Append a new product row to the table without a page reload ───────────────
function appendProductRow(product) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.id = `product-row-${product._id}`;

    const imgHtml = product.image
        ? `<img src="${product.image}" alt="${escapeHtml(product.name)}" class="prod-thumb">`
        : `<span style="color:#666;font-size:11px;">No img</span>`;

    tr.innerHTML = `
        <td>${imgHtml}</td>
        <td>${escapeHtml(product.name)}</td>
        <td>${escapeHtml(product.brand)}</td>
        <td>${product.price} EGP</td>
        <td>${escapeHtml(product.category || '')}</td>
        <td>${escapeHtml(product.tag || '')}</td>
        <td>
            <a href="/admin/edit-product/${product._id}"
               style="color:#a36c45; margin-right:10px;">Edit</a>
            <button onclick="ajaxDeleteProduct('${product._id}', '${escapeHtml(product.name)}')"
                    style="background:none; border:none; color:red; cursor:pointer; font-size:14px; padding:0;">
                Delete
            </button>
        </td>`;

    // Fade in
    tr.style.opacity = '0';
    tbody.appendChild(tr);
    setTimeout(() => { tr.style.transition = 'opacity 0.4s'; tr.style.opacity = '1'; }, 50);
}

// ── HTML escape helper ────────────────────────────────────────────────────────
function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
