import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

// Get all offboarding records
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const records = await prisma.offboarding.findMany({
      where: {
        ...(status && { status: status as any })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            department: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get offboarding by user ID
router.get('/user/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await prisma.offboarding.findUnique({
      where: { userId: req.params.userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            department: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!record) {
      res.status(404).json({ error: 'Offboarding record not found' });
      return;
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create offboarding record
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, reason, lastWorkingDay } = req.body;

    // Default checklist
    const defaultChecklist = [
      { id: 1, title: 'Exit interview scheduled', completed: false },
      { id: 2, title: 'Knowledge transfer completed', completed: false },
      { id: 3, title: 'Return company assets', completed: false },
      { id: 4, title: 'Revoke system access', completed: false },
      { id: 5, title: 'Clear pending tasks', completed: false },
      { id: 6, title: 'Final payroll processed', completed: false }
    ];

    const record = await prisma.offboarding.create({
      data: {
        userId,
        reason,
        lastWorkingDay: new Date(lastWorkingDay),
        checklistItems: defaultChecklist,
        status: 'IN_PROGRESS'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'OFFBOARDING' }
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update offboarding record
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, checklistItems, exitInterviewCompleted, assetsReturned, accessRevoked, notes } = req.body;

    const record = await prisma.offboarding.update({
      where: { id: req.params.id },
      data: {
        status,
        checklistItems,
        exitInterviewCompleted,
        assetsReturned,
        accessRevoked,
        notes,
        ...(status === 'COMPLETED' && { completedDate: new Date() })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // If completed, update user status to inactive
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: record.userId },
        data: { status: 'INACTIVE' }
      });
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
