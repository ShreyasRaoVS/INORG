import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get notifications for current user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { read, limit = '50' } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
        ...(read !== undefined && { read: read === 'true' })
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        read: false
      }
    });

    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: { read: true }
    });

    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.put('/mark-all-read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        read: false
      },
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.delete({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
