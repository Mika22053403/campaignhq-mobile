import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  company: z.string().min(2, "Company is required"),
  status: z.enum(["Active", "Inactive"]),
});

export type ContactFormData = z.infer<typeof contactSchema>;
