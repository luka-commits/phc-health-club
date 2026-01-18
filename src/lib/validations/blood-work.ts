import { z } from 'zod';

export const biomarkerSchema = z.object({
  name: z.string().min(1, 'Biomarker name is required'),
  value: z.number().positive('Value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  reference_low: z.number().nullable().optional(),
  reference_high: z.number().nullable().optional(),
});

export const manualEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  lab_source: z.enum(['quest', 'labcorp', 'other']),
  notes: z.string().optional(),
  biomarkers: z.array(biomarkerSchema).min(1, 'At least one biomarker is required'),
});

export type BiomarkerInput = z.infer<typeof biomarkerSchema>;
export type ManualEntryInput = z.infer<typeof manualEntrySchema>;
