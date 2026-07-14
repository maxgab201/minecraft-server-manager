import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { serverStatusService } from '../services/serverStatusService.js';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const status = await serverStatusService.getStatus(sessionId);
    res.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status fetch failed';
    res.status(500).json({ error: message });
  }
});

export default router;
