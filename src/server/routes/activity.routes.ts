import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get activities
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, projectId, taskId, type, limit = '50' } = req.query;

    const activities = await prisma.activity.findMany({
      where: {
        ...(userId && { userId: userId as string }),
        ...(projectId && { projectId: projectId as string }),
        ...(taskId && { taskId: taskId as string }),
        ...(type && { type: type as any })
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        project: {
          select: { id: true, name: true }
        },
        task: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity feed (combined view)
router.get('/feed', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '20' } = req.query;

    // Get user's departments and teams to show relevant activities
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        teamMemberships: {
          select: { teamId: true }
        }
      }
    });

    const teamIds = user?.teamMemberships.map(tm => tm.teamId) || [];

    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { userId: req.user!.id },
          { project: { teamId: { in: teamIds } } },
          { project: { departmentId: user?.departmentId || undefined } }
        ]
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        project: {
          select: { id: true, name: true }
        },
        task: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
