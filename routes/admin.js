const express = require('express');
const router  = express.Router();
const adminController          = require('../controllers/adminController');
const { requireAdmin }         = require('../middleware/auth');

// ── All admin routes protected ────────────────────────────────────────────────
router.use(requireAdmin);

// Dashboard
router.get('/', adminController.getDashboard);

// Products
router.post('/add-product',           adminController.addProduct);
router.delete('/delete-product/:id',  adminController.deleteProduct);
router.get('/delete-product/:id',     adminController.deleteProduct);  // fallback
router.get('/edit-product/:id',       adminController.getEditProduct);
router.post('/edit-product/:id',      adminController.postEditProduct);

// Users
router.delete('/delete-user/:id',     adminController.deleteUser);
router.get('/delete-user/:id',        adminController.deleteUser);     // fallback
router.get('/edit-user/:id',          adminController.getEditUser);
router.post('/edit-user/:id',         adminController.postEditUser);

module.exports = router;
