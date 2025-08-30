import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // You can set this environment variable or use the connection string directly
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://viswendrachronicles_db_user:hfLuwx3WQuQ8RwoP@cluster0.3gxytgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB Connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
