import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'));

// Placeholder routes - Git integration to be implemented later
router.get('/status', async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ status: 'Git Integration - Coming Soon' });
});

export default router;
