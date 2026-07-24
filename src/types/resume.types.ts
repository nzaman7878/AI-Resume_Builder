import mongoose from "mongoose";

export interface IResume {
  userId: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    portfolio: string;
  };
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    techStack: string[];
    githubUrl: string;
    liveUrl: string;
  }>;
  skills: string[];
  certifications: string[];
}
