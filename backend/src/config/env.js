import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env.`);
}

const isProd = process.env.NODE_ENV === 'production';

if (isProd && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresDays: Number(process.env.JWT_EXPIRES_DAYS) || 7,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  isProd,
};
