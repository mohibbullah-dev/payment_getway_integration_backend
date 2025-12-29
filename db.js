import mongoose from "mongoose";

export const DB_CONNECT = async () => {
  try {
    const conntionInstance = await mongoose.connect(process.env.DB_URL);
    console.log(`"✅ MongoDB connected" :`);
  } catch (error) {
    console.log("MongoDB connection faild :", error.message);
    process.exit(1);
  }
};
