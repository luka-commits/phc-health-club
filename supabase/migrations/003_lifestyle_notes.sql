-- Lifestyle Notes and Body Metrics Tables
-- Purpose: Patient self-tracking for lifestyle notes and body measurements with secure RLS

-- ============================================================================
-- LIFESTYLE NOTES TABLE
-- Freeform notes patients write about their health journey
-- ============================================================================

CREATE TABLE lifestyle_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  content text NOT NULL,
  note_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for efficient querying by patient and date
CREATE INDEX idx_lifestyle_notes_patient_date ON lifestyle_notes(patient_id, note_date DESC);

-- Enable RLS
ALTER TABLE lifestyle_notes ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own notes
CREATE POLICY "Patients can view own lifestyle notes"
ON lifestyle_notes FOR SELECT
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can insert own lifestyle notes"
ON lifestyle_notes FOR INSERT
TO authenticated
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can update own lifestyle notes"
ON lifestyle_notes FOR UPDATE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
)
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can delete own lifestyle notes"
ON lifestyle_notes FOR DELETE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Providers can view notes of their assigned patients
CREATE POLICY "Providers can view assigned patient lifestyle notes"
ON lifestyle_notes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM treatment_plans tp
    JOIN providers p ON p.id = tp.provider_id
    WHERE p.user_id = auth.uid()
    AND tp.patient_id = lifestyle_notes.patient_id
  )
);

-- ============================================================================
-- BODY METRICS TABLE
-- Weight and body circumference measurements for tracking progress
-- ============================================================================

CREATE TABLE body_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  measured_at date NOT NULL,
  weight_lbs decimal(5,1),
  chest_inches decimal(4,1),
  waist_inches decimal(4,1),
  hip_inches decimal(4,1),
  arm_inches decimal(4,1),
  thigh_inches decimal(4,1),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index for efficient querying by patient and measurement date
CREATE INDEX idx_body_metrics_patient_date ON body_metrics(patient_id, measured_at DESC);

-- Enable RLS
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own metrics
CREATE POLICY "Patients can view own body metrics"
ON body_metrics FOR SELECT
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can insert own body metrics"
ON body_metrics FOR INSERT
TO authenticated
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can update own body metrics"
ON body_metrics FOR UPDATE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
)
WITH CHECK (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can delete own body metrics"
ON body_metrics FOR DELETE
TO authenticated
USING (
  patient_id = (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Providers can view metrics of their assigned patients
CREATE POLICY "Providers can view assigned patient body metrics"
ON body_metrics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM treatment_plans tp
    JOIN providers p ON p.id = tp.provider_id
    WHERE p.user_id = auth.uid()
    AND tp.patient_id = body_metrics.patient_id
  )
);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at timestamp on lifestyle_notes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lifestyle_notes_updated_at
  BEFORE UPDATE ON lifestyle_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
