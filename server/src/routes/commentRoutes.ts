import { Router } from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createCommentSchema, updateCommentSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/tasks/:taskId/comments', getComments);
router.post('/tasks/:taskId/comments', validate(createCommentSchema), createComment);
router.patch('/comments/:id', validate(updateCommentSchema), updateComment);
router.delete('/comments/:id', deleteComment);

export default router;
