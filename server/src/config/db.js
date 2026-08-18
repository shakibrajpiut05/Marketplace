import mongoose from "mongoose";
import {MONGO_URI} from "./env.js"

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI);

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};