import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config/env.js';

export const apiRateLimit = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW,
  max: CONFIG.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
