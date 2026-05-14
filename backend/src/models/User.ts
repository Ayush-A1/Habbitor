import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const schema = new Schema<IUser>({
  name:         { type: String, required: true, trim: true, maxlength: 50 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 6, select: false },
  refreshToken: { type: String, select: false },
}, { timestamps: true });

schema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', schema);
