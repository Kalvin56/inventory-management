const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await Product.find().skip(skip).limit(parseInt(limit));

    // Get total count of products for pagination metadata
    const totalProducts = await Product.countDocuments();

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
      totalItems: totalProducts,
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const validateProductInput = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
];

router.post('/', [auth, validateProductInput], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message : errors.array()[0].msg});
  }

  const { name, price, description } = req.body;

  try {
    const newProduct = new Product({ name, price, description });
    const product = await newProduct.save();

    res.status(201).json({
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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