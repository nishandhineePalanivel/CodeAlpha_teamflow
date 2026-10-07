import { Router } from 'express';
import {
  getProjectActivities,
  getUserRecentActivities,
} from '../controllers/activityController';
import { authenticate } from '../middleware/authMiddleware';
import { requireProjectRole } from '../middleware/projectRoleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/recent', getUserRecentActivities);
router.get('/projects/:projectId/activity', requireProjectRole(['OWNER', 'ADMIN', 'MEMBER']), getProjectActivities);

export default router;
