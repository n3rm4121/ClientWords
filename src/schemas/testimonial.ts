// src/schemas/testimonialSchema.ts
import { z } from 'zod';


export const  testimonialCardSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyURL: z.string().url('Invalid URL format'),
  companyLogo: z.string().min(1, 'Company logo is required').optional(),
  promptText: z.string().min(1, 'Prompt text is required'),
  placeholder: z.string().min(1, 'Placeholder is required'),
  spaceId: z.string().min(1, 'Space ID is required'),
  spaceName: z.string().min(1, 'Space name is required'),
});


export const testimonailSchema = z.object({
  userName: z.string().min(3, { message: "Name must be at least 3 characters long." }).max(50, { message: "Name must be less than 50 characters long." }),
  userIntro: z.string().max(50, { message: "Intro must be less than 50 characters long." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters long." }).max(500, { message: "Message must be less than 500 characters long." }),
  userAvatar: z.string(),
  spaceId: z.string(),
});