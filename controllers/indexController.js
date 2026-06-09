const Product = require('../models/product');

exports.getHome = (req, res) => {
  res.render('index', { user: req.session.user || '', role: req.session.role || '' });
};

exports.getAbout = (req, res) => {
  res.render('about', { user: req.session.user || '', role: req.session.role || '' });
};

exports.getQuiz = (req, res) => {
  res.render('quiz', { user: req.session.user || '', role: req.session.role || '' });
};

exports.getMythVsFact = (req, res) => {
  res.render('mythVSfact', { user: req.session.user || '', role: req.session.role || '' });
};

// Brand pages — fetch products from DB by brand
exports.getCerave = async (req, res) => {
  try {
    const products = await Product.find({ brand: 'CeraVe' });
    res.render('cerave', { user: req.session.user || '', role: req.session.role || '', products });
  } catch (err) {
    res.render('cerave', { user: req.session.user || '', role: req.session.role || '', products: [] });
  }
};

exports.getLaroche = async (req, res) => {
  try {
    const products = await Product.find({ brand: 'La Roche-Posay' });
    res.render('laroche-products', { user: req.session.user || '', role: req.session.role || '', products });
  } catch (err) {
    res.render('laroche-products', { user: req.session.user || '', role: req.session.role || '', products: [] });
  }
};

exports.getUriage = async (req, res) => {
  try {
    const products = await Product.find({ brand: 'Uriage' });
    res.render('uriage', { user: req.session.user || '', role: req.session.role || '', products });
  } catch (err) {
    res.render('uriage', { user: req.session.user || '', role: req.session.role || '', products: [] });
  }
};  



