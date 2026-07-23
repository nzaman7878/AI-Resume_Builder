import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional if you add Google OAuth later
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// This prevents Mongoose from recreating the model if it already exists
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);