import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all tasks
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, assigneeId, status, priority } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId: projectId as string }),
        ...(assigneeId && { assigneeId: assigneeId as string }),
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any })
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        comments: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, estimatedHours, dueDate, projectId, assigneeId, tags } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        estimatedHours,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId,
        creatorId: req.user!.id,
        tags: tags || []
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'TASK_CREATED',
        description: `Task "${title}" was created`,
        userId: req.user!.id,
        projectId,
        taskId: task.id
      }
    });

    // Create notification for assignee
    if (assigneeId && assigneeId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${title}`,
          userId: assigneeId,
          metadata: { taskId: task.id, projectId }
        }
      });
    }

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, estimatedHours, actualHours, dueDate, assigneeId, tags } = req.body;

    const oldTask = await prisma.task.findUnique({ where: { id: req.params.id } });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        estimatedHours,
        actualHours,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
        tags,
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'TASK_UPDATED',
        description: `Task "${task.title}" was updated`,
        userId: req.user!.id,
        projectId: task.projectId,
        taskId: task.id
      }
    });

    // Notify if assignee changed
    if (assigneeId && assigneeId !== oldTask?.assigneeId) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'Task Reassigned',
          message: `You have been assigned to task: ${title}`,
          userId: assigneeId,
          metadata: { taskId: task.id, projectId: task.projectId }
        }
      });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: req.params.id,
        authorId: req.user!.id
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
