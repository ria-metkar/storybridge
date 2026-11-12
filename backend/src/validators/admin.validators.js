import { z } from 'zod';
import { slug } from './common.js';
import { SHIPMENT_STATUSES } from '../models/Shipment.js';

export const planSchema = z.object({
  slug,
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500).optional(),
  priceCents: z.number().int().min(0),
  booksPerMonth: z.number().int().min(1).max(10),
  features: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const generateShipmentsSchema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Period must look like 2026-11')
    .optional(),
});

export const updateShipmentSchema = z.object({
  status: z.enum(SHIPMENT_STATUSES),
  trackingNumber: z.string().trim().max(60).optional(),
});

export const shipmentQuerySchema = z.object({
  status: z.enum(SHIPMENT_STATUSES).optional(),
});
