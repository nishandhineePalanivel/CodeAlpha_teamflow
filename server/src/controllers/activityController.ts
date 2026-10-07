import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function getProjectActivities(req: AuthenticatedRequest, res: Response) {
  try {
    const { projectId } = req.params;

    const activities = await prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return sendSuccess(res, activities);
  } catch (error) {
    console.error('Get activities error:', error);
    return sendError(res, 'Failed to fetch project activity log', 500);
  }
}

export async function getUserRecentActivities(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const userProjects = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = userProjects.map((p) => p.projectId);

    const activities = await prisma.activity.findMany({
      where: {
        projectId: { in: projectIds },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return sendSuccess(res, activities);
  } catch (error) {
    console.error('Get recent activities error:', error);
    return sendError(res, 'Failed to fetch recent activity log', 500);
  }
}
