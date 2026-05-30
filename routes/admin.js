const express = require('express');
const router  = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/', adminController.getDashboard);


// Add product — supports file upload + AJAX response
router.post('/add-product', adminController.addProduct);

// ── Person 4: DELETE via fetch() — AJAX delete without page reload ────────────
router.delete('/delete-product/:id', adminController.deleteProduct);
router.get('/delete-product/:id',    adminController.deleteProduct);  // fallback

router.delete('/delete-user/:id', adminController.deleteUser);
router.get('/delete-user/:id',    adminController.deleteUser);         // fallback

// Edit product
router.get('/edit-product/:id',  adminController.getEditProduct);
router.post('/edit-product/:id', adminController.postEditProduct);

// Edit user
router.get('/edit-user/:id',  adminController.getEditUser);
router.post('/edit-user/:id', adminController.postEditUser);

module.exports = router;
