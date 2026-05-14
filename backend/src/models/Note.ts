import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId:   mongoose.Types.ObjectId;
  title:    string;
  content:  string;
  color:    string;
  tags:     string[];
  isPinned: boolean;
  habitId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<INote>({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:    { type: String, trim: true, maxlength: 150, default: '' },
  content:  { type: String, required: true, trim: true, maxlength: 10000 },
  color:    { type: String, default: 'default' },
  tags:     [{ type: String, trim: true, maxlength: 30 }],
  isPinned: { type: Boolean, default: false },
  habitId:  { type: Schema.Types.ObjectId, ref: 'Habit' },
}, { timestamps: true });

export const Note = mongoose.model<INote>('Note', schema);
