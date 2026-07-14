import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: process.env.JWT_SECRET || uuidv4(),
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  SERVER_DIR: process.env.SERVER_DIR || '/opt/minecraft/server',
  MAX_SESSION_IDLE: parseInt(process.env.MAX_SESSION_IDLE || '1800000', 10),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
