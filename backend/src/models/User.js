import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { LANGUAGE_CODES } from '../constants/languages.js';

const childSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  birthYear: { type: Number, min: 2000 },
  primaryLanguage: { type: String, enum: LANGUAGE_CODES, required: true },
  secondaryLanguage: { type: String, enum: LANGUAGE_CODES, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    children: { type: [childSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
