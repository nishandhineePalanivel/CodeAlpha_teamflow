import { prisma } from '../utils/prisma';
import { getIO } from '../sockets/socketHandler';

interface CreateNotificationParams {
  userId: string;
  type: 'TASK_ASSIGNED' | 'PROJECT_INVITE' | 'COMMENT_MENTION' | 'TASK_UPDATE';
  title: string;
  message: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedTaskId,
  relatedProjectId,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedTaskId,
        relatedProjectId,
      },
    });

    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification:created', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
