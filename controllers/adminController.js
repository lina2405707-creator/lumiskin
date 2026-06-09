const path = require('path');
const fs   = require('fs');
const User    = require('../models/user');
const Product = require('../models/product');

// ── Show Dashboard ────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  if (!req.session.user) return res.redirect('/user/login');
  if (req.session.role !== 'admin') return res.redirect('/');
  try {
    const users    = await User.find();
    const products = await Product.find();
    res.render('admin', { user: req.session.user, users, products });
  } catch (err) {
    res.redirect('/');
  }
};

// ── Add Product (with image upload) ──────────────────────────────────────────
exports.addProduct = async (req, res) => {
  try {
    const { name, brand, price, category, tag } = req.body;
    let imagePath  = '';
    let image2Path = '';

    // ── Handle primary image upload ──────────────────────────────────────────
    if (req.files && req.files.image) {
      const file     = req.files.image;
      const ext      = path.extname(file.name).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif'];
      if (!allowed.includes(ext)) {
        return res.status(400).json({ success: false, message: 'Invalid image type. Allowed: jpg, png, webp, avif' });
      }
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Image too large (max 5 MB)' });
      }

      const safeName = Date.now() + '-' + file.name.replace(/\s+/g, '-');
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');

      // Make sure uploads folder exists
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      await file.mv(path.join(uploadDir, safeName));
      imagePath = 'uploads/' + safeName;
    }

    // ── Handle secondary image upload ────────────────────────────────────────
    if (req.files && req.files.image2) {
      const file2    = req.files.image2;
      const ext2     = path.extname(file2.name).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif'];

      if (allowed.includes(ext2) && file2.size <= 5 * 1024 * 1024) {
        const safeName2 = Date.now() + '-hover-' + file2.name.replace(/\s+/g, '-');
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        await file2.mv(path.join(uploadDir, safeName2));
        image2Path = 'uploads/' + safeName2;
      }
    }

    const product = await Product.create({ name, brand, price, category, tag, image: imagePath, image2: image2Path });

    // AJAX-friendly response
    if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, product });
    }
    res.redirect('/admin');

  } catch (err) {
    console.error('addProduct error:', err.message);
    if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, message: 'Failed to add product' });
    }
    res.redirect('/admin');
  }
};

// ── Delete Product (AJAX-friendly) ───────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Clean up uploaded image file if it exists
      if (product.image && product.image.startsWith('uploads/')) {
        const imgPath = path.join(__dirname, '..', 'public', 'images', product.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      if (product.image2 && product.image2.startsWith('uploads/')) {
        const img2Path = path.join(__dirname, '..', 'public', 'images', product.image2);
        if (fs.existsSync(img2Path)) fs.unlinkSync(img2Path);
      }
      await Product.findByIdAndDelete(req.params.id);
    }

    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true });
    }
    res.redirect('/admin');
  } catch (err) {
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false });
    }
    res.redirect('/admin');
  }
};

// ── Delete User (AJAX-friendly) ───────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true });
    }
    res.redirect('/admin');
  } catch (err) {
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false });
    }
    res.redirect('/admin');
  }
};

// ── Show Edit Product Page ─────────────────────────────────────────────────────
exports.getEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render('editProduct', { user: req.session.user, product });
  } catch (err) {
    res.redirect('/admin');
  }
};

// ── Save Edited Product (with optional new image) ─────────────────────────────
exports.postEditProduct = async (req, res) => {
  try {
    const { name, brand, price, category, tag } = req.body;
    const update = { name, brand, price, category, tag };

    // ── Replace primary image if a new one was uploaded ──────────────────────
    if (req.files && req.files.image) {
      const file    = req.files.image;
      const ext     = path.extname(file.name).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif'];

      if (allowed.includes(ext) && file.size <= 5 * 1024 * 1024) {
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        // Delete old uploaded image
        const old = await Product.findById(req.params.id);
        if (old && old.image && old.image.startsWith('uploads/')) {
          const oldPath = path.join(__dirname, '..', 'public', 'images', old.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const safeName = Date.now() + '-' + file.name.replace(/\s+/g, '-');
        await file.mv(path.join(uploadDir, safeName));
        update.image = 'uploads/' + safeName;
      }
    }

    // ── Replace secondary image if a new one was uploaded ────────────────────
    if (req.files && req.files.image2) {
      const file2   = req.files.image2;
      const ext2    = path.extname(file2.name).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif'];

      if (allowed.includes(ext2) && file2.size <= 5 * 1024 * 1024) {
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const old = await Product.findById(req.params.id);
        if (old && old.image2 && old.image2.startsWith('uploads/')) {
          const oldPath2 = path.join(__dirname, '..', 'public', 'images', old.image2);
          if (fs.existsSync(oldPath2)) fs.unlinkSync(oldPath2);
        }

        const safeName2 = Date.now() + '-hover-' + file2.name.replace(/\s+/g, '-');
        await file2.mv(path.join(uploadDir, safeName2));
        update.image2 = 'uploads/' + safeName2;
      }
    }

    await Product.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin');
  } catch (err) {
    console.error('editProduct error:', err.message);
    res.redirect('/admin');
  }
};

// ── Show Edit User Page ───────────────────────────────────────────────────────
exports.getEditUser = async (req, res) => {
  if (!req.session.user || req.session.role !== 'admin') return res.redirect('/user/login');
  try {
    const editUser = await User.findById(req.params.id);
    res.render('editUser', { user: req.session.user, editUser });
  } catch (err) {
    res.redirect('/admin');
  }
};

// ── Save Edited User ──────────────────────────────────────────────────────────
exports.postEditUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email });
    res.redirect('/admin');
  } catch (err) {
    res.redirect('/admin');
  }
}; 

