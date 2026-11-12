import { z } from 'zod';
import { languageCode, languagePair, slug } from './common.js';

const optionalUrl = z.union([z.literal(''), z.string().trim().url('Must be a valid URL')]).optional();

const lineSchema = z
  .object({
    lang: languageCode,
    text: z.string().trim().min(1, 'Line text is required').max(500),
    start: z.number().nonnegative().optional(),
    end: z.number().nonnegative().optional(),
  })
  .refine((l) => l.start === undefined || l.end === undefined || l.end > l.start, {
    message: 'Line end time must be after its start time',
    path: ['end'],
  });

const pageSchema = z.object({
  number: z.number().int().positive(),
  illustration: z.string().trim().max(500).optional().default(''),
  audioUrl: optionalUrl.default(''),
  lines: z.array(lineSchema).min(1, 'Each page needs at least one line').max(20),
});

export const bookSchema = z
  .object({
    slug,
    title: z.object({
      primary: z.string().trim().min(1).max(150),
      secondary: z.string().trim().min(1).max(150),
    }),
    languages: languagePair,
    author: z.string().trim().min(1).max(120),
    illustrator: z.string().trim().max(120).optional(),
    narrator: z.string().trim().max(120).optional(),
    summary: z.string().trim().max(2000).optional(),
    ageMin: z.number().int().min(0).max(12),
    ageMax: z.number().int().min(0).max(12),
    coverColor: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a hex colour like #f4a261').optional(),
    coverEmoji: z.string().trim().max(16).optional(),
    audioCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9-]{3,24}$/, 'Audio code: 3–24 letters, numbers or dashes'),
    isSample: z.boolean().default(false),
    published: z.boolean().default(true),
    pages: z.array(pageSchema).min(1, 'A book needs at least one page').max(60),
  })
  .refine((b) => b.ageMax >= b.ageMin, { message: 'Max age must be ≥ min age', path: ['ageMax'] })
  .superRefine((b, ctx) => {
    const allowed = new Set([b.languages.primary, b.languages.secondary]);
    b.pages.forEach((page, p) =>
      page.lines.forEach((line, l) => {
        if (!allowed.has(line.lang)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Page ${page.number}: line language "${line.lang}" is not one of the book's languages`,
            path: ['pages', p, 'lines', l, 'lang'],
          });
        }
      }),
    );
  });

export const bookQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  lang: languageCode.optional(),
  age: z.coerce.number().int().min(0).max(12).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const listenParams = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,24}$/, 'That code does not look right'),
});
