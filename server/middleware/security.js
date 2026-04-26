const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting for general API routes (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for login/auth routes (5 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Factory function to apply all security middlewares to the Express app
const applySecurityMiddleware = (app) => {
  // Set security HTTP headers (disable CSP for React apps using inline styles/scripts)
  app.use(helmet({ contentSecurityPolicy: false }));

  // Restrict payload size to prevent memory exhaustion attacks (ERP files can be large but JSON shouldn't be over 50MB)
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '50mb' }));
  
  // Apply general API rate limiter
  app.use('/api/', apiLimiter);
};

module.exports = {
  applySecurityMiddleware,
  authLimiter
};
