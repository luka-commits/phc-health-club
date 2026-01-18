-- Performance & Fitness Tables
-- Purpose: Patient gym tracking - personal records, fitness notes, and nutrition logs
-- Follows same patterns as 003_lifestyle_notes.sql

-- ============================================================================
-- PERSONAL RECORDS TABLE
-- Track gym PRs for major lifts
-- ============================================================================

CREATE TABLE personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  lift_type text NOT NULL CHECK (lift_type IN ('squat', 'bench_press', 'deadlift', 'overhead_press', 'barbell_row', 'pull_up', 'other')),
  weight_lbs numeric(6,1) NOT NULL,
  reps integer NOT NULL CHECK (reps > 0),
  recorded_at date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_personal_records_patient_date ON personal_records(patient_id, recorded_at DESC);
CREATE INDEX idx_personal_records_patient_lift_date ON personal_records(patient_id, lift_type, recorded_at DESC);

-- Enable RLS
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own PRs
CREATE POLICY "Patients can view own personal records"
ON personal_records FOR SELECT
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can insert own personal records"
ON personal_records FOR INSERT
TO authenticated
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can update own personal records"
ON personal_records FOR UPDATE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
)
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can delete own personal records"
ON personal_records FOR DELETE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Providers can view PRs of their assigned patients
CREATE POLICY "Providers can view assigned patient personal records"
ON personal_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM treatment_plans tp
    JOIN providers p ON p.id = tp.provider_id
    WHERE p.user_id = auth.uid()
    AND tp.patient_id = personal_records.patient_id
  )
);

-- ============================================================================
-- FITNESS NOTES TABLE
-- Freeform training log entries
-- ============================================================================

CREATE TABLE fitness_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  content text NOT NULL,
  note_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for efficient querying by patient and date
CREATE INDEX idx_fitness_notes_patient_date ON fitness_notes(patient_id, note_date DESC);

-- Enable RLS
ALTER TABLE fitness_notes ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own fitness notes
CREATE POLICY "Patients can view own fitness notes"
ON fitness_notes FOR SELECT
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can insert own fitness notes"
ON fitness_notes FOR INSERT
TO authenticated
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can update own fitness notes"
ON fitness_notes FOR UPDATE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
)
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can delete own fitness notes"
ON fitness_notes FOR DELETE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Providers can view fitness notes of their assigned patients
CREATE POLICY "Providers can view assigned patient fitness notes"
ON fitness_notes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM treatment_plans tp
    JOIN providers p ON p.id = tp.provider_id
    WHERE p.user_id = auth.uid()
    AND tp.patient_id = fitness_notes.patient_id
  )
);

-- ============================================================================
-- NUTRITION LOGS TABLE
-- Basic daily nutrition tracking
-- ============================================================================

CREATE TABLE nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  calories integer CHECK (calories >= 0),
  protein_g integer CHECK (protein_g >= 0),
  carbs_g integer CHECK (carbs_g >= 0),
  fats_g integer CHECK (fats_g >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for efficient querying by patient and date
CREATE INDEX idx_nutrition_logs_patient_date ON nutrition_logs(patient_id, log_date DESC);

-- Enable RLS
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own nutrition logs
CREATE POLICY "Patients can view own nutrition logs"
ON nutrition_logs FOR SELECT
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can insert own nutrition logs"
ON nutrition_logs FOR INSERT
TO authenticated
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can update own nutrition logs"
ON nutrition_logs FOR UPDATE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
)
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can delete own nutrition logs"
ON nutrition_logs FOR DELETE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Providers can view nutrition logs of their assigned patients
CREATE POLICY "Providers can view assigned patient nutrition logs"
ON nutrition_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM treatment_plans tp
    JOIN providers p ON p.id = tp.provider_id
    WHERE p.user_id = auth.uid()
    AND tp.patient_id = nutrition_logs.patient_id
  )
);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- Automatically update updated_at timestamp on all 3 tables
-- ============================================================================

-- Note: update_updated_at_column() function already exists from 003_lifestyle_notes.sql

CREATE TRIGGER update_personal_records_updated_at
  BEFORE UPDATE ON personal_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fitness_notes_updated_at
  BEFORE UPDATE ON fitness_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at
  BEFORE UPDATE ON nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
