/**
 * models/Order.js
 * Mongoose schema for a placed order.
 */

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:      { type: String, required: true },
  image:     { type: String },
  step:      { type: String },           // e.g. "Cleanser", "Moisturiser"
  quantity:  { type: Number, required: true, min: 1 },
  price:     { type: Number, required: true },
});

const addressSchema = new mongoose.Schema({
  street:  { type: String, required: true },
  apt:     { type: String, default: "" },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  zip:     { type: String, required: true },
  country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderId:   { type: String, required: true, unique: true },

    // Customer
    email:     { type: String, required: true },
    fullName:  { type: String, required: true },
    phone:     { type: String, required: true },
    subscribed:{ type: Boolean, default: false },  // newsletter opt-in

    // Addresses
    shippingAddress: { type: addressSchema, required: true },
    billingAddress:  { type: addressSchema },       // null = same as shipping

    // Items & pricing
    items:     { type: [orderItemSchema], required: true },
    subtotal:  { type: Number, required: true },
    shipping:  { type: Number, required: true },
    tax:       { type: Number, required: true },
    discount:  { type: Number, default: 0 },
    total:     { type: Number, required: true },

    // Shipping & payment meta
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    promoCode: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    estimatedDelivery: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);