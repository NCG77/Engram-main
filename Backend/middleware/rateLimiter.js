const rateLimit = require('express-rate-limit');

// General API rate limiter (applied to all /api routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes."
  }
});

// Stricter rate limiter for expensive LLM endpoints (e.g., chat generation, embeddings)
const expensiveApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 minutes for these specific endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "You have reached the limit for AI/Expensive requests. Please try again after 15 minutes."
  }
});

module.exports = {
  apiLimiter,
  expensiveApiLimiter
};
