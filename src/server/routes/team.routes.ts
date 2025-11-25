import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all teams
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        department: { select: { id: true, name: true, color: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } }
          }
        },
        _count: { select: { projects: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        department: { select: { id: true, name: true, color: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
                role: true,
                skills: true
              }
            }
          }
        },
        projects: {
          include: {
            _count: { select: { tasks: true } }
          }
        }
      }
    });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    res.json(team);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create team
router.post('/', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, departmentId, memberIds } = req.body;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        departmentId,
        members: {
          create: memberIds?.map((userId: string) => ({
            userId,
            role: 'MEMBER'
          })) || []
        }
      },
      include: {
        department: { select: { id: true, name: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
          }
        }
      }
    });

    res.status(201).json(team);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update team
router.put('/:id', authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, departmentId } = req.body;

    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: { name, description, departmentId },
      include: {
        department: { select: { id: true, name: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
          }
        }
      }
    });

    res.json(team);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to team
router.post('/:id/members', authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.body;

    const member = await prisma.teamMember.create({
      data: {
        teamId: req.params.id,
        userId,
        role: role || 'MEMBER'
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } }
      }
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.teamMember.deleteMany({
      where: {
        teamId: req.params.id,
        userId: req.params.userId
      }
    });

    res.json({ message: 'Member removed from team successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete team
router.delete('/:id', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.team.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
