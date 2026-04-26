const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: '.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@smarteval.com' });
    if (adminExists) {
      console.log('Super Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@1234', salt);

    await User.create({
      name: 'System Administrator',
      email: 'admin@smarteval.com',
      mobile: '0000000000',
      department: 'Management',
      designation: 'Super Admin',
      password: hashedPassword,
      role: 'Super Admin',
      status: 'Approved'
    });

    console.log('Super Admin created successfully!');
    console.log('Email: admin@smarteval.com');
    console.log('Password: Admin@1234');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
