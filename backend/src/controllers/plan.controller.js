import { Plan } from '../models/Plan.js';
import { notFoundError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/helpers.js';

export const listPlans = asyncHandler(async (_req, res) => {
  const items = await Plan.find({ active: true }).sort({ sortOrder: 1, priceCents: 1 }).lean();
  res.json({ items });
});

export const adminListPlans = asyncHandler(async (_req, res) => {
  const items = await Plan.find().sort({ sortOrder: 1, priceCents: 1 }).lean();
  res.json({ items });
});

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.create(req.body);
  res.status(201).json({ plan });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.validated.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw notFoundError('Plan');
  res.json({ plan });
});
