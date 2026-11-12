import { Router } from 'express';
import {
  createSubscription,
  getMySubscription,
  updateMySubscription,
} from '../controllers/subscription.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../validators/subscription.validators.js';

const router = Router();

router.use(requireAuth);
router.get('/me', getMySubscription);
router.post('/', validate({ body: createSubscriptionSchema }), createSubscription);
router.patch('/me', validate({ body: updateSubscriptionSchema }), updateMySubscription);

export default router;
