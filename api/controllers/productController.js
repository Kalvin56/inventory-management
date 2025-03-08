const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Get Products Route (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create Product Route (Admin Only)
router.post('/', [auth, role(['admin'])], async (req, res) => {
  const { name, price, description } = req.body;

  try {
    const newProduct = new Product({ name, price, description });
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update Product Route (Admin Only)
router.put('/:id', [auth, role(['admin'])], async (req, res) => {
  const { name, price, description } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.name = name;
    product.price = price;
    product.description = description;

    product = await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete Product Route (Admin Only)
router.delete('/:id', [auth, role(['admin'])], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    await Product.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;