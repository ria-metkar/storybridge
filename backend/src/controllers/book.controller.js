import { Book } from '../models/Book.js';
import { Subscription } from '../models/Subscription.js';
import { renewIfDue } from '../services/billing.js';
import { AppError, notFoundError } from '../utils/AppError.js';
import { asyncHandler, escapeRegex } from '../utils/helpers.js';

/** The audio code is printed inside the physical book; only expose it publicly for free samples. */
function toPublic(book) {
  const { audioCode, pages, ...rest } = book;
  return book.isSample ? { ...rest, audioCode } : rest;
}

export const listBooks = asyncHandler(async (req, res) => {
  const { q, lang, age, page, limit } = req.validated.query;
  const filter = { published: true };
  const and = [];

  if (lang) and.push({ $or: [{ 'languages.primary': lang }, { 'languages.secondary': lang }] });
  if (age !== undefined) Object.assign(filter, { ageMin: { $lte: age }, ageMax: { $gte: age } });
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    and.push({ $or: [{ 'title.primary': rx }, { 'title.secondary': rx }, { author: rx }] });
  }
  if (and.length) filter.$and = and;

  const [items, total] = await Promise.all([
    Book.find(filter)
      .select('-pages')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Book.countDocuments(filter),
  ]);

  res.json({ items: items.map(toPublic), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ slug: req.params.slug, published: true }).select('-pages').lean();
  if (!book) throw notFoundError('Book');
  res.json({ book: toPublic(book) });
});

/** Full book with pages + synced narration, unlocked by the code printed in the physical book. */
export const getListenBook = asyncHandler(async (req, res) => {
  const { code } = req.validated.params;
  const book = await Book.findOne({ audioCode: code, published: true }).lean();
  if (!book) {
    throw new AppError(
      'No story matches that code. Check the code printed inside the back cover.',
      404,
      'BOOK_NOT_FOUND',
    );
  }

  if (!book.isSample && req.user?.role !== 'admin') {
    if (!req.user) throw new AppError('Log in to listen to this story', 401, 'UNAUTHENTICATED');
    const subscription = await Subscription.findCurrentForUser(req.user._id);
    if (subscription) await renewIfDue(subscription);
    if (!subscription?.hasAccess) {
      throw new AppError('An active subscription is needed to play this story', 403, 'SUBSCRIPTION_REQUIRED');
    }
  }

  res.json({ book });
});

// ---- Admin ----

export const adminListBooks = asyncHandler(async (_req, res) => {
  const items = await Book.find().select('-pages').sort({ createdAt: -1 }).lean();
  res.json({ items });
});

export const adminGetBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.validated.params.id).lean();
  if (!book) throw notFoundError('Book');
  res.json({ book });
});

export const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json({ book });
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.validated.params.id);
  if (!book) throw notFoundError('Book');
  book.set(req.body);
  await book.save();
  res.json({ book });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.validated.params.id);
  if (!book) throw notFoundError('Book');
  res.status(204).end();
});
