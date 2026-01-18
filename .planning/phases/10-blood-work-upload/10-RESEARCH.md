# Phase 10: Blood Work Upload - Research

**Researched:** 2026-01-18
**Domain:** Supabase Storage file uploads for healthcare (PDF + manual entry)
**Confidence:** HIGH

<research_summary>
## Summary

Researched Supabase Storage patterns for secure file uploads in a HIPAA-aware healthcare context. The standard approach uses Supabase Storage with signed upload URLs to bypass Next.js body size limits (1MB default), combined with RLS policies for access control.

Key finding: Use signed upload URLs (`createSignedUploadUrl`) for client-side uploads instead of passing files through Server Actions. This pattern handles large PDFs efficiently while maintaining security through server-side URL generation with auth checks.

**Primary recommendation:** Create private bucket with RLS policies scoped to patient ownership, generate signed upload URLs via Server Action after auth verification, upload directly from client to Supabase Storage, then store the file path in the blood_work table.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.x | Supabase client | Already in project, handles Storage API |
| @supabase/ssr | ^0.5.x | SSR helper | Already in project, cookie handling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-dropzone | ^14.x | Drag-drop file upload UI | Better UX than native input |
| uuid | ^9.x | Generate unique filenames | Prevent collisions/overwrites |
| zod | ^3.x | File validation schema | Already in project, validate file type/size |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | Native input[type=file] | Native works, dropzone better UX |
| Signed URLs | Server Action upload | Server Action limited to 1MB body size |
| Supabase Storage | S3 direct | Supabase integrates with RLS, simpler setup |

**Installation:**
```bash
npm install react-dropzone uuid
# @supabase/supabase-js and zod already installed
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── (dashboard)/
│       └── patient/
│           └── blood-work/
│               └── upload/
│                   └── page.tsx          # Upload page
├── components/
│   └── blood-work/
│       ├── BloodWorkUploadForm.tsx       # Client component with dropzone
│       └── ManualEntryForm.tsx           # Manual biomarker entry
├── lib/
│   └── actions/
│       └── blood-work.ts                 # Server actions for upload
└── types/
    └── blood-work.ts                     # Upload-specific types
```

### Pattern 1: Signed Upload URL Flow
**What:** Generate signed URL on server, upload from client directly to Supabase
**When to use:** Files > 1MB (all PDFs essentially)
**Example:**
```typescript
// Server Action: lib/actions/blood-work.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function getBloodWorkUploadUrl(fileName: string) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get patient ID for this user
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!patient) {
    return { success: false, error: 'Patient not found' }
  }

  // Generate unique path: blood-work/{patient_id}/{uuid}.pdf
  const fileExt = fileName.split('.').pop()
  const uniqueName = `${uuidv4()}.${fileExt}`
  const path = `${patient.id}/${uniqueName}`

  const { data, error } = await supabase.storage
    .from('blood-work')
    .createSignedUploadUrl(path)

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    signedUrl: data.signedUrl,
    token: data.token,
    path
  }
}
```

```typescript
// Client Component: components/blood-work/BloodWorkUploadForm.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { getBloodWorkUploadUrl } from '@/lib/actions/blood-work'

async function handleUpload(file: File) {
  // 1. Get signed URL from server
  const result = await getBloodWorkUploadUrl(file.name)
  if (!result.success) throw new Error(result.error)

  // 2. Upload directly to Supabase from client
  const supabase = createClient()
  const { error } = await supabase.storage
    .from('blood-work')
    .uploadToSignedUrl(result.path, result.token, file)

  if (error) throw error

  // 3. Save record with file path (via another server action)
  return result.path
}
```

### Pattern 2: RLS Policy for Patient-Scoped Storage
**What:** Only patients can access their own blood work files
**When to use:** All blood work storage operations
**Example:**
```sql
-- Allow patients to upload to their own folder
CREATE POLICY "Patients can upload own blood work"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blood-work' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM patients WHERE user_id = auth.uid()
  )
);

-- Allow patients to read their own files
CREATE POLICY "Patients can view own blood work"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'blood-work' AND
  (storage.foldername(name))[1] = (
    SELECT id::text FROM patients WHERE user_id = auth.uid()
  )
);

-- Allow providers to read their patients' files
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
```

