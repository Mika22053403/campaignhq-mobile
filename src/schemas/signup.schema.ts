import { z } from "zod";

export const signupSchema = z.object({
  workEmail: z.string().email("Please enter a valid work email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  companyName: z
    .string()
    .trim()
    .min(2, "Company / workspace name must be at least 2 characters")
    .max(60, "Company / workspace name cannot exceed 60 characters"),
});

export type SignupSchema = z.infer<typeof signupSchema>;
