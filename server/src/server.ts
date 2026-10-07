import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import { initSocket } from './sockets/socketHandler';
import { errorHandler } from './middleware/errorMiddleware';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import memberRoutes from './routes/memberRoutes';
import taskRoutes from './routes/taskRoutes';
import commentRoutes from './routes/commentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import activityRoutes from './routes/activityRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Initialize Socket.IO
initSocket(httpServer);

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

// Redirect root GET / directly to the React application UI
app.get('/', (req, res) => {
  res.redirect(CLIENT_URL);
});

// Public Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'TeamFlow API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', memberRoutes);
app.use('/api', taskRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);

// Error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 TeamFlow Server running on port ${PORT}`);
  });
}

export { app, httpServer };
