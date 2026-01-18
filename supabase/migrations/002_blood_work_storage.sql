-- Blood Work Storage Bucket and RLS Policies
-- Purpose: Enable secure PDF storage for blood work uploads with patient-scoped access

-- Create private bucket for blood work PDFs
-- HIPAA compliance: bucket must be private (public = false)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blood-work',
  'blood-work',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
);

-- Policy 1: Patients can upload to their own folder
-- Path structure: {patient_id}/{uuid}.pdf
CREATE POLICY "Patients can upload own blood work"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blood-work' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM patients WHERE user_id = auth.uid()
  )
);

-- Policy 2: Patients can view their own files
CREATE POLICY "Patients can view own blood work"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'blood-work' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM patients WHERE user_id = auth.uid()
  )
);

-- Policy 3: Providers can view files of their assigned patients
-- Access granted via treatment_plans relationship
CREATE POLICY "Providers can view assigned patient blood work"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'blood-work' AND
  EXISTS (
    SELECT 1 FROM treatment_plans tp
    JOIN providers p ON p.id = tp.provider_id
    WHERE p.user_id = auth.uid()
    AND tp.patient_id::text = (storage.foldername(name))[1]
  )
);

-- Policy 4: Patients can delete their own files (optional, for re-upload scenarios)
CREATE POLICY "Patients can delete own blood work"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blood-work' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM patients WHERE user_id = auth.uid()
  )
);
