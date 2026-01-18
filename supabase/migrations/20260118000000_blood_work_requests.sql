-- Blood work requests from patients
CREATE TABLE IF NOT EXISTS blood_work_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'completed')),
  provider_notes TEXT,
  reviewed_by UUID REFERENCES providers(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_blood_work_requests_patient ON blood_work_requests(patient_id);
CREATE INDEX idx_blood_work_requests_status ON blood_work_requests(status);

-- RLS policies
ALTER TABLE blood_work_requests ENABLE ROW LEVEL SECURITY;

-- Patients can view their own requests
CREATE POLICY "Patients can view own blood work requests"
  ON blood_work_requests FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Patients can create requests
CREATE POLICY "Patients can create blood work requests"
  ON blood_work_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Providers can view all requests (for their patients via treatment_plans - simplified for now to all providers)
CREATE POLICY "Providers can view blood work requests"
  ON blood_work_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.user_id = auth.uid()
    )
  );

-- Providers can update requests (approve/deny)
CREATE POLICY "Providers can update blood work requests"
  ON blood_work_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_blood_work_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blood_work_requests_updated_at
  BEFORE UPDATE ON blood_work_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_blood_work_requests_updated_at();
