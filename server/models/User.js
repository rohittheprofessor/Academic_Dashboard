const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Teacher', 'Super Admin'],
    default: 'Teacher'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Deactivated'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
