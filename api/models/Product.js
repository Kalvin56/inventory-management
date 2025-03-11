const mongoose = require('mongoose');
const { CATEGORIES } = require('../const');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'Other',
  },
  quantity: {
    type: Number,
    min: 0,
    default: 0,
  },
});

module.exports = mongoose.model('Product', ProductSchema);