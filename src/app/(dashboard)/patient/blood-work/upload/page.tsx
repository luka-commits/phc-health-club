import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { BloodWorkUploadForm } from '@/components/blood-work/BloodWorkUploadForm';
import { ManualEntryForm } from '@/components/blood-work/ManualEntryForm';
import { ArrowLeft, FileText, PenLine } from 'lucide-react';

export default async function BloodWorkUploadPage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Get patient record
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!patient) {
    redirect('/patient');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Blood Work"
        description="Upload your lab results to track your biomarkers"
      >
        <Button variant="outline" asChild>
          <Link href="/patient/blood-work">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blood Work
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PDF Upload Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Upload PDF</CardTitle>
            </div>
            <CardDescription>
              Upload a PDF of your lab results from Quest, LabCorp, or any other provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BloodWorkUploadForm patientId={patient.id} />
            <div className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Supported formats</p>
              <ul className="list-inside list-disc space-y-1">
                <li>PDF files only</li>
                <li>Maximum file size: 10MB</li>
                <li>Lab results from any provider</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Manual Entry</CardTitle>
            </div>
            <CardDescription>
              Manually enter your biomarker values from your lab results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManualEntryForm patientId={patient.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
