import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getRecentErrors, getErrorStats } from '../middleware/errorLogger';
import { getAnalytics, getUserActivity } from '../middleware/analyticsLogger';
import { checkDatabaseConnection } from '../config/database';
import { checkRedisConnection } from '../config/redis';

const router = Router();

// Protect all monitoring routes (admin only)
router.use(authenticate);
router.use((req: Request, res: Response, next) => {
  const user = (req as any).user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
});

// System health and metrics
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await checkDatabaseConnection();
    const redisHealthy = await checkRedisConnection();
    
    res.json({
      status: dbHealthy && redisHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: dbHealthy,
        redis: redisHealthy,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recent errors
router.get('/errors/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const errors = await getRecentErrors(limit);
    res.json(errors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Error statistics
router.get('/errors/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getErrorStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const analytics = await getAnalytics(days);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User activity
router.get('/analytics/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const activity = await getUserActivity(userId, days);
    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
