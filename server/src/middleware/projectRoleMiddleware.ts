import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { prisma } from '../utils/prisma';
import { sendError } from '../utils/apiResponse';

export interface ProjectRequest extends AuthenticatedRequest {
  projectMember?: {
    id: string;
    projectId: string;
    userId: string;
    role: string;
  };
}

export function requireProjectRole(allowedRoles: string[]) {
  return async (req: ProjectRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const projectId = req.params.projectId || req.params.id || req.body.projectId;

      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      if (!projectId) {
        return sendError(res, 'Project ID is required', 400);
      }

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

      if (!member) {
        return sendError(res, 'You are not a member of this project', 403);
      }

      if (!allowedRoles.includes(member.role)) {
        return sendError(res, 'Insufficient permissions for this action', 403);
      }

      req.projectMember = member;
      next();
    } catch (error) {
      console.error('Project role check error:', error);
      return sendError(res, 'Internal server error', 500);
    }
  };
}
