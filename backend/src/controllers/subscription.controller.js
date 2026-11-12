import { Plan } from '../models/Plan.js';
import { Subscription } from '../models/Subscription.js';
import { chargeSubscription, renewIfDue, startNewPeriod } from '../services/billing.js';
import { AppError, notFoundError } from '../utils/AppError.js';
import { addOneMonth, asyncHandler } from '../utils/helpers.js';

const LIVE_STATUSES = ['active', 'paused'];

async function findActivePlan(slug) {
  const plan = await Plan.findOne({ slug, active: true });
  if (!plan) throw notFoundError('Plan');
  return plan;
}

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findCurrentForUser(req.user._id);
  if (!subscription) return res.json({ subscription: null });
  await renewIfDue(subscription);
  await subscription.populate('plan');
  res.json({ subscription });
});

export const createSubscription = asyncHandler(async (req, res) => {
  const { planSlug, languages, childId, shippingAddress } = req.body;

  if (await Subscription.exists({ user: req.user._id, status: { $in: LIVE_STATUSES } })) {
    throw new AppError('You already have a subscription. Manage it from your account.', 409, 'ALREADY_SUBSCRIBED');
  }
  if (childId && !req.user.children.id(childId)) throw notFoundError('Child profile');

  const plan = await findActivePlan(planSlug);
  const payment = await chargeSubscription({ user: req.user, plan });
  if (!payment.success) throw new AppError('Payment was declined', 402, 'PAYMENT_FAILED');

  const now = new Date();
  const subscription = await Subscription.create({
    user: req.user._id,
    plan: plan._id,
    languages,
    childId,
    shippingAddress,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: addOneMonth(now),
    lastPaymentRef: payment.reference,
  });
  await subscription.populate('plan');
  res.status(201).json({ subscription });
});

export const updateMySubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id, status: { $in: LIVE_STATUSES } }).sort({
    createdAt: -1,
  });
  if (!subscription) throw new AppError('You do not have an active subscription', 404, 'NO_SUBSCRIPTION');

  const { action, planSlug, languages, shippingAddress } = req.body;

  if (planSlug) subscription.plan = (await findActivePlan(planSlug))._id; // takes effect from the next box
  if (languages) subscription.languages = languages;
  if (shippingAddress) subscription.shippingAddress = shippingAddress;

  if (action === 'pause') {
    if (subscription.status !== 'active') throw new AppError('Only active subscriptions can be paused', 400, 'BAD_STATE');
    subscription.status = 'paused';
    subscription.pausedAt = new Date();
  } else if (action === 'resume') {
    if (subscription.status !== 'paused') throw new AppError('Subscription is not paused', 400, 'BAD_STATE');
    if (subscription.currentPeriodEnd <= new Date()) {
      await subscription.populate('plan');
      const ok = await startNewPeriod(subscription, { user: req.user, plan: subscription.plan });
      if (!ok) throw new AppError('Payment was declined', 402, 'PAYMENT_FAILED');
    }
    subscription.status = 'active';
    subscription.pausedAt = undefined;
  } else if (action === 'cancel') {
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
  }

  await subscription.save();
  await subscription.populate('plan');
  res.json({ subscription });
});
