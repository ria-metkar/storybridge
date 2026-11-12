import mongoose from 'mongoose';
import { LANGUAGE_CODES } from '../constants/languages.js';

export const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    languages: {
      primary: { type: String, enum: LANGUAGE_CODES, required: true },
      secondary: { type: String, enum: LANGUAGE_CODES, required: true },
    },
    childId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active', index: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    pausedAt: Date,
    cancelledAt: Date,
    lastPaymentRef: String,
    shippingAddress: { type: addressSchema, required: true },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

/** Audio stays unlocked for the period the customer has already paid for, whatever the status. */
subscriptionSchema.virtual('hasAccess').get(function hasAccess() {
  return this.currentPeriodEnd > new Date();
});

subscriptionSchema.statics.findCurrentForUser = function findCurrentForUser(userId) {
  return this.findOne({ user: userId }).sort({ createdAt: -1 });
};

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
