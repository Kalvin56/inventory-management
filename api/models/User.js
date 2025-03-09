const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: {
    type: [{ type: String, enum: ['user', 'admin'] }],
    default: ['user'],
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);