import { prisma } from '../utils/prisma';
import { getIO } from '../sockets/socketHandler';

interface LogActivityParams {
  projectId: string;
  userId: string;
  action: string;
  entityType: 'TASK' | 'COMMENT' | 'MEMBER' | 'PROJECT';
  entityId?: string;
  metadata?: Record<string, any>;
}

export async function logActivity({
  projectId,
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams) {
  try {
    const activity = await prisma.activity.create({
      data: {
        projectId,
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('activity:created', activity);
    }

    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
