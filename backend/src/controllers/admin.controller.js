import { Book } from '../models/Book.js';
import { SHIPMENT_STATUSES, Shipment } from '../models/Shipment.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { AppError, notFoundError } from '../utils/AppError.js';
import { asyncHandler, languagePairFilter, periodOf } from '../utils/helpers.js';

export const getStats = asyncHandler(async (_req, res) => {
  const [customers, activeSubscriptions, books, pendingShipments, revenue] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Subscription.countDocuments({ status: 'active' }),
    Book.countDocuments(),
    Shipment.countDocuments({ status: 'pending' }),
    Subscription.aggregate([
      { $match: { status: 'active' } },
      { $lookup: { from: 'plans', localField: 'plan', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: null, total: { $sum: '$plan.priceCents' } } },
    ]),
  ]);
  res.json({
    customers,
    activeSubscriptions,
    books,
    pendingShipments,
    monthlyRecurringRevenueCents: revenue[0]?.total ?? 0,
  });
});

export const listSubscriptions = asyncHandler(async (_req, res) => {
  const items = await Subscription.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .populate('user', 'name email')
    .populate('plan', 'name booksPerMonth priceCents'); // not lean: keeps the hasAccess virtual
  res.json({ items });
});

export const listShipments = asyncHandler(async (req, res) => {
  const { status } = req.validated.query;
  const items = await Shipment.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(500)
    .populate('user', 'name email')
    .populate('books', 'title audioCode')
    .lean();
  res.json({ items });
});

/**
 * Builds this period's box for every active subscription: the next N books in the
 * family's language pair (age-matched to the linked child) that they haven't received yet.
 */
export const generateShipments = asyncHandler(async (req, res) => {
  const period = req.body.period || periodOf();
  const subscriptions = await Subscription.find({ status: 'active', currentPeriodEnd: { $gt: new Date() } })
    .populate('plan', 'booksPerMonth')
    .populate('user', 'children');

  let created = 0;
  const skipped = [];

  for (const sub of subscriptions) {
    const skip = (reason) => skipped.push({ subscription: sub._id, reason });

    if (await Shipment.exists({ subscription: sub._id, period })) {
      skip('Already generated for this period');
      continue;
    }

    const alreadySent = await Shipment.find({ subscription: sub._id }).distinct('books');
    const filter = { published: true, _id: { $nin: alreadySent }, ...languagePairFilter(sub.languages) };

    const child = sub.childId ? sub.user?.children?.id(sub.childId) : null;
    if (child?.birthYear) {
      const age = new Date().getFullYear() - child.birthYear;
      Object.assign(filter, { ageMin: { $lte: age }, ageMax: { $gte: age } });
    }

    const books = await Book.find(filter).sort({ createdAt: 1 }).limit(sub.plan.booksPerMonth).select('_id').lean();
    if (!books.length) {
      skip(`No unsent books for ${sub.languages.primary}/${sub.languages.secondary}`);
      continue;
    }

    try {
      await Shipment.create({
        subscription: sub._id,
        user: sub.user._id,
        period,
        books: books.map((b) => b._id),
        shippingAddress: sub.shippingAddress,
      });
      created += 1;
    } catch (err) {
      if (err.code !== 11000) throw err;
      skip('Already generated for this period');
    }
  }

  res.json({ period, created, skipped });
});

export const updateShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.validated.params.id);
  if (!shipment) throw notFoundError('Shipment');

  const { status, trackingNumber } = req.body;
  if (SHIPMENT_STATUSES.indexOf(status) < SHIPMENT_STATUSES.indexOf(shipment.status)) {
    throw new AppError(`Cannot move a ${shipment.status} shipment back to ${status}`, 400, 'BAD_STATE');
  }

  shipment.status = status;
  if (trackingNumber !== undefined) shipment.trackingNumber = trackingNumber;
  if (status !== 'pending' && !shipment.shippedAt) shipment.shippedAt = new Date();
  if (status === 'delivered' && !shipment.deliveredAt) shipment.deliveredAt = new Date();

  await shipment.save();
  res.json({ shipment });
});
