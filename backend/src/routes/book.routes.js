import { Router } from 'express';
import { getBook, getListenBook, listBooks } from '../controllers/book.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bookQuerySchema, listenParams } from '../validators/book.validators.js';

const router = Router();

router.get('/', validate({ query: bookQuerySchema }), listBooks);
router.get('/listen/:code', optionalAuth, validate({ params: listenParams }), getListenBook);
router.get('/:slug', getBook);

export default router;
