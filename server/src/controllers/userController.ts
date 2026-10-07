import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/hash';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { name, email, avatar, password } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing && existing.id !== userId) {
        return sendError(res, 'Email is already in use', 400);
      }
      updateData.email = email.toLowerCase();
    }
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password && password.trim().length > 0) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }
}
