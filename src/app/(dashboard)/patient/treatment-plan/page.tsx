import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { FileText, Dumbbell, Apple, Pill, FlaskConical, Leaf } from 'lucide-react';
import { PrescriptionsSection } from '@/components/treatment-plan/prescriptions-section';
import { PeptidesSection } from '@/components/treatment-plan/peptides-section';
import { SupplementsSection } from '@/components/treatment-plan/supplements-section';
import { LifestyleSection } from '@/components/treatment-plan/lifestyle-section';
import { NutritionSection } from '@/components/treatment-plan/nutrition-section';
import { TrainingSection } from '@/components/treatment-plan/training-section';
import type { PrescriptionItem, PeptideItem, SupplementItem, LifestyleData, NutritionData, TrainingData } from '@/types/treatment-plan';

export default async function TreatmentPlanPage() {
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

  // Get treatment plan
  const { data: treatmentPlan } = await supabase
    .from('treatment_plans')
    .select(`
      *,
      providers(
        license_type,
        users(first_name, last_name)
      )
    `)
    .eq('patient_id', patient?.id)
    .eq('status', 'active')
    .single();

  if (!treatmentPlan) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Treatment Plan"
          description="Your personalized health optimization protocol"
        />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={FileText}
              title="No Active Treatment Plan"
              description="Your provider will create a personalized treatment plan after your initial consultation."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const providerName = treatmentPlan.providers?.users
    ? `Dr. ${treatmentPlan.providers.users.first_name} ${treatmentPlan.providers.users.last_name}`
    : 'Your Provider';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatment Plan"
        description="Your personalized health optimization protocol"
      >
        <Badge variant={treatmentPlan.status === 'active' ? 'default' : 'secondary'}>
          {treatmentPlan.status}
        </Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Managed by {providerName} ({treatmentPlan.providers?.license_type})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(treatmentPlan.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{new Date(treatmentPlan.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lifestyle" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="lifestyle" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Lifestyle</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="gap-2">
            <Apple className="h-4 w-4" />
            <span className="hidden sm:inline">Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Training</span>
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Prescriptions</span>
          </TabsTrigger>
          <TabsTrigger value="peptides" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Peptides</span>
          </TabsTrigger>
          <TabsTrigger value="supplements" className="gap-2">
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">Supplements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lifestyle">
          <LifestyleSection data={treatmentPlan.lifestyle_behaviors as LifestyleData | null} />
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionSection data={treatmentPlan.nutrition as NutritionData | null} />
        </TabsContent>

        <TabsContent value="training">
          <TrainingSection data={treatmentPlan.training as TrainingData | null} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionsSection data={treatmentPlan.prescriptions_data as PrescriptionItem[] | null} />
        </TabsContent>

        <TabsContent value="peptides">
          <PeptidesSection data={treatmentPlan.peptides_data as PeptideItem[] | null} />
        </TabsContent>

        <TabsContent value="supplements">
          <SupplementsSection data={treatmentPlan.supplements_data as SupplementItem[] | null} />
        </TabsContent>
      </Tabs>

      {treatmentPlan.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{treatmentPlan.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
