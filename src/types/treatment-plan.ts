// Treatment Plan Section Types
// Used by patient view (read-only) and provider editor (Phase 15)

// ============================================
// Timing Types
// ============================================

export type MedicationTiming = 'morning' | 'evening' | 'with_food' | 'before_bed' | 'as_directed';

// ============================================
// Prescription Types
// ============================================

export interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  timing: MedicationTiming;
  instructions?: string;
  startDate?: string;
}

// ============================================
// Peptide Types
// ============================================

export interface PeptideItem {
  name: string;
  dosage: string;
  frequency: string;
  timing: MedicationTiming;
  injectionSite?: string;
  instructions?: string;
}

// ============================================
// Supplement Types
// ============================================

export interface SupplementItem {
  name: string;
  dosage: string;
  frequency: string;
  timing: MedicationTiming;
  brand?: string;
  instructions?: string;
}

// ============================================
// Lifestyle Types
// ============================================

export interface LifestyleRecommendation {
  recommendation: string;
  notes?: string;
}

export interface LifestyleData {
  sleep?: LifestyleRecommendation;
  stress?: LifestyleRecommendation;
  habits?: LifestyleRecommendation[];
  generalNotes?: string;
}

// ============================================
// Nutrition Types
// ============================================

export interface NutritionData {
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  guidelines?: string[];
  restrictions?: string[];
  generalNotes?: string;
}

// ============================================
// Training Types
// ============================================

export interface ExerciseItem {
  name: string;
  sets?: number;
  reps?: string;
  notes?: string;
}

export interface TrainingData {
  frequency?: string;
  focus?: string[];
  exercises?: ExerciseItem[];
  generalNotes?: string;
}

// ============================================
// Aggregate Type (for full treatment plan data)
// ============================================

export interface TreatmentPlanData {
  prescriptions_data?: PrescriptionItem[] | null;
  peptides_data?: PeptideItem[] | null;
  supplements_data?: SupplementItem[] | null;
  lifestyle_behaviors?: LifestyleData | null;
  nutrition?: NutritionData | null;
  training?: TrainingData | null;
}
