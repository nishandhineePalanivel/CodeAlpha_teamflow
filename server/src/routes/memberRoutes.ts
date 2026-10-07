import { Router } from 'express';
import {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from '../controllers/memberController';
import { authenticate } from '../middleware/authMiddleware';
import { requireProjectRole } from '../middleware/projectRoleMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { addMemberSchema, updateMemberRoleSchema } from '../validators';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/projects/:projectId/members', requireProjectRole(['OWNER', 'ADMIN', 'MEMBER']), getMembers);
router.post('/projects/:projectId/members', requireProjectRole(['OWNER', 'ADMIN']), validate(addMemberSchema), addMember);
router.patch('/projects/:projectId/members/:userId', requireProjectRole(['OWNER']), validate(updateMemberRoleSchema), updateMemberRole);
router.delete('/projects/:projectId/members/:userId', requireProjectRole(['OWNER', 'ADMIN']), removeMember);

export default router;
