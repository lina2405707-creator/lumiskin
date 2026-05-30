const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const cartItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  cart: { type: [cartItemSchema], default: [] },
   role:     { type: String, default: 'user' }
});

// Before saving, hash the password automatically
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to check password on login
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);