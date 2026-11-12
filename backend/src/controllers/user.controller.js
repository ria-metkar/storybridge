import { Shipment } from '../models/Shipment.js';
import { AppError, notFoundError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/helpers.js';

const MAX_CHILDREN = 8;

export const listChildren = (req, res) => {
  res.json({ children: req.user.children });
};

export const addChild = asyncHandler(async (req, res) => {
  if (req.user.children.length >= MAX_CHILDREN) {
    throw new AppError(`You can add up to ${MAX_CHILDREN} children`, 400, 'LIMIT_REACHED');
  }
  req.user.children.push(req.body);
  await req.user.save();
  res.status(201).json({ child: req.user.children.at(-1) });
});

export const removeChild = asyncHandler(async (req, res) => {
  const child = req.user.children.id(req.validated.params.childId);
  if (!child) throw notFoundError('Child profile');
  child.deleteOne();
  await req.user.save();
  res.status(204).end();
});

export const listMyShipments = asyncHandler(async (req, res) => {
  const items = await Shipment.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('books', 'slug title languages coverColor coverEmoji audioCode')
    .lean();
  res.json({ items });
});
