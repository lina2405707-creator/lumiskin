// ── Signup Validation ─────────────────────────────────────────────────────────
exports.validateSignup = (req, res, next) => {
  const { fname, lname, email, password, confirmPassword } = req.body;   

  if (!fname || !lname || !email || !password || !confirmPassword) {
    return res.render('signup', { user: '', error: 'All fields are required.' });
  }
  if (fname.trim().length < 2) {
    return res.render('signup', { user: '', error: 'First name must be at least 2 characters.' });
  }
  if (lname.trim().length < 2) {
    return res.render('signup', { user: '', error: 'Last name must be at least 2 characters.' });
  }
  if (!/^[A-Za-z\s'-]+$/.test(fname.trim())) {
    return res.render('signup', { user: '', error: 'First name must contain letters only.' });
  }
  if (!/^[A-Za-z\s'-]+$/.test(lname.trim())) {
    return res.render('signup', { user: '', error: 'Last name must contain letters only.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.render('signup', { user: '', error: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.render('signup', { user: '', error: 'Password must be at least 8 characters.' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.render('signup', { user: '', error: 'Password must contain at least 1 uppercase letter.' });
  }
  if (!/\d/.test(password)) {
    return res.render('signup', { user: '', error: 'Password must contain at least 1 number.' });
  }
  if (password !== confirmPassword) {
    return res.render('signup', { user: '', error: 'Passwords do not match.' });
  }

  next();
};

// ── Login Validation ──────────────────────────────────────────────────────────
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { user: '', error: 'Please fill in all fields.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.render('login', { user: '', error: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.render('login', { user: '', error: 'Password must be at least 8 characters.' });
  }

  next();
};

// ── Profile Update Validation ─────────────────────────────────────────────────
exports.validateProfileUpdate = async (req, res, next) => {
  const { fname, lname, email, password, confirmPassword } = req.body;

  const fail = async (msg) => {
    const User = require('../models/user');
    const userData = await User.findById(req.session.userId).catch(() => null);
    return res.render('profile', {
      user: req.session.user,
      userData,
      error: msg,
      success: ''
    });
  };

  if (!fname || !fname.trim()) return fail('First name is required.');
  if (!lname || !lname.trim()) return fail('Last name is required.');
  if (fname.trim().length < 2) return fail('First name must be at least 2 characters.');
  if (lname.trim().length < 2) return fail('Last name must be at least 2 characters.');

  // Blocks numbers AND special characters — letters, spaces, hyphens, apostrophes only
  if (!/^[A-Za-z\s'-]+$/.test(fname.trim())) {
    return fail('First name must contain letters only, no numbers or special characters.');
  }
  if (!/^[A-Za-z\s'-]+$/.test(lname.trim())) {
    return fail('Last name must contain letters only, no numbers or special characters.');
  }

  if (!email || !email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return fail('Please enter a valid email address.');
  }

  if (password && password.trim() !== '') {
    if (password.length < 8)          return fail('Password must be at least 8 characters.');
    if (!/[A-Z]/.test(password))      return fail('Password must contain at least 1 uppercase letter.');
    if (!/\d/.test(password))         return fail('Password must contain at least 1 number.');
    if (password !== confirmPassword) return fail('Passwords do not match.');
  }

  next();
};
