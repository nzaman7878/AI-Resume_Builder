import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const ResumeUpdateSchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  personalInfo: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
  }).optional(),
  education: z.array(
    z.object({
      school: z.string().optional(),
      degree: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ).optional(),
  experience: z.array(
    z.object({
      company: z.string().optional(),
      position: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  projects: z.array(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      techStack: z.array(z.string()).optional(),
      githubUrl: z.string().optional(),
      liveUrl: z.string().optional(),
    })
  ).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});
