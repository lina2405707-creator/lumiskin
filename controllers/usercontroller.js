// ── GET /user/login ───────────────────────────────────────────────────────────
const User = require('../models/user');
const bcrypt = require('bcrypt');
exports.getLogin = (req, res) => {
  res.render('login', { user: req.session.user || '', error: '' });
};

// ── POST /user/login ──────────────────────────────────────────────────────────
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const found = await User.findOne({ email });

    if (!found) {
      return res.render('login', { user: '', error: 'No account found with this email' });
    }

    const match = await found.comparePassword(password);
    if (!match) {
      return res.render('login', { user: '', error: 'Incorrect password' });
    }

    req.session.user   = found.name;
    req.session.role   = found.role;
    req.session.userId = found._id;

    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      if (found.role === 'admin') return res.redirect('/admin');
      res.redirect('/');
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.render('login', { user: '', error: 'Something went wrong, try again' });
  }
};

// ── GET /user/signup ──────────────────────────────────────────────────────────
exports.getSignup = (req, res) => {
  res.render('signup', { user: req.session.user || '', error: '' });
};

// ── POST /user/signup ─────────────────────────────────────────────────────────
exports.postSignup = async (req, res) => {
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

  if (password !== confirmPassword) {
    return res.render('signup', { user: '', error: 'Passwords do not match.' });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.render('signup', { user: '', error: 'This email is already registered.' });
    }

    const name = `${fname.trim()} ${lname.trim()}`;
    await User.create({ name, email: email.toLowerCase().trim(), password });
    res.redirect('/user/login');

  } catch (err) {
    console.error('Signup error FULL:', err);
    res.render('signup', { user: '', error: 'Something went wrong. Please try again.' });
  }
};

// ── GET /user/logout ──────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err.message);
    res.redirect('/');
  });
};

// ── GET /user/cart ────────────────────────────────────────────────────────────
exports.getCart = (req, res) => {
  res.render('cart', { user: req.session.user || '' });
};

// ── GET /user/cart/data ───────────────────────────────────────────────────────
exports.getCartData = async (req, res) => {
  if (!req.session.userId) {
    return res.json({ loggedIn: false, cart: [] });
  }
  try {
    const user = await User.findById(req.session.userId).select('cart');
    res.json({ loggedIn: true, cart: user ? user.cart : [] });
  } catch (err) {
    res.json({ loggedIn: false, cart: [] });
  }
};

// ── POST /user/cart/save ──────────────────────────────────────────────────────
exports.saveCart = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { cart } = req.body;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }
  try {
    await User.findByIdAndUpdate(req.session.userId, { cart });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save cart' });
  }
};

// ── GET /user/profile ─────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  if (!req.session.user) return res.redirect('/user/login');
  try {
    const user = await User.findById(req.session.userId);
    res.render('profile', { user: req.session.user, userData: user, error: '', success: '' });
  } catch (err) {
    res.redirect('/');
  }
};

// ── POST /user/profile ────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  if (!req.session.user) return res.redirect('/user/login');
  try {
    const { fname, lname, email, password, confirmPassword } = req.body;
    const name = fname + ' ' + lname;
    const updateData = { name, email };

    if (password && password !== '') {
      if (password !== confirmPassword) {
        const user = await User.findById(req.session.userId);
        return res.render('profile', {
          user: req.session.user,
          userData: user,
          error: 'Passwords do not match',
          success: ''
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(req.session.userId, updateData);
    req.session.user = name;

    const updatedUser = await User.findById(req.session.userId);
    res.render('profile', {
      user: req.session.user,
      userData: updatedUser,
      error: '',
      success: 'Profile updated successfully!'
    });
  } catch (err) {
    res.redirect('/');
  }
};

// Save quiz result to database
exports.saveQuizResult = async (req, res) => {
  try {
    const { result } = req.body;
    if (!req.session.userId) return res.json({ success: false, message: 'Not logged in' });
    await User.findByIdAndUpdate(req.session.userId, { quizResult: result });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// Save purchases to database (called when checkout happens)
exports.savePurchase = async (req, res) => {
  try {
    const { items } = req.body;
    if (!req.session.userId) return res.json({ success: false, message: 'Not logged in' });
    if (!items || items.length === 0) return res.json({ success: false, message: 'No items' });

    const purchaseItems = items.map(item => ({
      name:  item.name,
      price: item.price,
      date:  new Date()
    }));

    await User.findByIdAndUpdate(req.session.userId, {
      $push: { purchases: { $each: purchaseItems } }
    });

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};