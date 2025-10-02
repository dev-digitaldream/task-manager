const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * Security middleware configuration
 */

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust X-Forwarded-For from CapRover/reverse proxy
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
  trustProxy: true, // Trust X-Forwarded-For from CapRover/reverse proxy
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many file uploads, please try again later.',
  trustProxy: true, // Trust X-Forwarded-For from CapRover/reverse proxy
});

// Helmet security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Vite dev
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Cloudinary images
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Request size limits
const requestSizeLimits = {
  json: '10mb', // Reasonable for most requests
  urlencoded: { extended: true, limit: '10mb' },
};

// CORS configuration
const getCorsOptions = () => {
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Basic XSS prevention
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: isDevelopment ? err.message : 'Invalid token',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: isDevelopment ? err.message : 'Invalid input',
    });
  }

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  helmetConfig,
  requestSizeLimits,
  getCorsOptions,
  sanitizeInput,
  errorHandler,
};
