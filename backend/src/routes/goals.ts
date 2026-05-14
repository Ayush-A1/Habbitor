import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { Goal } from '../models/Goal';
import { Log } from '../models/Log';
import { eachDayOfInterval, parseISO } from 'date-fns';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).populate('habitIds', 'name color icon').sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, startDate, endDate, habitIds } = req.body;
    if (!title || !startDate || !endDate) return void res.status(400).json({ message: 'title, startDate, endDate required' });
    const goal = await Goal.create({ userId: req.userId, title, description, startDate, endDate, habitIds: habitIds || [] });
    res.status(201).json(goal);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    if (!goal) return void res.status(404).json({ message: 'Not found' });
    res.json(goal);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

router.get('/:id/progress', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return void res.status(404).json({ message: 'Not found' });
    const days = eachDayOfInterval({ start: parseISO(goal.startDate), end: parseISO(goal.endDate) });
    const total = days.length * goal.habitIds.length;
    if (!total) return void res.json({ progress: 0 });
    const done = await Log.countDocuments({ habitId: { $in: goal.habitIds }, date: { $gte: goal.startDate, $lte: goal.endDate }, status: 'completed' });
    const progress = Math.min(100, Math.round((done / total) * 100));
    await Goal.findByIdAndUpdate(goal.id, { progress });
    res.json({ progress });
  } catch (err) { next(err); }
});

export default router;
