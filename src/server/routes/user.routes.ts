import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all users
router.get('/', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, role, status, search } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(department && { departmentId: department as string }),
        ...(role && { role: role as any }),
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        skills: true,
        joinDate: true,
        department: { select: { id: true, name: true, color: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        role: true,
        status: true,
        skills: true,
        bio: true,
        joinDate: true,
        lastActive: true,
        department: { select: { id: true, name: true, color: true } },
        teamMemberships: {
          include: {
            team: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, role, status, skills, bio, departmentId } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        phone,
        role,
        status,
        skills,
        bio,
        departmentId
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        skills: true,
        department: { select: { id: true, name: true } }
      }
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update dashboard layout
router.put('/dashboard-layout', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { layout } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { dashboardLayout: layout },
      select: {
        id: true,
        dashboardLayout: true
      }
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard layout
router.get('/dashboard-layout', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        dashboardLayout: true
      }
    });

    res.json(user?.dashboardLayout || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
