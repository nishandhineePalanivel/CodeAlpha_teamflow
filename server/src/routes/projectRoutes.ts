import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} from '../controllers/projectController';
import { authenticate } from '../middleware/authMiddleware';
import { requireProjectRole } from '../middleware/projectRoleMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createProjectSchema, updateProjectSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', validate(createProjectSchema), createProject);
router.get('/:id', getProjectById);
router.patch('/:id', requireProjectRole(['OWNER', 'ADMIN']), validate(updateProjectSchema), updateProject);
router.delete('/:id', requireProjectRole(['OWNER']), deleteProject);
router.get('/:projectId/stats', requireProjectRole(['OWNER', 'ADMIN', 'MEMBER']), getProjectStats);

export default router;
