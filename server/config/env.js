require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_dashboard',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_development_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = config;
