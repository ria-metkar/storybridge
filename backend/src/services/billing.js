import { addOneMonth } from '../utils/helpers.js';

/**
 * Mock payment provider. Replace with a real integration (e.g. Stripe
 * Subscriptions + webhooks) before taking real payments.
 */
export async function chargeSubscription({ user, plan }) {
  return {
    success: true,
    reference: `mock_${user._id}_${plan._id}_${Date.now()}`,
  };
}

/** Starts a fresh paid period from now. */
export async function startNewPeriod(subscription, { user, plan }) {
  const payment = await chargeSubscription({ user, plan });
  if (!payment.success) return false;
  const now = new Date();
  subscription.currentPeriodStart = now;
  subscription.currentPeriodEnd = addOneMonth(now);
  subscription.lastPaymentRef = payment.reference;
  return true;
}

/** Renews an active subscription whose period has ended (simulates recurring billing). */
export async function renewIfDue(subscription) {
  if (subscription.status !== 'active' || subscription.currentPeriodEnd > new Date()) return subscription;
  await subscription.populate(['plan', 'user']);
  const renewed = await startNewPeriod(subscription, { user: subscription.user, plan: subscription.plan });
  if (!renewed) subscription.status = 'paused';
  await subscription.save();
  return subscription;
}
