import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { Log } from '../models/Log';
import { Habit } from '../models/Habit';
import { format, subDays, eachDayOfInterval, parseISO, startOfWeek, endOfWeek } from 'date-fns';

const router = Router();
router.use(protect);

router.get('/overview', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const habits = await Habit.find({ userId: req.userId, isActive: true });
    const todayLogs = await Log.find({ userId: req.userId, date: today });
    const completed = todayLogs.filter(l => l.status === 'completed').length;
    const total = habits.length;
    const streaks = habits.map(h => h.currentStreak);
    const best = habits.map(h => h.longestStreak);
    res.json({
      totalHabits: total,
      completedToday: completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      bestStreak: best.length ? Math.max(...best) : 0,
      activeStreaks: streaks.filter(s => s > 0).length,
    });
  } catch (err) { next(err); }
});

router.get('/heatmap', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 84;
    const from = format(subDays(new Date(), days), 'yyyy-MM-dd');
    const to   = format(new Date(), 'yyyy-MM-dd');
    const logs = await Log.find({ userId: req.userId, date: { $gte: from, $lte: to }, status: 'completed' });
    const habitCount = await Habit.countDocuments({ userId: req.userId, isActive: true });
    const byDate: Record<string, number> = {};
    logs.forEach(l => { byDate[l.date] = (byDate[l.date] || 0) + 1; });
    const grid = eachDayOfInterval({ start: parseISO(from), end: parseISO(to) }).map(d => {
      const ds = format(d, 'yyyy-MM-dd');
      const count = byDate[ds] || 0;
      return { date: ds, count, level: habitCount ? Math.min(4, Math.floor((count / habitCount) * 4)) : 0 };
    });
    res.json(grid);
  } catch (err) { next(err); }
});

router.get('/trends', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const from = format(subDays(new Date(), days), 'yyyy-MM-dd');
    const habits = await Habit.countDocuments({ userId: req.userId, isActive: true });
    const logs = await Log.find({ userId: req.userId, date: { $gte: from }, status: 'completed' });
    const byDate: Record<string, number> = {};
    logs.forEach(l => { byDate[l.date] = (byDate[l.date] || 0) + 1; });
    const trend = eachDayOfInterval({ start: parseISO(from), end: new Date() }).map(d => {
      const ds = format(d, 'yyyy-MM-dd');
      const count = byDate[ds] || 0;
      return { date: ds, completed: count, rate: habits ? Math.round((count / habits) * 100) : 0, label: format(d, 'MMM d') };
    });
    res.json(trend);
  } catch (err) { next(err); }
});

router.get('/weekly', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ws = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const we = format(endOfWeek(new Date(),   { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const logs = await Log.find({ userId: req.userId, date: { $gte: ws, $lte: we } });
    const habits = await Habit.countDocuments({ userId: req.userId, isActive: true });
    const byDay: Record<string, number> = {};
    logs.forEach(l => { if (l.status === 'completed') { const day = format(parseISO(l.date), 'EEE'); byDay[day] = (byDay[day] || 0) + 1; } });
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    res.json(days.map(d => ({ day: d, completed: byDay[d] || 0, total: habits })));
  } catch (err) { next(err); }
});

export default router;
