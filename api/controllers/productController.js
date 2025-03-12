const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { body, validationResult } = require('express-validator');
const { CATEGORIES } = require('../const');

/**
 * @route GET /
 * @desc Fetch paginated products
 * @access Public
 */
router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;
    const products = await Product.find().skip(skip).limit(parseInt(limit));
    const totalProducts = await Product.countDocuments();

    res.json({
      data : {
        products,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: parseInt(page),
        totalItems: totalProducts,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /:id
 * @desc Fetch a product by ID
 * @access Public
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      data: {
        product
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validation rules for product creation
const validateProductInput = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').isIn(CATEGORIES).withMessage('Invalid category'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('description').optional().isString().withMessage('Description must be a string'),
];

/**
 * @route POST /
 * @desc Create a new product
 * @access Admin only
 */
router.post('/', [auth, role(['admin']), validateProductInput], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, price, category, description, quantity } = req.body;

  try {
    const newProduct = new Product({ name, price, category, description, quantity });
    const product = await newProduct.save();

    res.status(201).json({
      data : {
        product
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validation rules for product update
const validateProductUpdate = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

/**
 * @route PUT /:id
 * @desc Update a product
 * @access Admin only
 */
router.put('/:id', [auth, role(['admin']), validateProductUpdate], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const updateFields = req.body;
    const product = await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      data : {
        product
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /:id
 * @desc Delete a product
 * @access Admin only
 */
router.delete('/:id', [auth, role(['admin'])], async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product successfully removed',
      data : {
        deletedProduct: product
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;