import { Router } from 'express';
import {
  generateShipments,
  getStats,
  listShipments,
  listSubscriptions,
  updateShipment,
} from '../controllers/admin.controller.js';
import {
  adminGetBook,
  adminListBooks,
  createBook,
  deleteBook,
  updateBook,
} from '../controllers/book.controller.js';
import { adminListPlans, createPlan, updatePlan } from '../controllers/plan.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  generateShipmentsSchema,
  planSchema,
  shipmentQuerySchema,
  updateShipmentSchema,
} from '../validators/admin.validators.js';
import { bookSchema } from '../validators/book.validators.js';
import { idParams } from '../validators/common.js';

const router = Router();
const byId = validate({ params: idParams });

router.use(requireAuth, requireRole('admin'));

router.get('/stats', getStats);

router.get('/books', adminListBooks);
router.get('/books/:id', byId, adminGetBook);
router.post('/books', validate({ body: bookSchema }), createBook);
router.put('/books/:id', validate({ params: idParams, body: bookSchema }), updateBook);
router.delete('/books/:id', byId, deleteBook);

router.get('/plans', adminListPlans);
router.post('/plans', validate({ body: planSchema }), createPlan);
router.put('/plans/:id', validate({ params: idParams, body: planSchema }), updatePlan);

router.get('/subscriptions', listSubscriptions);

router.get('/shipments', validate({ query: shipmentQuerySchema }), listShipments);
router.post('/shipments/generate', validate({ body: generateShipmentsSchema }), generateShipments);
router.patch('/shipments/:id', validate({ params: idParams, body: updateShipmentSchema }), updateShipment);

export default router;
