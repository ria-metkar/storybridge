import { z } from 'zod';
import { LANGUAGE_CODES } from '../constants/languages.js';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const languageCode = z.enum(LANGUAGE_CODES, {
  errorMap: () => ({ message: 'Unsupported language' }),
});

export const languagePair = z
  .object({ primary: languageCode, secondary: languageCode })
  .refine((p) => p.primary !== p.secondary, { message: 'Choose two different languages', path: ['secondary'] });

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes');

export const idParams = z.object({ id: objectId });
