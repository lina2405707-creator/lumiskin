require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('./models/product');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected!');
    await Product.deleteMany({});

    await Product.insertMany([
      // ── CeraVe ──
      {
        name:    'Daily Moisturizing Lotion for Normal to Dry Skin 473ml',
        brand:   'CeraVe',
        price:   650,
        category:'Moisturizer',
        tag:     'DERM APPROVED',
        image:   'CeraVe-Moisturizing-Lotion.avif',
        image2:  'cerave second moist.webp'
      },
      {
        name:    'Foaming Facial Cleanser for Normal to Oily Skin 236ml',
        brand:   'CeraVe',
        price:   550,
        category:'Cleanser',
        tag:     'CLEANSE',
        image:   'foaming-cleanser-236ml-1 cerave.jpg',
        image2:  'cerave cleanse 2.avif'
      },
      {
        name:    'Hydrating Facial Cleanser for Normal to Dry Skin 236ml',
        brand:   'CeraVe',
        price:   580,
        category:'Cleanser',
        tag:     'CLEANSE',
        image:   'hydrating-cleanser-236ml-first cerave.jpg',
        image2:  'cerave cleanser dry skin 2.avif'
      },
      {
        name:    'AM Facial Moisturising Lotion with SPF 50 52ml',
        brand:   'CeraVe',
        price:   1150,
        category:'Sunscreen',
        tag:     'PROTECT',
        image:   'sunblock cera 1.webp',
        image2:  'sunblock cera 2.avif'
      },
      // ── La Roche-Posay ──
      {
        name:    'Effaclar Duo(+) Anti-Blemish Cream 40ml',
        brand:   'La Roche-Posay',
        price:   850,
        category:'Treatment',
        tag:     'DERM APPROVED',
        image:   'Effaclar_Duo+M_40ml_01_La-Roche-Posay.jpg',
        image2:  'la-roche-posay-effaclar-duo-m-2.webp'
      },
      {
        name:    'Cicaplast Baume B5+ Soothing Repairing Balm 40ml',
        brand:   'La Roche-Posay',
        price:   900,
        category:'Treatment',
        tag:     'REPAIR',
        image:   'cica 1.webp',
        image2:  'cica 2.webp'
      },
      {
        name:    'Effaclar Gel Moussant Purifiant 200ml',
        brand:   'La Roche-Posay',
        price:   710,
        category:'Cleanser',
        tag:     'CLEANSE',
        image:   'cleanser la roche 1.avif',
        image2:  'cleanser la roche 2.avif'
      },
      {
        name:    'Anthelios UVMune 400 Invisible Fluid SPF50+',
        brand:   'La Roche-Posay',
        price:   1150,
        category:'Sunscreen',
        tag:     'PROTECT',
        image:   'sunblock1.jpg',
        image2:  'sunblock 2.jpg'
      },
      // ── Uriage ──
      {
        name:    'Bariéderm-Cica Daily Serum for Damaged Skin 30ml',
        brand:   'Uriage',
        price:   1559,
        category:'Serum',
        tag:     'REPAIR',
        image:   '1 uriage.jpg',
        image2:  '2 uriage.jpg'
      },
      {
        name:    'Hyséac Cleansing Gel for Oily/Combination Skin 200ml',
        brand:   'Uriage',
        price:   799,
        category:'Cleanser',
        tag:     'CLEANSE',
        image:   'uriage cleanser 1.webp',
        image2:  'uriage cleanser 2.jpg'
      },
      {
        name:    'Eau Thermale Water Cream for 24H Hydration 40ml',
        brand:   'Uriage',
        price:   814,
        category:'Moisturizer',
        tag:     'HYDRATE',
        image:   'uriage thermal 1.avif',
        image2:  'uriage thermal 2.jpg'
      },
      {
        name:    'Bariésun Mat Fluid SPF50+ For Combination Skin 50ml',
        brand:   'Uriage',
        price:   1025,
        category:'Sunscreen',
        tag:     'PROTECT',
        image:   'sunblock uuriage 1.jpg',
        image2:  'sunblock uuriage 2.jpg'
      }
    ]);

    console.log('✅ All 12 products seeded!');
    process.exit();
  })
  .catch(err => {
    console.log('Failed:', err.message);
    process.exit();
  });