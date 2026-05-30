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
  if (!/^[A-Za-z]+$/.test(fname.trim())) {
    return res.render('signup', { user: '', error: 'First name must contain letters only.' });
  }
  if (!/^[A-Za-z]+$/.test(lname.trim())) {
    return res.render('signup', { user: '', error: 'Last name must contain letters only.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
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
  if (!/[!@#$%^&*]/.test(password)) {
    return res.render('signup', { user: '', error: 'Password must contain at least one special character (!@#$%^&*).' });
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
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.render('login', { user: '', error: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.render('login', { user: '', error: 'Password must be at least 8 characters.' });
  }

  next();
};