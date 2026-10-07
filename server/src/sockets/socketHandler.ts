import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error'));
    }
    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Authentication error'));
    }
    socket.data.user = payload;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      // Clean up if needed
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}
