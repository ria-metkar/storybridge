import mongoose from 'mongoose';
import { addressSchema } from './Subscription.js';

export const SHIPMENT_STATUSES = ['pending', 'shipped', 'delivered'];

const shipmentSchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    period: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    status: { type: String, enum: SHIPMENT_STATUSES, default: 'pending', index: true },
    trackingNumber: { type: String, trim: true },
    shippedAt: Date,
    deliveredAt: Date,
    shippingAddress: { type: addressSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

shipmentSchema.index({ subscription: 1, period: 1 }, { unique: true });

export const Shipment = mongoose.model('Shipment', shipmentSchema);
