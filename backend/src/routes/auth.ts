import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sshService } from '../services/sshService.js';
import { sessionManager } from '../services/sessionManager.js';
import { authMiddleware } from '../middleware/auth.js';
import { CONFIG } from '../config/env.js';

const router = Router();

router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { username, host, port, privateKey, passphrase } = req.body;

    if (!username || !host || !port || !privateKey) {
      res.status(400).json({
        error: 'Missing required fields: username, host, port, privateKey',
      });
      return;
    }

    if (typeof port !== 'number' || port < 1 || port > 65535) {
      res.status(400).json({ error: 'Port must be a number between 1 and 65535' });
      return;
    }

    const result = await sshService.connect({
      username,
      host,
      port,
      privateKey,
      passphrase,
    });

    const token = jwt.sign(
      {
        sessionId: result.sessionId,
        username,
        host,
        port,
      },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.JWT_EXPIRY } as jwt.SignOptions
    );

    res.json({
      token,
      sessionId: result.sessionId,
      connection: {
        sessionId: result.sessionId,
        username,
        host,
        port,
        connectedAt: Date.now(),
        serverDir: CONFIG.SERVER_DIR,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    res.status(500).json({ error: message });
  }
});

router.post('/disconnect', authMiddleware, (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    sshService.disconnect(sessionId);
    res.json({ message: 'Disconnected successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Disconnect failed';
    res.status(500).json({ error: message });
  }
});

router.get('/status', authMiddleware, (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      sessionId: session.sessionId,
      username: session.username,
      host: session.host,
      port: session.port,
      connectedAt: session.createdAt,
      lastActivity: session.lastActivity,
      serverDir: CONFIG.SERVER_DIR,
      alive: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    res.status(500).json({ error: message });
  }
});

export default router;
