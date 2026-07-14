import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { sshService } from '../services/sshService.js';
import { validate } from '../services/commandValidator.js';

const router = Router();

router.post('/resize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const { cols, rows } = req.body;

    if (!cols || !rows || typeof cols !== 'number' || typeof rows !== 'number') {
      res.status(400).json({ error: 'cols and rows must be numbers' });
      return;
    }

    if (cols < 10 || cols > 500 || rows < 5 || rows > 200) {
      res.status(400).json({ error: 'cols (10-500) or rows (5-200) out of range' });
      return;
    }

    await sshService.resize(sessionId, Math.floor(cols), Math.floor(rows));
    res.json({ message: 'Terminal resized successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resize failed';
    res.status(500).json({ error: message });
  }
});

router.post('/execute', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      res.status(400).json({ error: 'Command is required and must be a string' });
      return;
    }

    const validation = validate(command);
    if (!validation.allowed) {
      res.status(403).json({ error: validation.error });
      return;
    }

    const output = await sshService.executeCommand(
      sessionId,
      validation.modifiedCommand || command
    );

    res.json({ output });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Command execution failed';
    res.status(500).json({ error: message });
  }
});

export default router;
