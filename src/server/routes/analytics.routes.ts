import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

const router = Router();

router.use(authenticate);

// Get dashboard analytics
router.get('/dashboard', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, departmentId, teamId, period = '30' } = req.query;
    
    const daysAgo = parseInt(period as string);
    const startDate = subDays(new Date(), daysAgo);

    // Task statistics
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      where: {
        ...(userId && { assigneeId: userId as string }),
        ...(departmentId && { project: { departmentId: departmentId as string } }),
        ...(teamId && { project: { teamId: teamId as string } }),
        createdAt: { gte: startDate }
      },
      _count: true
    });

    // Project statistics
    const projectStats = await prisma.project.groupBy({
      by: ['status'],
      where: {
        ...(departmentId && { departmentId: departmentId as string }),
        ...(teamId && { teamId: teamId as string }),
        createdAt: { gte: startDate }
      },
      _count: true
    });

    // Productivity metrics
    const productivityData = await prisma.productivityMetric.findMany({
      where: {
        date: { gte: startDate },
        ...(userId && { userId: userId as string }),
        ...(departmentId && { departmentId: departmentId as string }),
        ...(teamId && { teamId: teamId as string })
      },
      orderBy: { date: 'asc' }
    });

    // Team activity
    const recentActivities = await prisma.activity.findMany({
      where: {
        ...(userId && { userId: userId as string }),
        ...(departmentId && { project: { departmentId: departmentId as string } }),
        ...(teamId && { project: { teamId: teamId as string } }),
        createdAt: { gte: startDate }
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      taskStats,
      projectStats,
      productivityData,
      recentActivities
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get team performance
router.get('/team-performance', authorize('ADMIN', 'MANAGER', 'TEAM_LEAD'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { teamId, startDate, endDate } = req.query;

    const team = await prisma.team.findUnique({
      where: { id: teamId as string },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const memberIds = team.members.map(m => m.userId);

    // Get tasks completed by team members
    const tasksCompleted = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        assigneeId: { in: memberIds },
        status: 'COMPLETED',
        completedAt: {
          gte: startDate ? new Date(startDate as string) : subDays(new Date(), 30),
          lte: endDate ? new Date(endDate as string) : new Date()
        }
      },
      _count: true,
      _sum: { actualHours: true }
    });

    res.json({
      team,
      tasksCompleted
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get department analytics
router.get('/department/:id', authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { members: true, teams: true, projects: true }
        }
      }
    });

    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    // Active members
    const activeMembers = await prisma.user.count({
      where: {
        departmentId: req.params.id,
        status: 'ACTIVE'
      }
    });

    // Project status breakdown
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      where: { departmentId: req.params.id },
      _count: true
    });

    // Task completion rate
    const totalTasks = await prisma.task.count({
      where: { project: { departmentId: req.params.id } }
    });

    const completedTasks = await prisma.task.count({
      where: {
        project: { departmentId: req.params.id },
        status: 'COMPLETED'
      }
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      department,
      activeMembers,
      projectsByStatus,
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: completionRate.toFixed(2)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user productivity
router.get('/user/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period as string);
    const startDate = subDays(new Date(), daysAgo);

    // Tasks assigned vs completed
    const tasksAssigned = await prisma.task.count({
      where: {
        assigneeId: userId,
        createdAt: { gte: startDate }
      }
    });

    const tasksCompleted = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: 'COMPLETED',
        completedAt: { gte: startDate }
      }
    });

    // Average completion time
    const completedTasksWithTime = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: 'COMPLETED',
        completedAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    let avgCompletionDays = 0;
    if (completedTasksWithTime.length > 0) {
      const totalDays = completedTasksWithTime.reduce((sum, task) => {
        const days = Math.ceil((task.completedAt!.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgCompletionDays = totalDays / completedTasksWithTime.length;
    }

    // Productivity metrics
    const metrics = await prisma.productivityMetric.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      tasksAssigned,
      tasksCompleted,
      completionRate: tasksAssigned > 0 ? ((tasksCompleted / tasksAssigned) * 100).toFixed(2) : 0,
      avgCompletionDays: avgCompletionDays.toFixed(1),
      metrics
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
