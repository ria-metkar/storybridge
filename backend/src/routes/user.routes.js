import { Router } from 'express';
import { addChild, listChildren, listMyShipments, removeChild } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { childParams, childSchema } from '../validators/subscription.validators.js';

const router = Router();

router.use(requireAuth);
router.get('/me/children', listChildren);
router.post('/me/children', validate({ body: childSchema }), addChild);
router.delete('/me/children/:childId', validate({ params: childParams }), removeChild);
router.get('/me/shipments', listMyShipments);

export default router;
