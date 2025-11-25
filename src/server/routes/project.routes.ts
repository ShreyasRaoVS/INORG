import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all projects
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, teamId, departmentId } = req.query;

    const projects = await prisma.project.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(teamId && { teamId: teamId as string }),
        ...(departmentId && { departmentId: departmentId as string })
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        team: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, color: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } }
              }
            }
          }
        },
        department: { select: { id: true, name: true, color: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } }
          }
        },
        documents: {
          include: {
            uploader: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        gitRepos: true
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post('/', authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, status, priority, startDate, endDate, deadline, teamId, departmentId } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        creatorId: req.user!.id,
        teamId,
        departmentId
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        team: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, color: true } }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'PROJECT_CREATED',
        description: `Project "${name}" was created`,
        userId: req.user!.id,
        projectId: project.id
      }
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:id', authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, status, priority, startDate, endDate, deadline, progress, teamId, departmentId } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        progress,
        teamId,
        departmentId
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        team: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, color: true } }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'PROJECT_UPDATED',
        description: `Project "${project.name}" was updated`,
        userId: req.user!.id,
        projectId: project.id
      }
    });

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