### Anti-Patterns to Avoid
- **Uploading via Server Action body:** Limited to 1MB, will fail for PDFs
- **Public buckets:** Never use public for PHI/medical data
- **Storing files by original filename:** Collision risk, use UUID
- **Trusting client-side file type validation:** Always verify on server
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File upload UI | Custom drag-drop | react-dropzone | Handles edge cases (mobile, accessibility) |
| Unique filenames | timestamp + random | uuid v4 | Cryptographically random, no collisions |
| File type validation | Check extension only | Magic bytes + extension | Extensions can be spoofed |
| Signed URL generation | Manual S3 signing | Supabase createSignedUploadUrl | Handles expiry, security |
| Access control | Custom middleware | Supabase RLS policies | Database-level security, harder to bypass |

**Key insight:** Supabase Storage + RLS handles the hard parts of secure file storage. The signed URL pattern bypasses Next.js limitations while maintaining security. Don't try to stream files through Server Actions or build custom auth - use the established patterns.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Next.js Body Size Limit
**What goes wrong:** File upload fails silently or with cryptic error for files > 1MB
**Why it happens:** Next.js Server Actions have 1MB body limit by default
**How to avoid:** Use signed upload URLs - generate URL on server, upload directly from client
**Warning signs:** "Body exceeded 1mb limit" error, uploads work for tiny files but fail for normal PDFs

### Pitfall 2: Missing RLS Policies
**What goes wrong:** Uploads fail with "new row violates row-level security policy"
**Why it happens:** Supabase Storage denies all operations without explicit RLS policies
**How to avoid:** Create INSERT, SELECT, (optionally UPDATE/DELETE) policies before testing uploads
**Warning signs:** 403 errors, "permission denied" even for authenticated users

### Pitfall 3: File Path Collisions
**What goes wrong:** File overwrites previous upload with same name
**Why it happens:** Using original filename without unique prefix
**How to avoid:** Always use UUID for filename, store original name in database if needed
**Warning signs:** Historical files disappearing, unexpected file content

### Pitfall 4: Trusting Content-Type Header
**What goes wrong:** Malicious files uploaded disguised as PDFs
**Why it happens:** Content-Type header is set by client and can be spoofed
**How to avoid:** Validate file magic bytes on server, whitelist allowed types
**Warning signs:** Successful uploads of non-PDF files, potential security audit failures

### Pitfall 5: Exposing Bucket Publicly
**What goes wrong:** All blood work PDFs accessible to anyone with URL
**Why it happens:** Accidentally creating public bucket for "easier development"
**How to avoid:** Always use private buckets for PHI, use signed URLs for access
**Warning signs:** Files accessible without auth, HIPAA compliance failures

### Pitfall 6: Signed URL Expiry
**What goes wrong:** Upload fails for slow connections
**Why it happens:** Signed upload URLs expire after 2 hours
**How to avoid:** Generate URL immediately before upload, handle expiry gracefully
**Warning signs:** Intermittent upload failures, "URL expired" errors
</common_pitfalls>

<code_examples>
## Code Examples

### Bucket Creation (Migration)
```sql
-- Source: Supabase Storage docs
-- Run in Supabase SQL editor or migration

-- Create private bucket for blood work PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('blood-work', 'blood-work', false);
```

### Complete Upload Form Component
```typescript
// Source: react-dropzone + Supabase patterns
'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { getBloodWorkUploadUrl, saveBloodWorkRecord } from '@/lib/actions/blood-work'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = { 'application/pdf': ['.pdf'] }

export function BloodWorkUploadForm({ patientId }: { patientId: string }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // 1. Get signed URL
      const urlResult = await getBloodWorkUploadUrl(file.name)
      if (!urlResult.success) throw new Error(urlResult.error)

      // 2. Upload to Supabase
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('blood-work')
        .uploadToSignedUrl(urlResult.path, urlResult.token, file)

      if (uploadError) throw uploadError

      // 3. Save record
      const saveResult = await saveBloodWorkRecord({
        patientId,
        pdfPath: urlResult.path,
        date: new Date().toISOString().split('T')[0],
        labSource: 'other'
      })

      if (!saveResult.success) throw new Error(saveResult.error)

      // Success - redirect or show message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [patientId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : isDragActive ? (
        <p>Drop the PDF here...</p>
      ) : (
        <p>Drag & drop a PDF, or click to select</p>
      )}
      {error && <p className="text-destructive mt-2">{error}</p>}
    </div>
  )
}
```

