import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { TestTube, Upload, TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';

export default async function BloodWorkPage() {
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

  // Get blood work records
  const { data: bloodWorkRecords } = await supabase
    .from('blood_work')
    .select('*')
    .eq('patient_id', patient?.id)
    .order('date', { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blood Work"
        description="View your lab results and track biomarkers over time"
      >
        <Button asChild>
          <Link href="/patient/blood-work/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Results
          </Link>
        </Button>
      </PageHeader>

      {bloodWorkRecords && bloodWorkRecords.length > 0 ? (
        <div className="space-y-4">
          {bloodWorkRecords.map((record) => (
            <Card key={record.id} className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </CardTitle>
                    <CardDescription className="capitalize">
                      Lab: {record.lab_source}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.pdf_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={record.pdf_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 h-4 w-4" />
                          View PDF
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/patient/blood-work/${record.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {record.biomarkers && Object.keys(record.biomarkers).length > 0 && (
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(record.biomarkers).slice(0, 4).map(([name, data]) => {
                      const biomarker = data as { value: number; unit: string; flag: string | null };
                      return (
                        <div key={name} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{name}</span>
                            {biomarker.flag && (
                              <Badge
                                variant={
                                  biomarker.flag === 'high'
                                    ? 'destructive'
                                    : biomarker.flag === 'low'
                                    ? 'secondary'
                                    : 'default'
                                }
                                className="text-xs"
                              >
                                {biomarker.flag === 'high' && <TrendingUp className="mr-1 h-3 w-3" />}
                                {biomarker.flag === 'low' && <TrendingDown className="mr-1 h-3 w-3" />}
                                {biomarker.flag === 'normal' && <Minus className="mr-1 h-3 w-3" />}
                                {biomarker.flag}
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg font-bold">
                            {biomarker.value} <span className="text-sm font-normal text-muted-foreground">{biomarker.unit}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {Object.keys(record.biomarkers).length > 4 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      +{Object.keys(record.biomarkers).length - 4} more biomarkers
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={TestTube}
              title="No Blood Work Records"
              description="Upload your lab results to track your biomarkers and health progress over time."
            >
              <Button asChild>
                <Link href="/patient/blood-work/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First Results
                </Link>
              </Button>
            </EmptyState>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
