// Database types for PHC Health Club

export type UserRole = 'patient' | 'provider' | 'admin';
export type ProviderLicenseType = 'MD' | 'PA' | 'NP';
export type ProductType = 'rx' | 'peptide' | 'supplement';
export type AppointmentType = 'initial' | 'followup' | 'bloodwork';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type PrescriptionStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type NotificationType = 'appointment_reminder' | 'refill_reminder' | 'message' | 'bloodwork_due' | 'address_update';
export type NotificationChannel = 'app' | 'sms' | 'email';

// Health goals for product filtering
export type ProductGoal = 'muscle_building' | 'fat_loss' | 'energy' | 'cognitive' | 'skin' | 'hair' | 'libido';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  shipping_address: Address | null;
  billing_address: Address | null;
  insurance_info: Record<string, unknown> | null;
  intake_form_data: Record<string, unknown> | null;
  intake_completed: boolean;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  license_type: ProviderLicenseType;
  license_number: string;
  licensed_states: string[];
  specialty: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// Blood Work Requests
export type BloodWorkRequestStatus = 'pending' | 'approved' | 'denied' | 'completed';

export interface BloodWorkRequest {
  id: string;
  patient_id: string;
  requested_date: string;
  reason: string | null;
  status: BloodWorkRequestStatus;
  provider_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  provider_id: string;
  status: 'draft' | 'active' | 'completed';
  lifestyle_behaviors: Record<string, unknown> | null;
  nutrition: Record<string, unknown> | null;
  training: Record<string, unknown> | null;
  prescriptions_data: Record<string, unknown> | null;
  peptides_data: Record<string, unknown> | null;
  supplements_data: Record<string, unknown> | null;
  notes: string | null;
  sent_to_patient_at: string | null;
  patient_signed_off_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BloodWork {
  id: string;
  patient_id: string;
  date: string;
  lab_source: 'quest' | 'labcorp' | 'other';
  pdf_url: string | null;
  raw_data: Record<string, unknown> | null;
  biomarkers: Record<string, BiomarkerValue> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BiomarkerValue {
  value: number;
  unit: string;
  reference_low: number | null;
  reference_high: number | null;
  flag: 'normal' | 'low' | 'high' | null;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  short_description: string | null;
  long_description: string | null;
  cost: number;
  dosing_info: string | null;
  compounding_pharmacies: string[];
  goals: ProductGoal[];
  active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  product_id: string;
  provider_id: string;
  dosage: string;
  quantity: number;
  instructions: string | null;
  pharmacy: string | null;
  refill_date: string | null;
  auto_refill: boolean;
  status: PrescriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  datetime: string;
  duration: number; // in minutes
  type: AppointmentType;
  video_link: string | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachments: string[];
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message_at: string | null;
  created_at: string;
}

export interface RefillSchedule {
  id: string;
  prescription_id: string;
  next_refill_date: string;
  calculated_from: Record<string, unknown>;
  status: 'pending' | 'ordered' | 'shipped' | 'delivered';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  sent_via: NotificationChannel;
  data: Record<string, unknown> | null;
  sent_at: string;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface LifestyleNote {
  id: string;
  patient_id: string;
  content: string;
  note_date: string;
  created_at: string;
  updated_at: string;
}

export interface BodyMetric {
  id: string;
  patient_id: string;
  measured_at: string;
  weight_lbs: number | null;
  chest_inches: number | null;
  waist_inches: number | null;
  hip_inches: number | null;
  arm_inches: number | null;
  thigh_inches: number | null;
  notes: string | null;
  created_at: string;
}

// Performance & Fitness types
export type LiftType = 'squat' | 'bench_press' | 'deadlift' | 'overhead_press' | 'barbell_row' | 'pull_up' | 'other';

export interface PersonalRecord {
  id: string;
  patient_id: string;
  lift_type: LiftType;
  weight_lbs: number;
  reps: number;
  recorded_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FitnessNote {
  id: string;
  patient_id: string;
  content: string;
  note_date: string;
  created_at: string;
  updated_at: string;
}

export interface NutritionLog {
  id: string;
  patient_id: string;
  log_date: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface PatientWithUser extends Patient {
  user: User;
}

export interface ProviderWithUser extends Provider {
  user: User;
}

export interface PrescriptionWithProduct extends Prescription {
  product: Product;
}

export interface AppointmentWithParticipants extends Appointment {
  patient: PatientWithUser;
  provider: ProviderWithUser;
}
