require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  family: 4,
  
})
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database connection failed', err.message));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(require('path').join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only true in production
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || '';
  res.locals.role = req.session.role || '';
  next();
});

// ── View Engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, 'views'));

// ── Routes ────────────────────────────────────────────────────────────────────
const indexRoutes = require('./routes/index');
const userRoutes  = require('./routes/user');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', {});
});

// ── 500 Handler ───────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).render('500', {});
});

// ── Local dev server (not used by Vercel) ─────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();

  try {
    const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (e) {
    app.listen(3000, () => console.log('HTTP running at http://localhost:3000'));
  }
}

// ── Export for Vercel ─────────────────────────────────────────────────────────
module.exports = app;