import { Router } from 'express';
import {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';
import { requireProjectRole } from '../middleware/projectRoleMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/my-tasks', getMyTasks);
router.get('/projects/:projectId/tasks', requireProjectRole(['OWNER', 'ADMIN', 'MEMBER']), getTasks);
router.post('/projects/:projectId/tasks', requireProjectRole(['OWNER', 'ADMIN', 'MEMBER']), validate(createTaskSchema), createTask);
router.get('/tasks/:id', getTaskById);
router.patch('/tasks/:id', validate(updateTaskSchema), updateTask);
router.patch('/tasks/:id/move', validate(moveTaskSchema), moveTask);
router.delete('/tasks/:id', deleteTask);

export default router;
