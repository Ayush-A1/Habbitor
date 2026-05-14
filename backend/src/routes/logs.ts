import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { Log } from '../models/Log';
import { Habit } from '../models/Habit';
import { format, subDays, parseISO } from 'date-fns';

const router = Router();
router.use(protect);

async function recalcStreak(habitId: string) {
  const logs = await Log.find({ habitId, status: 'completed' }).sort({ date: -1 });
  if (!logs.length) { await Habit.findByIdAndUpdate(habitId, { currentStreak: 0, totalCompleted: 0 }); return; }

  let current = 0;
  let expected = format(new Date(), 'yyyy-MM-dd');
  for (const l of logs) {
    if (l.date === expected) { current++; expected = format(subDays(parseISO(l.date), 1), 'yyyy-MM-dd'); }
    else break;
  }

  const longest = await Habit.findById(habitId).then(h => h?.longestStreak || 0);
  await Habit.findByIdAndUpdate(habitId, {
    currentStreak: current,
    longestStreak: Math.max(current, longest),
    totalCompleted: logs.length,
  });
}

// POST /api/logs — log or update a habit for a date
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { habitId, date, status, note } = req.body;
    if (!habitId || !date || !status) return void res.status(400).json({ message: 'habitId, date, status required' });
    const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
    if (!habit) return void res.status(404).json({ message: 'Habit not found' });

    const log = await Log.findOneAndUpdate(
      { habitId, date },
      { habitId, userId: req.userId, date, status, note },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await recalcStreak(habitId);
    res.status(201).json(log);
  } catch (err) { next(err); }
});

// GET /api/logs/date/:date
router.get('/date/:date', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await Log.find({ userId: req.userId, date: req.params.date }).populate('habitId', 'name color icon');
    res.json(logs);
  } catch (err) { next(err); }
});

// GET /api/logs/habit/:habitId?from=&to=
router.get('/habit/:habitId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = { habitId: req.params.habitId, userId: req.userId };
    if (req.query.from && req.query.to) filter.date = { $gte: req.query.from, $lte: req.query.to };
    const logs = await Log.find(filter).sort({ date: -1 });
    res.json(logs);
  } catch (err) { next(err); }
});

export default router;
