require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected!');

    const adminEmail    = 'admin@miuegypt.edu.eg';
    const adminPassword = 'Admin1234';
    const adminName     = 'Admin';

   const existing = await User.findOne({ email: adminEmail });
if (existing) {
  await User.deleteOne({ email: adminEmail });
  console.log('Old admin deleted, recreating...');
}

    await User.create({
  name:     adminName,
  email:    adminEmail,
  password: adminPassword,   // plain text — the model will hash it automatically
  role:     'admin'
});

    console.log('✅ Admin created!');
    process.exit();
  })
  .catch(err => {
    console.log('Failed:', err.message);
    process.exit();
  });