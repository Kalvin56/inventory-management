const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({path : '../.env'});

async function createAdminUser(password) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true });

    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'admin1@example.com' });
    if (existingUser) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new admin user
    const adminUser = new User({
      name: 'Admin1',
      email: 'admin1@example.com',
      password: hashedPassword,
      roles: ['admin'],
    });

    // Save the user to the database
    await adminUser.save();
    console.log('Admin user created successfully.');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
  }
}

// Get the password from command-line arguments
const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument.');
  process.exit(1);
}

// Validate the password (e.g., at least 12 characters, one uppercase letter, one digit)
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{12,64}$/;
if (!passwordRegex.test(password)) {
  console.error('Password must be at least 12 characters long, contain one uppercase letter, and one digit.');
  process.exit(1);
}

// Execute the function to create the admin user
createAdminUser(password);