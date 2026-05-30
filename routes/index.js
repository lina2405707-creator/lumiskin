const express  = require('express');
const router   = express.Router();
const controller   = require('../controllers/indexcontroller');
const skinCtrl = require('../controllers/skinAdvisorController');

router.get('/',             controller.getHome);
router.get('/about',        controller.getAbout);
router.get('/quiz',         controller.getQuiz);
router.get('/myth-vs-fact', controller.getMythVsFact);
router.get('/cerave',       controller.getCerave);
router.get('/laroche',      controller.getLaroche);
router.get('/uriage',       controller.getUriage);

// Skin Advisor page
router.get('/skin-advisor', skinCtrl.getSkinAdvisor);

// AJAX: search products
router.get('/api/products/search', async (req, res) => {
  const Product = require('../models/product');
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, products: [] });
  try {
    const products = await Product.find({
      $or: [
        { name:     { $regex: q, $options: 'i' } },
        { brand:    { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tag:      { $regex: q, $options: 'i' } }
      ]
    }).limit(20);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// AJAX: get single product by id
router.get('/api/products/:id', async (req, res) => {
  const Product = require('../models/product');
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Person 4: UV Index API — calls Open-Meteo external API (no key needed)
router.get('/api/uv-index', async (req, res) => {
  const lat = parseFloat(req.query.lat) || 30.06;
  const lon = parseFloat(req.query.lon) || 31.25;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,temperature_2m,relative_humidity_2m&forecast_days=1&timezone=auto`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('API error ' + response.status);
    const data = await response.json();
    const hour = new Date().getHours();
    return res.json({
      success:     true,
      uv_index:    data.hourly?.uv_index?.[hour]             ?? 0,
      temperature: data.hourly?.temperature_2m?.[hour]       ?? 0,
      humidity:    data.hourly?.relative_humidity_2m?.[hour] ?? 0,
      time:        data.hourly?.time?.[hour]                 ?? null,
      timezone:    data.timezone
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Person 4: Random skin fact
router.get('/api/skin-fact', (req, res) => {
  const facts = [
    'Your skin is the largest organ — about 15% of your total body weight.',
    'Skin cells renew every 2–4 weeks, shedding around 30,000 dead cells every hour.',
    'UV rays cause up to 90% of visible skin aging. Sunscreen is your #1 anti-aging product.',
    'Ceramides make up 50% of the skin lipid barrier — a key ingredient in CeraVe.',
    'Hyaluronic acid holds up to 1000 times its weight in water.',
    'SPF 30 blocks 97% of UVB rays; reapplication matters more than a higher SPF number.',
    'The skin around your eyes is only 0.5mm thick — the thinnest skin on your body.',
    'Stress increases cortisol, which boosts oil production and can trigger breakouts.',
    'Vitamin C brightens skin and fights free-radical damage from pollution.',
    'Niacinamide reduces pore appearance, evens skin tone, and strengthens the skin barrier.'
  ];
  const fact = facts[Math.floor(Math.random() * facts.length)];
  res.json({ success: true, fact });
});

module.exports = router;