### Server Action for Saving Record
```typescript
// Source: Project patterns (server actions)
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface SaveBloodWorkInput {
  patientId: string
  pdfPath: string
  date: string
  labSource: 'quest' | 'labcorp' | 'other'
}

export async function saveBloodWorkRecord(input: SaveBloodWorkInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify patient belongs to user
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('id', input.patientId)
    .eq('user_id', user.id)
    .single()

  if (!patient) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get public URL for storage
  const { data: { publicUrl } } = supabase.storage
    .from('blood-work')
    .getPublicUrl(input.pdfPath)

  // Insert blood work record
  const { error } = await supabase
    .from('blood_work')
    .insert({
      patient_id: input.patientId,
      date: input.date,
      lab_source: input.labSource,
      pdf_url: publicUrl,
      biomarkers: null, // To be filled manually or via OCR later
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/patient/blood-work')
  return { success: true }
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Upload through server | Signed upload URLs | Supabase 2.x | Bypasses body limits, better performance |
| Manual RLS SQL | Storage helper functions | 2024 | Easier policy writing with foldername(), extension() |
| Custom dropzone | react-dropzone 14+ | Stable | Better accessibility, mobile support |
| Polling for upload status | Resumable uploads with TUS | 2024 | Large file support, resume on connection loss |

**New tools/patterns to consider:**
- **Supabase UI Dropzone:** Official component, integrates directly with Storage
- **Resumable Uploads:** For very large files (>50MB), uses TUS protocol
- **Storage Triggers:** Can fire Postgres functions on upload (useful for audit logging)

**Deprecated/outdated:**
- **Passing File through Server Action:** Only viable for <1MB files
- **Public buckets for dev:** Always use private + signed URLs from the start
</sota_updates>

<open_questions>
## Open Questions

1. **OCR Integration Timing**
   - What we know: OpenAI Vision API planned for Phase 28 (PDF OCR)
   - What's unclear: Should we store raw PDF text now for future OCR, or just the PDF?
   - Recommendation: Store only PDF now, OCR extracts to biomarkers field later

2. **File Size Limits**
   - What we know: Supabase allows up to 5GB per file, react-dropzone can limit client-side
   - What's unclear: What's realistic max for blood work PDFs? Most are <5MB
   - Recommendation: Set 10MB limit client-side, can adjust based on user feedback

3. **HIPAA Add-on**
   - What we know: Supabase HIPAA add-on is $350/month on Team plan, requires BAA
   - What's unclear: Is this needed for MVP? Depends on when PHI is stored
   - Recommendation: Document requirement, decision is business-level (out of scope for phase)
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Supabase Storage Quickstart](https://supabase.com/docs/guides/storage/quickstart) - bucket setup, basic operations
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) - RLS policies, security
- [Supabase createSignedUploadUrl](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl) - API reference
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) - security best practices

### Secondary (MEDIUM confidence)
- [Signed URL file uploads with NextJs and Supabase](https://medium.com/@olliedoesdev/signed-url-file-uploads-with-nextjs-and-supabase-74ba91b65fe0) - verified pattern against docs
- [Supabase HIPAA Compliance](https://supabase.com/docs/guides/security/hipaa-compliance) - BAA requirements

### Tertiary (LOW confidence - needs validation)
- None - all findings verified against official sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Supabase Storage with Next.js
- Ecosystem: react-dropzone, uuid, signed URLs
- Patterns: Signed upload flow, RLS policies, patient-scoped storage
- Pitfalls: Body size limits, RLS, file collisions, security

**Confidence breakdown:**
- Standard stack: HIGH - Supabase official docs, established patterns
- Architecture: HIGH - Verified against Supabase and project patterns
- Pitfalls: HIGH - Documented in official guides and community
- Code examples: HIGH - Based on official docs and project conventions

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - Supabase Storage API stable)
</metadata>

---

*Phase: 10-blood-work-upload*
*Research completed: 2026-01-18*
*Ready for planning: yes*
