import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const signAccess   = (id: string) => jwt.sign({ userId: id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
const signRefresh  = (id: string) => jwt.sign({ userId: id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)          return void res.status(400).json({ message: 'All fields required' });
    if (password.length < 6)                   return void res.status(400).json({ message: 'Password min 6 chars' });
    if (await User.findOne({ email }))         return void res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const access  = signAccess(user.id);
    const refresh = signRefresh(user.id);
    user.refreshToken = refresh;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({ accessToken: access, refreshToken: refresh, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return void res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) return void res.status(401).json({ message: 'Invalid email or password' });

    const access  = signAccess(user.id);
    const refresh = signRefresh(user.id);
    user.refreshToken = refresh;
    await user.save({ validateBeforeSave: false });

    res.json({ accessToken: access, refreshToken: refresh, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.body.refreshToken;
    if (!token) return void res.status(401).json({ message: 'Refresh token required' });

    let decoded: any;
    try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string); }
    catch { return void res.status(401).json({ message: 'Invalid refresh token' }); }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) return void res.status(401).json({ message: 'Token mismatch' });

    res.json({ accessToken: signAccess(user.id) });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $unset: { refreshToken: 1 } });
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return void res.status(404).json({ message: 'Not found' });
    res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (err) { next(err); }
});

export default router;
