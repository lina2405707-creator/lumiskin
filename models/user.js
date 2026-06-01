const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const cartItemSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  date:  { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, default: 'user' },
  cart:       { type: [cartItemSchema], default: [] },
  quizResult: { type: String, default: '' },
  purchases:  { type: [purchaseSchema], default: [] }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password on login
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);