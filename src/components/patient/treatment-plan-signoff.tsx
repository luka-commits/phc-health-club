'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Loader2, Check, ExternalLink, Pill, FlaskConical, Leaf, Moon, Apple, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { signOffTreatmentPlan } from '@/lib/actions/treatment-plans';
import type { TreatmentPlan, User } from '@/types/database';
import type { PrescriptionItem, PeptideItem, SupplementItem } from '@/types/treatment-plan';

interface TreatmentPlanSignoffProps {
  treatmentPlan: TreatmentPlan & {
    providers: {
      id: string;
      users: User;
    };
  };
  patientName: string;
}

export function TreatmentPlanSignoff({ treatmentPlan, patientName }: TreatmentPlanSignoffProps) {
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const providerName = treatmentPlan.providers?.users
    ? `${treatmentPlan.providers.users.first_name} ${treatmentPlan.providers.users.last_name}`
    : 'Your Provider';

  const prescriptions = treatmentPlan.prescriptions_data as PrescriptionItem[] | null;
  const peptides = treatmentPlan.peptides_data as PeptideItem[] | null;
  const supplements = treatmentPlan.supplements_data as SupplementItem[] | null;
  const hasLifestyle = !!treatmentPlan.lifestyle_behaviors;
  const hasNutrition = !!treatmentPlan.nutrition;
  const hasTraining = !!treatmentPlan.training;

  const handleSignOff = async () => {
    setIsSubmitting(true);
    try {
      const result = await signOffTreatmentPlan(treatmentPlan.id);

      if (result.success) {
        toast.success('Treatment plan signed off successfully');
        router.push('/patient');
      } else {
        toast.error(result.error || 'Failed to sign off treatment plan');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Treatment Plan</CardTitle>
        <CardDescription>
          Sent by Dr. {providerName} on {format(new Date(treatmentPlan.sent_to_patient_at!), 'MMMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="space-y-4">
          <h3 className="font-medium">Plan Summary</h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Prescriptions */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Pill className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Prescriptions</p>
                {prescriptions && prescriptions.length > 0 ? (
                  <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
                    {prescriptions.map((rx, i) => (
                      <li key={i}>{rx.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
            </div>

            {/* Peptides */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <FlaskConical className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Peptides</p>
                {peptides && peptides.length > 0 ? (
                  <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
                    {peptides.map((p, i) => (
                      <li key={i}>{p.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
            </div>

            {/* Supplements */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Leaf className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Supplements</p>
                {supplements && supplements.length > 0 ? (
                  <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
                    {supplements.map((s, i) => (
                      <li key={i}>{s.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
            </div>
          </div>

          {/* Protocol badges */}
          <div className="flex flex-wrap gap-2">
            {hasLifestyle && (
              <Badge variant="secondary" className="gap-1">
                <Moon className="h-3 w-3" />
                Lifestyle Protocol
              </Badge>
            )}
            {hasNutrition && (
              <Badge variant="secondary" className="gap-1">
                <Apple className="h-3 w-3" />
                Nutrition Protocol
              </Badge>
            )}
            {hasTraining && (
              <Badge variant="secondary" className="gap-1">
                <Dumbbell className="h-3 w-3" />
                Training Protocol
              </Badge>
            )}
          </div>
        </div>

        {/* View Full Plan Link */}
        <div>
          <Button variant="outline" asChild>
            <Link href="/patient/treatment-plan">
              View Full Treatment Plan
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start space-x-3 pt-4 border-t">
          <Checkbox
            id="agree"
            checked={isAgreed}
            onCheckedChange={(checked) => setIsAgreed(checked === true)}
          />
          <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
            I, {patientName}, have reviewed and understand my treatment plan. I agree to follow the protocols as prescribed by my provider.
          </Label>
        </div>

        {/* Sign Off Button */}
        <Button
          onClick={handleSignOff}
          disabled={!isAgreed || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing Off...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Sign Off on Treatment Plan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
