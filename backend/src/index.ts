import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './utils/db';
import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
import logRoutes from './routes/logs';
import goalRoutes from './routes/goals';
import noteRoutes from './routes/notes';
import analyticsRoutes from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

// Validate required env vars
const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌  Missing env vars:', missing.join(', '));
  console.error('   Copy .env.example → .env and fill in values');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow any origin in dev, or specific origin in prod
const allowedOrigin = process.env.FRONTEND_URL || '';
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);
    // In development allow everything
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    // In production, match the exact FRONTEND_URL
    if (origin === allowedOrigin) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/habits',    habitRoutes);
app.use('/api/logs',      logRoutes);
app.use('/api/goals',     goalRoutes);
app.use('/api/notes',     noteRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 404 for unknown API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀  API ready → http://localhost:${PORT}/api`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
};

start();
export default app;
