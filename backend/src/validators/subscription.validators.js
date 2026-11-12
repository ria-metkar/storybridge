import { z } from 'zod';
import { languageCode, languagePair, objectId, slug } from './common.js';

const req = (label, max = 120) => z.string().trim().min(1, `${label} is required`).max(max);

export const addressSchema = z.object({
  fullName: req('Full name', 80),
  line1: req('Address line 1', 120),
  line2: z.string().trim().max(120).optional(),
  city: req('City', 80),
  state: z.string().trim().max(80).optional(),
  postalCode: req('Postal code', 20),
  country: req('Country', 56),
});

export const createSubscriptionSchema = z.object({
  planSlug: slug,
  languages: languagePair,
  childId: objectId.optional(),
  shippingAddress: addressSchema,
});

export const updateSubscriptionSchema = z
  .object({
    action: z.enum(['pause', 'resume', 'cancel']).optional(),
    planSlug: slug.optional(),
    languages: languagePair.optional(),
    shippingAddress: addressSchema.optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: 'Nothing to update' });

const currentYear = new Date().getFullYear();

export const childSchema = z
  .object({
    name: req('Name', 50),
    birthYear: z
      .number()
      .int()
      .min(currentYear - 14, 'Our books are for children up to 12')
      .max(currentYear, 'Birth year cannot be in the future')
      .optional(),
    primaryLanguage: languageCode,
    secondaryLanguage: languageCode,
  })
  .refine((c) => c.primaryLanguage !== c.secondaryLanguage, {
    message: 'Choose two different languages',
    path: ['secondaryLanguage'],
  });

export const childParams = z.object({ childId: objectId });
