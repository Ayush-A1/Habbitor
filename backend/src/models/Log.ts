import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  habitId: mongoose.Types.ObjectId;
  userId:  mongoose.Types.ObjectId;
  date:    string;
  status:  'completed' | 'missed' | 'skipped';
  note?:   string;
  createdAt: Date;
}

const schema = new Schema<ILog>({
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
  userId:  { type: Schema.Types.ObjectId, ref: 'User',  required: true, index: true },
  date:    { type: String, required: true },
  status:  { type: String, enum: ['completed','missed','skipped'], required: true },
  note:    { type: String, maxlength: 500 },
}, { timestamps: true });

schema.index({ habitId: 1, date: 1 }, { unique: true });

export const Log = mongoose.model<ILog>('Log', schema);
