import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all departments
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { members: true, teams: true, projects: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get department by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            role: true,
            status: true
          }
        },
        teams: {
          include: {
            _count: { select: { members: true, projects: true } }
          }
        },
        projects: {
          include: {
            _count: { select: { tasks: true } }
          }
        }
      }
    });

    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    res.json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create department
router.post('/', authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color, icon } = req.body;

    const department = await prisma.department.create({
      data: { name, description, color, icon }
    });

    res.status(201).json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update department
router.put('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color, icon } = req.body;

    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: { name, description, color, icon }
    });

    res.json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department
router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.department.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
