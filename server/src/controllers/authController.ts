import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 'User with this email already exists', 400);
    }

    const passwordHash = await hashPassword(password);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return sendSuccess(res, { user, token }, 'Registration successful', 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Failed to register user', 500);
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Failed to log in', 500);
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    console.error('Get me error:', error);
    return sendError(res, 'Failed to get user details', 500);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  return sendSuccess(res, null, 'Logged out successfully');
}
