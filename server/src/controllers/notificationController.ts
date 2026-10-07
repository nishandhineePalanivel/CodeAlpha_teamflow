import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return sendError(res, 'Failed to fetch notifications', 500);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return sendError(res, 'Unauthorized', 401);

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) return sendError(res, 'Notification not found', 404);

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification read error:', error);
    return sendError(res, 'Failed to update notification', 500);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all read error:', error);
    return sendError(res, 'Failed to update notifications', 500);
  }
}
