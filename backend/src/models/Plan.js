import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priceCents: { type: Number, required: true, min: 0 },
    booksPerMonth: { type: Number, required: true, min: 1, max: 10 },
    features: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

export const Plan = mongoose.model('Plan', planSchema);
