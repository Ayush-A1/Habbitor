import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  userId:    mongoose.Types.ObjectId;
  title:     string;
  description?: string;
  startDate: string;
  endDate:   string;
  habitIds:  mongoose.Types.ObjectId[];
  progress:  number;
  createdAt: Date;
}

const schema = new Schema<IGoal>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 400 },
  startDate:   { type: String, required: true },
  endDate:     { type: String, required: true },
  habitIds:    [{ type: Schema.Types.ObjectId, ref: 'Habit' }],
  progress:    { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

export const Goal = mongoose.model<IGoal>('Goal', schema);
