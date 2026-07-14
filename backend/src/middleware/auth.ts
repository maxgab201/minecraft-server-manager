import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/env.js';
import { sessionManager } from '../services/sessionManager.js';

interface JwtPayload {
  sessionId: string;
  username: string;
  host: string;
  port: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').map((c) => c.trim());
      for (const cookie of cookies) {
        if (cookie.startsWith('session_token=')) {
          token = cookie.substring('session_token='.length);
          break;
        }
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;

    const session = sessionManager.getSession(decoded.sessionId);
    if (!session) {
      res.status(401).json({ error: 'Session expired or not found' });
      return;
    }

    req.sessionId = decoded.sessionId;
    req.session = session;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    res.status(500).json({ error: 'Authentication error' });
  }
}
