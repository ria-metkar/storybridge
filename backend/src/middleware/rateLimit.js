import rateLimit from 'express-rate-limit';

const options = (limit, windowMinutes) => ({
  windowMs: windowMinutes * 60 * 1000,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({ error: { message: 'Too many requests, please try again later', code: 'RATE_LIMITED' } }),
});

export const authLimiter = rateLimit(options(20, 15));
export const apiLimiter = rateLimit(options(300, 15));
