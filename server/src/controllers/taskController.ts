import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logActivity } from '../services/activityService';
import { createNotification } from '../services/notificationService';
import { getIO } from '../sockets/socketHandler';

export async function getTasks(req: AuthenticatedRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId, search, sortBy, sortOrder } = req.query;

    const where: any = { projectId };

    if (status) {
      where.status = status as string;
    }
    if (priority) {
      where.priority = priority as string;
    }
    if (assigneeId) {
      where.assigneeId = assigneeId as string;
    }
    if (search) {
      const query = (search as string).toLowerCase();
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }

    let orderBy: any = { position: 'asc' };
    if (sortBy === 'dueDate') {
      orderBy = { dueDate: sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy === 'priority') {
      orderBy = { priority: sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder === 'desc' ? 'desc' : 'asc' };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    const formatted = tasks.map((t) => ({
      ...t,
      labels: t.labels.map((tl) => tl.label),
      commentCount: t._count.comments,
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    console.error('Get tasks error:', error);
    return sendError(res, 'Failed to fetch tasks', 500);
  }
}

export async function getMyTasks(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const formatted = tasks.map((t) => ({
      ...t,
      labels: t.labels.map((tl) => tl.label),
      commentCount: t._count.comments,
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    console.error('Get my tasks error:', error);
    return sendError(res, 'Failed to fetch user tasks', 500);
  }
}

export async function getTaskById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          include: { label: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) return sendError(res, 'Task not found', 404);

    return sendSuccess(res, {
      ...task,
      labels: task.labels.map((tl) => tl.label),
    });
  } catch (error) {
    console.error('Get task by id error:', error);
    return sendError(res, 'Failed to fetch task', 500);
  }
}

export async function createTask(req: AuthenticatedRequest, res: Response) {
  try {
    const creatorId = req.user?.userId;
    const { projectId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate, position, labelIds } = req.body;

    if (!creatorId) return sendError(res, 'Unauthorized', 401);

    let taskPosition = position;
    if (taskPosition === undefined) {
      const lastTask = await prisma.task.findFirst({
        where: { projectId, status: status || 'TODO' },
        orderBy: { position: 'desc' },
      });
      taskPosition = lastTask ? lastTask.position + 1000 : 1000;
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        assigneeId: assigneeId || null,
        creatorId,
        dueDate: dueDate ? new Date(dueDate) : null,
        position: taskPosition,
        ...(labelIds && labelIds.length > 0
          ? {
              labels: {
                create: labelIds.map((labelId: string) => ({ labelId })),
              },
            }
          : {}),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          include: { label: true },
        },
      },
    });

    const formattedTask = {
      ...task,
      labels: task.labels.map((tl) => tl.label),
      commentCount: 0,
    };

    await logActivity({
      projectId,
      userId: creatorId,
      action: `created task "${task.title}"`,
      entityType: 'TASK',
      entityId: task.id,
    });

    if (assigneeId && assigneeId !== creatorId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      await createNotification({
        userId: assigneeId,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned to You',
        message: `You were assigned "${task.title}" in ${project?.name || 'a project'}`,
        relatedTaskId: task.id,
        relatedProjectId: projectId,
      });
    }

    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('task:created', formattedTask);
    }

    return sendSuccess(res, formattedTask, 'Task created successfully', 201);
  } catch (error) {
    console.error('Create task error:', error);
    return sendError(res, 'Failed to create task', 500);
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate, position, labelIds } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return sendError(res, 'Task not found', 404);

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (position !== undefined) data.position = position;

    if (labelIds !== undefined) {
      await prisma.taskLabel.deleteMany({ where: { taskId: id } });
      if (labelIds.length > 0) {
        data.labels = {
          create: labelIds.map((labelId: string) => ({ labelId })),
        };
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    const formattedTask = {
      ...updatedTask,
      labels: updatedTask.labels.map((tl) => tl.label),
      commentCount: updatedTask._count.comments,
    };

    if (userId) {
      await logActivity({
        projectId: existingTask.projectId,
        userId,
        action: `updated task "${updatedTask.title}"`,
        entityType: 'TASK',
        entityId: id,
      });

      if (assigneeId && assigneeId !== existingTask.assigneeId && assigneeId !== userId) {
        const project = await prisma.project.findUnique({ where: { id: existingTask.projectId } });
        await createNotification({
          userId: assigneeId,
          type: 'TASK_ASSIGNED',
          title: 'Task Assigned to You',
          message: `You were assigned "${updatedTask.title}" in ${project?.name || 'a project'}`,
          relatedTaskId: id,
          relatedProjectId: existingTask.projectId,
        });
      }
    }

    const io = getIO();
    if (io) {
      io.to(`project:${existingTask.projectId}`).emit('task:updated', formattedTask);
    }

    return sendSuccess(res, formattedTask, 'Task updated successfully');
  } catch (error) {
    console.error('Update task error:', error);
    return sendError(res, 'Failed to update task', 500);
  }
}

export async function moveTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status, position } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return sendError(res, 'Task not found', 404);

    const oldStatus = existingTask.status;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        position,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    const formattedTask = {
      ...updatedTask,
      labels: updatedTask.labels.map((tl) => tl.label),
      commentCount: updatedTask._count.comments,
    };

    if (userId) {
      const statusText = oldStatus !== status ? `from ${oldStatus.replace('_', ' ')} to ${status.replace('_', ' ')}` : 'position';
      await logActivity({
        projectId: existingTask.projectId,
        userId,
        action: `moved "${updatedTask.title}" ${statusText}`,
        entityType: 'TASK',
        entityId: id,
      });

      if (updatedTask.assigneeId && updatedTask.assigneeId !== userId && oldStatus !== status) {
        await createNotification({
          userId: updatedTask.assigneeId,
          type: 'TASK_UPDATE',
          title: 'Task Status Updated',
          message: `"${updatedTask.title}" status changed to ${status.replace('_', ' ')}`,
          relatedTaskId: id,
          relatedProjectId: existingTask.projectId,
        });
      }
    }

    const io = getIO();
    if (io) {
      io.to(`project:${existingTask.projectId}`).emit('task:moved', formattedTask);
    }

    return sendSuccess(res, formattedTask, 'Task moved successfully');
  } catch (error) {
    console.error('Move task error:', error);
    return sendError(res, 'Failed to move task', 500);
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return sendError(res, 'Task not found', 404);

    await prisma.task.delete({ where: { id } });

    if (userId) {
      await logActivity({
        projectId: existingTask.projectId,
        userId,
        action: `deleted task "${existingTask.title}"`,
        entityType: 'TASK',
        entityId: id,
      });
    }

    const io = getIO();
    if (io) {
      io.to(`project:${existingTask.projectId}`).emit('task:deleted', { id, projectId: existingTask.projectId });
    }

    return sendSuccess(res, null, 'Task deleted successfully');
  } catch (error) {
    console.error('Delete task error:', error);
    return sendError(res, 'Failed to delete task', 500);
  }
}
