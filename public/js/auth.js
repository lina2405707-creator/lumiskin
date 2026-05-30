// ── Login Validation ──────────────────────────────────────────────────────────
function validateLogin() {
    const email    = document.getElementById('Login_Email').value.trim();
    const password = document.getElementById('Login_Password').value;

    // Email format check
    const emailRegex = /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address.');
        return false;
    }

    // Password checks
    if (password.length === 0) {
        showError('Please enter your password.');
        return false;
    }
    if (password.length < 8) {
        showError('Password must be at least 8 characters.');
        return false;
    }

    // ✅ All good — let the form submit to the backend
    return true;
}

// ── Signup Validation ─────────────────────────────────────────────────────────
function validatesignup() {
    const Fname = document.getElementById('Fname').value;
    if (!/^[a-zA-Z\s]{3,}$/.test(Fname)) {
        showError('First name must be at least 3 letters.');
        return false;
    }

    const Lname = document.getElementById('Lname').value;
    if (!/^[a-zA-Z\s]{3,}$/.test(Lname)) {
        showError('Last name must be at least 3 letters.');
        return false;
    }

    const email = document.getElementById('Email').value;
    if (!/^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/.test(email)) {
        showError('Please enter a valid email address.');
        return false;
    }

    const password = document.getElementById('Password').value;
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
        showError('Password must be at least 8 chars, 1 uppercase, 1 number.');
        return false;
    }

    const confirmPassword = document.getElementById('Confirm_Password').value;
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return false;
    }

    // ✅ All good — let the form submit to the backend
    return true;
}

// ── Helper: show error message ────────────────────────────────────────────────
function showError(msg) {
    // Try to find an error element first
    const errorEl = document.getElementById('error-msg');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    } else {
        alert(msg);
    }
}