const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env = require('./config/env');
const { applySecurityMiddleware } = require('./middleware/security');

const app = express();

// Trust reverse proxy (required for Render so rate-limiter can read IPs)
app.set('trust proxy', 1);

// Apply Security Middlewares (Helmet, Rate Limiter, Mongo Sanitize, JSON limits)
applySecurityMiddleware(app);

// CORS Configuration
const allowedOrigins = [
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://smartevalmit.netlify.app',
  'https://academic-dashboard-pink.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SmartEval Analytics API is running securely.' });
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Start the server first so Render detects the open port immediately
const PORT = env.port || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
  
// Auto-seed Admin on Startup
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ email: 'admin@smarteval.com' });
    if (!adminExists) {
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
      console.log('✅ Auto-seeded Super Admin account on startup.');
    } else {
      console.log('✅ Super Admin account already exists.');
    }
  } catch (err) {
    console.error('Failed to auto-seed admin:', err.message);
  }
};

// Connect to MongoDB
mongoose.connect(env.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    seedAdmin();
  })
  .catch((err) => console.error('Failed to connect to MongoDB:', err.message));
});
