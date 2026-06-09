/**
 * routes/checkout.js
 * Mount this in app.js: app.use("/checkout", require("./routes/checkout"));
 */

const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/checkoutController");

// Render checkout page
router.get("/",                controller.getCheckout);

// Handle form submission
router.post("/",               controller.postCheckout);

// Order confirmed screen
router.get("/confirmation",    controller.getConfirmation);

// AJAX promo code validation
router.post("/validate-promo", controller.validatePromo);

module.exports = router; 
