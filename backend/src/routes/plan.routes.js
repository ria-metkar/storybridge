import { Router } from 'express';
import { listPlans } from '../controllers/plan.controller.js';

const router = Router();

router.get('/', listPlans);

export default router;
