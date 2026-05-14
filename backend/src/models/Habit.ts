import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: string[];
  color: string;
  icon: string;
  reminderTime?: string;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  createdAt: Date;
}

const schema = new Schema<IHabit>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  description:  { type: String, trim: true, maxlength: 300 },
  frequency:    { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
  customDays:   [{ type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }],
  color:        { type: String, default: '#6366f1' },
  icon:         { type: String, default: '⭐' },
  reminderTime: { type: String },
  isActive:     { type: Boolean, default: true },
  currentStreak:  { type: Number, default: 0 },
  longestStreak:  { type: Number, default: 0 },
  totalCompleted: { type: Number, default: 0 },
}, { timestamps: true });

export const Habit = mongoose.model<IHabit>('Habit', schema);
