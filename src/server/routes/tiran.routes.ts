import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Placeholder routes - AI integration to be implemented later
router.get('/status', async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ status: 'AI Assistant TIRAN - Coming Soon' });
});

export default router;
