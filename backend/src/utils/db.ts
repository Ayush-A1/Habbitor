import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI as string;
  const conn = await mongoose.connect(uri);
  console.log('✅  MongoDB:', conn.connection.host);
};
