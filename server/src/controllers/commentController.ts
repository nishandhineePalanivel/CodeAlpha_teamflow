import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logActivity } from '../services/activityService';
import { createNotification } from '../services/notificationService';
import { getIO } from '../sockets/socketHandler';

export async function getComments(req: AuthenticatedRequest, res: Response) {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return sendSuccess(res, comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return sendError(res, 'Failed to fetch comments', 500);
  }
}

export async function createComment(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { taskId } = req.params;
    const { content } = req.body;

    if (!userId) return sendError(res, 'Unauthorized', 401);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) return sendError(res, 'Task not found', 404);

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    await logActivity({
      projectId: task.projectId,
      userId,
      action: `commented on "${task.title}"`,
      entityType: 'COMMENT',
      entityId: comment.id,
    });

    if (task.assigneeId && task.assigneeId !== userId) {
      await createNotification({
        userId: task.assigneeId,
        type: 'COMMENT_MENTION',
        title: 'New Comment on Assigned Task',
        message: `${comment.user.name} commented on "${task.title}"`,
        relatedTaskId: taskId,
        relatedProjectId: task.projectId,
      });
    }

    if (task.creatorId && task.creatorId !== userId && task.creatorId !== task.assigneeId) {
      await createNotification({
        userId: task.creatorId,
        type: 'COMMENT_MENTION',
        title: 'New Comment on Task You Created',
        message: `${comment.user.name} commented on "${task.title}"`,
        relatedTaskId: taskId,
        relatedProjectId: task.projectId,
      });
    }

    const io = getIO();
    if (io) {
      io.to(`project:${task.projectId}`).emit('comment:created', { ...comment, taskId });
    }

    return sendSuccess(res, comment, 'Comment added successfully', 201);
  } catch (error) {
    console.error('Create comment error:', error);
    return sendError(res, 'Failed to create comment', 500);
  }
}

export async function updateComment(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { content } = req.body;

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!existingComment) return sendError(res, 'Comment not found', 404);

    if (existingComment.userId !== userId) {
      return sendError(res, 'You can only edit your own comments', 403);
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    const io = getIO();
    if (io) {
      io.to(`project:${existingComment.task.projectId}`).emit('comment:updated', updatedComment);
    }

    return sendSuccess(res, updatedComment, 'Comment updated successfully');
  } catch (error) {
    console.error('Update comment error:', error);
    return sendError(res, 'Failed to update comment', 500);
  }
}

export async function deleteComment(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!existingComment) return sendError(res, 'Comment not found', 404);

    if (existingComment.userId !== userId) {
      return sendError(res, 'You can only delete your own comments', 403);
    }

    await prisma.comment.delete({ where: { id } });

    const io = getIO();
    if (io) {
      io.to(`project:${existingComment.task.projectId}`).emit('comment:deleted', { id, taskId: existingComment.taskId });
    }

    return sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error) {
    console.error('Delete comment error:', error);
    return sendError(res, 'Failed to delete comment', 500);
  }
}
