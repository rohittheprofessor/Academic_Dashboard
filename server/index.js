const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const env = require('./config/env');
const { applySecurityMiddleware } = require('./middleware/security');

const app = express();

// Apply Security Middlewares (Helmet, Rate Limiter, Mongo Sanitize, JSON limits)
applySecurityMiddleware(app);

// CORS Configuration for Production
app.use(cors({
  origin: env.nodeEnv === 'production' ? env.clientUrl : ['http://localhost:5173', 'http://localhost:5174'],
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
  
  // Connect to MongoDB
  mongoose.connect(env.mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err.message));
});
