import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get active banners
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
    const banners = await prisma.companyBanner.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all banners (admin only)
router.get('/all', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const banners = await prisma.companyBanner.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create banner (admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, type, isActive, startDate, endDate, priority } = req.body;

    const banner = await prisma.companyBanner.create({
      data: {
        title,
        content,
        type: type || 'info',
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        priority: priority || 0
      }
    });

    res.status(201).json(banner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update banner (admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, type, isActive, startDate, endDate, priority } = req.body;

    const banner = await prisma.companyBanner.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(priority !== undefined && { priority })
      }
    });

    res.json(banner);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete banner (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.companyBanner.delete({
      where: { id }
    });

    res.json({ message: 'Banner deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
