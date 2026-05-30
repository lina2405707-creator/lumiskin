const express = require('express');
const router = express.Router();
const userController = require('../controllers/indexController');
const { requireLogin, redirectIfLoggedIn } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');

// Logged-in users can't visit login or signup
router.get('/login', redirectIfLoggedIn, userController.getLogin);
router.get('/signup', redirectIfLoggedIn, userController.getSignup);
router.post('/login', redirectIfLoggedIn, validateLogin, userController.postLogin);
router.post('/signup', redirectIfLoggedIn, validateSignup, userController.postSignup);

// These pages require login
router.get('/logout', requireLogin, userController.logout);
router.get('/cart', requireLogin, userController.getCart);
router.get('/cart/data', requireLogin, userController.getCartData);
router.post('/cart/save', requireLogin, userController.saveCart);
router.get('/profile', userController.getProfile);
router.post('/profile', userController.updateProfile);
module.exports = router;