import { Router, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { Note } from '../models/Note';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = { userId: req.userId };
    if (req.query.color) filter.color = req.query.color;
    if (req.query.tag)   filter.tags  = req.query.tag;
    if (req.query.q) {
      const re = new RegExp(req.query.q as string, 'i');
      filter.$or = [{ title: re }, { content: re }, { tags: re }];
    }
    const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 }).limit(100);
    res.json(notes);
  } catch (err) { next(err); }
});

router.get('/tags', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notes = await Note.find({ userId: req.userId }, { tags: 1 });
    const tags = [...new Set(notes.flatMap(n => n.tags))];
    res.json(tags);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return void res.status(404).json({ message: 'Not found' });
    res.json(note);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, color, tags, habitId } = req.body;
    if (!content?.trim()) return void res.status(400).json({ message: 'Content required' });
    const note = await Note.create({ userId: req.userId, title: title || '', content, color: color || 'default', tags: tags || [], habitId: habitId || undefined });
    res.status(201).json(note);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
    if (!note) return void res.status(404).json({ message: 'Not found' });
    res.json(note);
  } catch (err) { next(err); }
});

router.patch('/:id/pin', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return void res.status(404).json({ message: 'Not found' });
    note.isPinned = !note.isPinned;
    await note.save();
    res.json(note);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;
