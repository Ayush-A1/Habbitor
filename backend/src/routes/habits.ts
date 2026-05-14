import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { Habit } from '../models/Habit';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const habits = await Habit.find({ userId: req.userId, isActive: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, frequency, customDays, color, icon, reminderTime } = req.body;
    if (!name) return void res.status(400).json({ message: 'Name required' });
    const habit = await Habit.create({ userId: req.userId, name, description, frequency: frequency || 'daily', customDays, color: color || '#6366f1', icon: icon || '⭐', reminderTime });
    res.status(201).json(habit);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const habit = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true, runValidators: true });
    if (!habit) return void res.status(404).json({ message: 'Not found' });
    res.json(habit);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { isActive: false });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
