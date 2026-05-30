const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  brand:    { type: String, required: true },
  price:    { type: Number, required: true },
  image:    { type: String, default: '' },
  image2:   { type: String, default: '' },
  category: { type: String, default: '' },
  tag:      { type: String, default: '' }
});

module.exports = mongoose.model('Product', productSchema);