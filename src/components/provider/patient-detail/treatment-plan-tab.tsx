'use client';

import { format } from 'date-fns';
import { FileText, Check, ChevronDown, ChevronUp, Pill, FlaskConical, Leaf } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { MedicationItem } from '@/components/treatment-plan/medication-item';
import type { TreatmentPlan, Provider, User } from '@/types/database';
import type { PrescriptionItem, PeptideItem, SupplementItem } from '@/types/treatment-plan';

interface TreatmentPlanWithProvider extends TreatmentPlan {
  providers?: (Provider & { users?: User }) | null;
}

interface TreatmentPlanTabProps {
  treatmentPlan: TreatmentPlanWithProvider | null;
}

export function TreatmentPlanTab({ treatmentPlan }: TreatmentPlanTabProps) {
  const [prescriptionsOpen, setPrescriptionsOpen] = useState(false);
  const [peptidesOpen, setPeptidesOpen] = useState(false);
  const [supplementsOpen, setSupplementsOpen] = useState(false);

  if (!treatmentPlan) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={FileText}
            title="No Active Treatment Plan"
            description="Create a treatment plan for this patient."
          />
        </CardContent>
      </Card>
    );
  }

  const providerName = treatmentPlan.providers?.users
    ? `Dr. ${treatmentPlan.providers.users.first_name} ${treatmentPlan.providers.users.last_name}`
    : 'Unknown Provider';

  const prescriptions = treatmentPlan.prescriptions_data as PrescriptionItem[] | null;
  const peptides = treatmentPlan.peptides_data as PeptideItem[] | null;
  const supplements = treatmentPlan.supplements_data as SupplementItem[] | null;

  const hasLifestyle = treatmentPlan.lifestyle_behaviors && Object.keys(treatmentPlan.lifestyle_behaviors).length > 0;
  const hasNutrition = treatmentPlan.nutrition && Object.keys(treatmentPlan.nutrition).length > 0;
  const hasTraining = treatmentPlan.training && Object.keys(treatmentPlan.training).length > 0;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Treatment Plan Overview</CardTitle>
              <CardDescription>Managed by {providerName}</CardDescription>
            </div>
            <Badge variant={treatmentPlan.status === 'active' ? 'default' : 'secondary'}>
              {treatmentPlan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{format(new Date(treatmentPlan.created_at), 'MMMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{format(new Date(treatmentPlan.updated_at), 'MMMM d, yyyy')}</p>
            </div>
          </div>

          {treatmentPlan.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">
                {treatmentPlan.notes.length > 200
                  ? `${treatmentPlan.notes.slice(0, 200)}...`
                  : treatmentPlan.notes}
              </p>
            </div>
          )}

          {/* Lifestyle Summary */}
          <div className="flex flex-wrap gap-2 pt-2">
            {hasLifestyle && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Lifestyle guidelines set
              </div>
            )}
            {hasNutrition && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Nutrition plan set
              </div>
            )}
            {hasTraining && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Training plan set
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Medications Summary</CardTitle>
          <CardDescription>All prescribed medications, peptides, and supplements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prescriptions */}
          <Collapsible open={prescriptionsOpen} onOpenChange={setPrescriptionsOpen}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Prescriptions</span>
                <Badge variant="secondary">{prescriptions?.length || 0}</Badge>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {prescriptionsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-4">
              {prescriptions && prescriptions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {prescriptions.map((item, index) => (
                    <MedicationItem
                      key={`rx-${index}`}
                      name={item.name}
                      dosage={item.dosage}
                      frequency={item.frequency}
                      timing={item.timing}
                      instructions={item.instructions}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No prescriptions</p>
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="border-t" />

          {/* Peptides */}
          <Collapsible open={peptidesOpen} onOpenChange={setPeptidesOpen}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Peptides</span>
                <Badge variant="secondary">{peptides?.length || 0}</Badge>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {peptidesOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-4">
              {peptides && peptides.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {peptides.map((item, index) => (
                    <MedicationItem
                      key={`peptide-${index}`}
                      name={item.name}
                      dosage={item.dosage}
                      frequency={item.frequency}
                      timing={item.timing}
                      instructions={item.instructions}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No peptides</p>
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="border-t" />

          {/* Supplements */}
          <Collapsible open={supplementsOpen} onOpenChange={setSupplementsOpen}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Supplements</span>
                <Badge variant="secondary">{supplements?.length || 0}</Badge>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {supplementsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-4">
              {supplements && supplements.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {supplements.map((item, index) => (
                    <MedicationItem
                      key={`supp-${index}`}
                      name={item.name}
                      dosage={item.dosage}
                      frequency={item.frequency}
                      timing={item.timing}
                      instructions={item.instructions}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No supplements</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
