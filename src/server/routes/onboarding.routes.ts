import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

// Get all onboarding records
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const records = await prisma.onboarding.findMany({
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

// Get onboarding by user ID
router.get('/user/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await prisma.onboarding.findUnique({
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
      res.status(404).json({ error: 'Onboarding record not found' });
      return;
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create onboarding record
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, assignedBuddy, checklistItems } = req.body;

    // Default checklist if not provided
    const defaultChecklist = [
      { id: 1, title: 'Complete personal profile', completed: false },
      { id: 2, title: 'Review company policies', completed: false },
      { id: 3, title: 'Setup workstation', completed: false },
      { id: 4, title: 'Meet team members', completed: false },
      { id: 5, title: 'Access granted to systems', completed: false },
      { id: 6, title: 'First week training completed', completed: false }
    ];

    const record = await prisma.onboarding.create({
      data: {
        userId,
        assignedBuddy,
        checklistItems: checklistItems || defaultChecklist,
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

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update onboarding record
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, checklistItems, assignedBuddy, notes } = req.body;

    const record = await prisma.onboarding.update({
      where: { id: req.params.id },
      data: {
        status,
        checklistItems,
        assignedBuddy,
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

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
