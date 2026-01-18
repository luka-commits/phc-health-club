'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBloodWorkUploadUrl, saveBloodWorkRecord } from '@/lib/actions/blood-work';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = { 'application/pdf': ['.pdf'] };

interface BloodWorkUploadFormProps {
  patientId: string;
}

export function BloodWorkUploadForm({ patientId }: BloodWorkUploadFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setError(null);
      setFileName(file.name);

      try {
        // 1. Get signed upload URL from server
        const urlResult = await getBloodWorkUploadUrl(file.name);
        if (!urlResult.success) {
          throw new Error(urlResult.error);
        }

        // 2. Upload directly to Supabase Storage from client
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from('blood-work')
          .uploadToSignedUrl(urlResult.data!.path, urlResult.data!.token, file);

        if (uploadError) {
          throw uploadError;
        }

        // 3. Save record with file path
        const saveResult = await saveBloodWorkRecord({
          pdfPath: urlResult.data!.path,
          date: new Date().toISOString().split('T')[0],
          labSource: 'other',
        });

        if (!saveResult.success) {
          throw new Error(saveResult.error);
        }

        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [patientId]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled: uploading || success,
  });

  // Handle file rejection errors
  const rejectionError =
    fileRejections.length > 0
      ? fileRejections[0].errors[0]?.code === 'file-too-large'
        ? 'File is too large. Maximum size is 10MB.'
        : fileRejections[0].errors[0]?.code === 'file-invalid-type'
        ? 'Invalid file type. Only PDF files are accepted.'
        : 'File could not be accepted.'
      : null;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Upload Complete</h3>
        <p className="mb-4 text-muted-foreground">
          Your blood work has been uploaded successfully.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/patient/blood-work')}>
            View Blood Work
          </Button>
          <Button
            onClick={() => {
              setSuccess(false);
              setFileName(null);
            }}
          >
            Upload Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary hover:bg-muted/50'}
          ${error || rejectionError ? 'border-destructive' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-3">
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Uploading {fileName}...</p>
              <p className="text-xs text-muted-foreground">Please wait</p>
            </>
          ) : isDragActive ? (
            <>
              <Upload className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium">Drop the PDF here...</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drag and drop your PDF, or{' '}
                  <span className="text-primary underline">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF files only, up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {(error || rejectionError) && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error || rejectionError}</span>
        </div>
      )}
    </div>
  );
}
