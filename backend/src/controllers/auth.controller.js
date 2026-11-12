import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/helpers.js';
import { AUTH_COOKIE, authCookieOptions, signToken } from '../middleware/auth.js';

function sendSession(res, user, status = 200) {
  res.cookie(AUTH_COOKIE, signToken(user), authCookieOptions);
  res.status(status).json({ user });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) {
    throw new AppError('An account with that email already exists', 409, 'EMAIL_TAKEN');
  }
  const user = await User.create({ name, email, password });
  sendSession(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  sendSession(res, user);
});

export const logout = (_req, res) => {
  const { maxAge, ...clearOptions } = authCookieOptions;
  res.clearCookie(AUTH_COOKIE, clearOptions);
  res.status(204).end();
};

/** Returns the signed-in user, or null (never 401) so the client can probe the session quietly. */
export const me = (req, res) => {
  res.json({ user: req.user ?? null });
};
