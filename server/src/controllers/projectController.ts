import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logActivity } from '../services/activityService';
import { getIO } from '../sockets/socketHandler';

export async function getProjects(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
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
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedProjects = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        ownerId: p.ownerId,
        owner: p.owner,
        members: p.members,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        progress,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return sendSuccess(res, formattedProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    return sendError(res, 'Failed to fetch projects', 500);
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return sendError(res, 'Unauthorized', 401);

    const project = await prisma.project.findFirst({
      where: {
        id,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
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
        },
        labels: true,
      },
    });

    if (!project) {
      return sendError(res, 'Project not found or access denied', 404);
    }

    const currentMember = project.members.find((m) => m.userId === userId);

    return sendSuccess(res, {
      ...project,
      currentUserRole: currentMember?.role || 'MEMBER',
    });
  } catch (error) {
    console.error('Get project by id error:', error);
    return sendError(res, 'Failed to fetch project', 500);
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { name, description, color } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#6366F1',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        labels: {
          createMany: {
            data: [
              { name: 'Feature', color: '#3B82F6' },
              { name: 'Bug', color: '#EF4444' },
              { name: 'Design', color: '#EC4899' },
              { name: 'Documentation', color: '#10B981' },
            ],
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
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
        },
        labels: true,
      },
    });

    await logActivity({
      projectId: project.id,
      userId,
      action: 'created project',
      entityType: 'PROJECT',
      entityId: project.id,
      metadata: { projectName: project.name },
    });

    return sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    console.error('Create project error:', error);
    return sendError(res, 'Failed to create project', 500);
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, description, color } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(color ? { color } : {}),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
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
        },
      },
    });

    if (userId) {
      await logActivity({
        projectId: project.id,
        userId,
        action: 'updated project settings',
        entityType: 'PROJECT',
        entityId: project.id,
      });
    }

    const io = getIO();
    if (io) {
      io.to(`project:${project.id}`).emit('project:updated', project);
    }

    return sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    console.error('Update project error:', error);
    return sendError(res, 'Failed to update project', 500);
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id },
    });

    const io = getIO();
    if (io) {
      io.to(`project:${id}`).emit('project:deleted', { id });
    }

    return sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    console.error('Delete project error:', error);
    return sendError(res, 'Failed to delete project', 500);
  }
}

export async function getProjectStats(req: AuthenticatedRequest, res: Response) {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW').length;
    const doneTasks = tasks.filter((t) => t.status === 'DONE').length;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const progressPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return sendSuccess(res, {
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks,
      doneTasks,
      overdueTasks,
      progressPercentage,
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    return sendError(res, 'Failed to fetch project stats', 500);
  }
}
