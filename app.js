const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const MongoStore = require('connect-mongo')(session);

const app = express();
app.set('trust proxy', 1);

// ── Database ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database connection failed', err.message));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(require('path').join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const checkoutRoutes = require('./routes/checkout');

app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/checkout', checkoutRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', {});
});

// ── 500 Handler ───────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).render('500', {});
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  // ── Local HTTPS on port 3000 ──
  const https = require('https');
  const fs    = require('fs');
  const path  = require('path');

  const certPath = path.join(__dirname, 'cert.crt');
  const keyPath  = path.join(__dirname, 'cert.key');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const sslOptions = {
      key:  fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`HTTPS running at https://localhost:${PORT}`);
    });
  } else {
    // No cert files found — fall back to HTTP
    app.listen(PORT, () => {
      console.log(`HTTP running at http://localhost:${PORT}`);
    });
  }
} else {
  // ── Production (Railway) — plain HTTP, Railway handles HTTPS ──
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
