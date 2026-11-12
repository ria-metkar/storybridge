import mongoose from 'mongoose';
import { LANGUAGE_CODES } from '../constants/languages.js';

/**
 * One narrated line on a page. `start`/`end` are seconds into the page's
 * audio file and drive the read-along highlighting. Without recorded audio
 * the player falls back to on-device speech synthesis.
 */
const lineSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: LANGUAGE_CODES, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    start: { type: Number, min: 0 },
    end: { type: Number, min: 0 },
  },
  { _id: false },
);

const pageSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, min: 1 },
    illustration: { type: String, trim: true, default: '' },
    audioUrl: { type: String, trim: true, default: '' },
    lines: { type: [lineSchema], default: [] },
  },
  { _id: false },
);

const bookSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: {
      primary: { type: String, required: true, trim: true },
      secondary: { type: String, required: true, trim: true },
    },
    languages: {
      primary: { type: String, enum: LANGUAGE_CODES, required: true },
      secondary: { type: String, enum: LANGUAGE_CODES, required: true },
    },
    author: { type: String, required: true, trim: true },
    illustrator: { type: String, trim: true },
    narrator: { type: String, trim: true },
    summary: { type: String, trim: true, maxlength: 2000 },
    ageMin: { type: Number, min: 0, max: 12, default: 2 },
    ageMax: { type: Number, min: 0, max: 12, default: 8 },
    coverColor: { type: String, default: '#f4a261' },
    coverEmoji: { type: String, default: '📖' },
    /** Code printed inside the physical book (and in its QR code) that unlocks the audio. */
    audioCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    isSample: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    pages: { type: [pageSchema], default: [] },
    pageCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

bookSchema.index({ 'languages.primary': 1, 'languages.secondary': 1 });

bookSchema.pre('validate', function syncPageCount(next) {
  this.pageCount = this.pages.length;
  next();
});

export const Book = mongoose.model('Book', bookSchema);
