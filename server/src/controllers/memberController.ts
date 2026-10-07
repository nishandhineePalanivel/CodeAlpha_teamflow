import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { logActivity } from '../services/activityService';
import { createNotification } from '../services/notificationService';
import { getIO } from '../sockets/socketHandler';

export async function getMembers(req: AuthenticatedRequest, res: Response) {
  try {
    const { projectId } = req.params;

    const members = await prisma.projectMember.findMany({
      where: { projectId },
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
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return sendSuccess(res, members);
  } catch (error) {
    console.error('Get members error:', error);
    return sendError(res, 'Failed to fetch members', 500);
  }
}

export async function addMember(req: AuthenticatedRequest, res: Response) {
  try {
    const currentUserId = req.user?.userId;
    const { projectId } = req.params;
    const { email, role } = req.body;

    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!targetUser) {
      return sendError(res, 'User with this email not found', 404);
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return sendError(res, 'User is already a member of this project', 400);
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role: role || 'MEMBER',
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
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    if (currentUserId) {
      await logActivity({
        projectId,
        userId: currentUserId,
        action: `added ${targetUser.name} to project`,
        entityType: 'MEMBER',
        entityId: targetUser.id,
      });

      await createNotification({
        userId: targetUser.id,
        type: 'PROJECT_INVITE',
        title: 'Added to Project',
        message: `You were added to "${member.project.name}" as ${member.role}`,
        relatedProjectId: projectId,
      });
    }

    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('member:added', member);
    }

    return sendSuccess(res, member, 'Member added successfully', 201);
  } catch (error) {
    console.error('Add member error:', error);
    return sendError(res, 'Failed to add member', 500);
  }
}

export async function updateMemberRole(req: AuthenticatedRequest, res: Response) {
  try {
    const currentUserId = req.user?.userId;
    const { projectId, userId } = req.params;
    const { role } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (project?.ownerId === userId) {
      return sendError(res, 'Cannot change the project owner\'s role', 400);
    }

    const updatedMember = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      data: { role },
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

    if (currentUserId) {
      await logActivity({
        projectId,
        userId: currentUserId,
        action: `updated ${updatedMember.user.name}'s role to ${role}`,
        entityType: 'MEMBER',
        entityId: userId,
      });
    }

    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('member:updated', updatedMember);
    }

    return sendSuccess(res, updatedMember, 'Member role updated');
  } catch (error) {
    console.error('Update member role error:', error);
    return sendError(res, 'Failed to update member role', 500);
  }
}

export async function removeMember(req: AuthenticatedRequest, res: Response) {
  try {
    const currentUserId = req.user?.userId;
    const { projectId, userId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (project?.ownerId === userId) {
      return sendError(res, 'Cannot remove the project owner', 400);
    }

    const removedMember = await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (currentUserId) {
      await logActivity({
        projectId,
        userId: currentUserId,
        action: `removed ${removedMember.user.name} from project`,
        entityType: 'MEMBER',
        entityId: userId,
      });
    }

    const io = getIO();
    if (io) {
      io.to(`project:${projectId}`).emit('member:removed', { userId });
    }

    return sendSuccess(res, null, 'Member removed from project');
  } catch (error) {
    console.error('Remove member error:', error);
    return sendError(res, 'Failed to remove member', 500);
  }
}
