const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * Security middleware configuration
 */

// Rate limiting for API endpoints
// Note: trustProxy is now set at Express app level (app.set('trust proxy', 1))
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many file uploads, please try again later.',
});

// Helmet security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://appsforoffice.microsoft.com"], // Required for Vite dev + Office.js
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:", "https://outlook.office.com", "https://outlook.office365.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://outlook.office.com", "https://outlook.office365.com", "https://outlook.live.com"],
      frameAncestors: ["https://outlook.office.com", "https://outlook.office365.com", "https://outlook.live.com", "https://*.outlook.office.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Cloudinary images + Outlook embedding
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Request size limits
const requestSizeLimits = {
  json: '10mb', // Reasonable for most requests
  urlencoded: { extended: true, limit: '10mb' },
};

// CORS configuration
const getCorsOptions = () => {
  const baseOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

  // Always include Outlook domains for add-in support
  const outlookOrigins = [
    'https://outlook.office.com',
    'https://outlook.office365.com',
    'https://outlook.live.com',
    'https://outlook-sdf.office.com',
    'https://outlook-sdf.office365.com',
  ];

  const allowedOrigins = [...baseOrigins, ...outlookOrigins];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, same-origin, etc.)
      if (!origin) return callback(null, true);

      // Allow same-origin requests (when the page is served from the same domain)
      if (origin.includes('digitaldream.work')) {
        return callback(null, true);
      }

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
