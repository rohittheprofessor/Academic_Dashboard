const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { isStrongPassword, isValidEmail } = require('../utils/validators');

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

// @desc    Register a new teacher
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, mobile, department, designation, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      mobile,
      department,
      designation,
      password: hashedPassword,
      role: 'Teacher',
      status: 'Pending' // Requires admin approval
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        message: 'Registration successful. Please wait for admin approval.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check status for teachers
      if (user.role === 'Teacher' && user.status !== 'Approved') {
         return res.status(403).json({ 
           message: `Your account is currently ${user.status}. You cannot login until an Admin approves your account.` 
         });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
