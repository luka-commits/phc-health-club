import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10,}$/.test(val.replace(/\D/g, '')),
      'Phone must have at least 10 digits'
    ),
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date < new Date() && !isNaN(date.getTime());
      },
      'Date of birth must be a valid date in the past'
    ),
});

// Address validation schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z
    .string()
    .length(2, 'State must be 2 letters')
    .regex(/^[A-Z]{2}$/, 'State must be 2 uppercase letters'),
  zip: z
    .string()
    .regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  country: z.string(),
});

// TypeScript types inferred from schemas
export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
