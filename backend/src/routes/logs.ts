import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { logsService } from '../services/logsService.js';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    if (limit < 1 || limit > 1000) {
      res.status(400).json({ error: 'limit must be between 1 and 1000' });
      return;
    }

    if (offset < 0) {
      res.status(400).json({ error: 'offset must be a non-negative number' });
      return;
    }

    const result = await logsService.getLogs(sessionId, { limit, offset });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch logs';
    res.status(500).json({ error: message });
  }
});

router.get('/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const limit = parseInt(req.query.limit as string, 10) || 100;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const result = await logsService.searchLogs(sessionId, query, {
      limit,
      offset,
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to search logs';
    res.status(500).json({ error: message });
  }
});

router.get('/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const logPath = await logsService.getLatestLogPath(sessionId);

    const { sshService } = await import('../services/sshService.js');
    const output = await sshService.executeCommand(sessionId, `cat "${logPath}"`);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="latest.log"');
    res.send(output);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to download logs';
    res.status(500).json({ error: message });
  }
});

export default router;
