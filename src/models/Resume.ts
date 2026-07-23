import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "Untitled Resume" },
    personalInfo: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    summary: { type: String, default: "" },
    experience: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        startDate: String,
        endDate: String,
      },
    ],
    skills: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);