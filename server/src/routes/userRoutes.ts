import { Router } from 'express';
import { updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { updateProfileSchema } from '../validators';

const router = Router();

router.use(authenticate);
router.patch('/me', validate(updateProfileSchema), updateProfile);

export default router;
