import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all chat rooms for current user
router.get('/rooms', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                status: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get or create direct chat room
router.post('/rooms/direct', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user!.id;

    if (userId === currentUserId) {
      res.status(400).json({ error: 'Cannot create chat room with yourself' });
      return;
    }

    // Check if room already exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        isGroup: false,
        AND: [
          { members: { some: { userId: currentUserId } } },
          { members: { some: { userId } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (existingRoom) {
      res.json(existingRoom);
      return;
    }

    // Create new room
    const room = await prisma.chatRoom.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId: currentUserId },
            { userId }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                status: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create group chat
router.post('/rooms/group', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, memberIds } = req.body;
    const currentUserId = req.user!.id;

    const allMemberIds = [...new Set([currentUserId, ...memberIds])];

    const room = await prisma.chatRoom.create({
      data: {
        name,
        isGroup: true,
        members: {
          create: allMemberIds.map(userId => ({ userId }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                status: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a room
router.get('/rooms/:roomId/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is member of room
    const membership = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        userId: req.user!.id
      }
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this room' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        roomId,
        ...(before && { createdAt: { lt: new Date(before as string) } })
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json(messages.reverse());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, roomId, receiverId, attachments } = req.body;
    const senderId = req.user!.id;

    if (roomId) {
      // Verify user is member of room
      const membership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId,
          userId: senderId
        }
      });

      if (!membership) {
        res.status(403).json({ error: 'You are not a member of this room' });
        return;
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        roomId,
        attachments: attachments || []
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update room timestamp
    if (roomId) {
      await prisma.chatRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() }
      });
    }

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.post('/rooms/:roomId/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    
    await prisma.chatRoomMember.updateMany({
      where: {
        roomId,
        userId: req.user!.id
      },
      data: {
        lastRead: new Date()
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: req.user!.id
          }
        }
      },
      include: {
        members: {
          where: {
            userId: req.user!.id
          }
        },
        messages: {
          where: {
            senderId: {
              not: req.user!.id
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    let unreadCount = 0;
    rooms.forEach(room => {
      const member = room.members[0];
      const lastMessage = room.messages[0];
      if (lastMessage && new Date(lastMessage.createdAt) > new Date(member.lastRead)) {
        unreadCount++;
      }
    });

    res.json({ unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search users for chat
router.get('/users/search', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: req.user!.id } },
          { status: 'ACTIVE' },
          {
            OR: [
              { firstName: { contains: q as string, mode: 'insensitive' } },
              { lastName: { contains: q as string, mode: 'insensitive' } },
              { email: { contains: q as string, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        department: {
          select: {
            name: true
          }
        }
      },
      take: 10
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
