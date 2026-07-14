import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { shortcutsService } from '../services/shortcutsService.js';
import { ShortcutAction } from '../types/index.js';
import { SHORTCUT_DEFINITIONS } from '../../../shared/constants/commands.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ shortcuts: SHORTCUT_DEFINITIONS });
});

router.post('/execute', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionId!;
    const { action } = req.body;

    if (!action) {
      res.status(400).json({ error: 'Action is required' });
      return;
    }

    if (!Object.values(ShortcutAction).includes(action as ShortcutAction)) {
      res.status(400).json({
        error: `Invalid action: ${action}. Valid actions: ${Object.values(ShortcutAction).join(', ')}`,
      });
      return;
    }

    const result = await shortcutsService.executeShortcut(
      sessionId,
      action as ShortcutAction
    );

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Shortcut execution failed';
    res.status(500).json({ error: message });
  }
});

export default router;
