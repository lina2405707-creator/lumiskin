const express = require('express');
const router  = express.Router();

const userController = require('../controllers/usercontroller');
const { requireLogin, redirectIfLoggedIn }                      = require('../middleware/auth');
const { validateSignup, validateLogin, validateProfileUpdate }  = require('../middleware/validate');

// ── Auth routes (guests only) ─────────────────────────────────────────────────
router.get('/login',   redirectIfLoggedIn, userController.getLogin);
router.get('/signup',  redirectIfLoggedIn, userController.getSignup);
router.post('/login',  redirectIfLoggedIn, validateLogin,  userController.postLogin);
router.post('/signup', redirectIfLoggedIn, validateSignup, userController.postSignup);

// ── Auth ──────────────────────────────────────────────────────────────────────
router.get('/logout', requireLogin, userController.logout);

// ── Cart (login required) ─────────────────────────────────────────────────────
router.get('/cart',       requireLogin, userController.getCart);
router.get('/cart/data',  requireLogin, userController.getCartData);
router.post('/cart/save', requireLogin, userController.saveCart);

// ── Profile (login + validation required) ────────────────────────────────────
router.get('/profile',  requireLogin, userController.getProfile);
router.post('/profile', requireLogin, validateProfileUpdate, userController.updateProfile);

// ── Quiz & Purchase (login required) ─────────────────────────────────────────
router.post('/save-quiz',     requireLogin, userController.saveQuizResult);
router.post('/save-purchase', requireLogin, userController.savePurchase);

module.exports = router;
