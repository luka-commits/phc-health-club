'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Save, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LifestyleEditor } from './lifestyle-editor';
import { NutritionEditor } from './nutrition-editor';
import { TrainingEditor } from './training-editor';
import { PrescriptionsEditor } from './prescriptions-editor';
import { PeptidesEditor } from './peptides-editor';
import { SupplementsEditor } from './supplements-editor';
import { SendPlanDialog } from './send-plan-dialog';
import { updateTreatmentPlan, updateTreatmentPlanStatus } from '@/lib/actions/treatment-plans';
import type { TreatmentPlan } from '@/types/database';
import type {
  TreatmentPlanData,
  LifestyleData,
  NutritionData,
  TrainingData,
  PrescriptionItem,
  PeptideItem,
  SupplementItem,
} from '@/types/treatment-plan';

interface TreatmentPlanEditorProps {
  treatmentPlan: TreatmentPlan;
  patientId: string;
  patientName: string;
}

export function TreatmentPlanEditor({
  treatmentPlan,
  patientId,
  patientName,
}: TreatmentPlanEditorProps) {
  const [formData, setFormData] = useState<TreatmentPlanData>({
    lifestyle_behaviors: treatmentPlan.lifestyle_behaviors as LifestyleData | null,
    nutrition: treatmentPlan.nutrition as NutritionData | null,
    training: treatmentPlan.training as TrainingData | null,
    prescriptions_data: treatmentPlan.prescriptions_data as PrescriptionItem[] | null,
    peptides_data: treatmentPlan.peptides_data as PeptideItem[] | null,
    supplements_data: treatmentPlan.supplements_data as SupplementItem[] | null,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('lifestyle');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed'>(treatmentPlan.status);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(treatmentPlan.updated_at));
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (section: keyof TreatmentPlanData, data: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const result = await updateTreatmentPlan({
        treatmentPlanId: treatmentPlan.id,
        lifestyle_behaviors: formData.lifestyle_behaviors,
        nutrition: formData.nutrition,
        training: formData.training,
        prescriptions_data: formData.prescriptions_data,
        peptides_data: formData.peptides_data,
        supplements_data: formData.supplements_data,
      });

      if (result.success) {
        setIsDirty(false);
        setLastSaved(new Date());
        toast.success('Treatment plan saved');
      } else {
        toast.error(result.error || 'Failed to save treatment plan');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // Save first if there are unsaved changes
    if (isDirty) {
      await handleSaveDraft();
    }

    setIsPublishing(true);
    try {
      const result = await updateTreatmentPlanStatus(treatmentPlan.id, 'active');

      if (result.success) {
        setStatus('active');
        toast.success('Treatment plan published');
      } else {
        toast.error(result.error || 'Failed to publish treatment plan');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPublishing(false);
    }
  };

  const statusVariant = status === 'active' ? 'default' : status === 'completed' ? 'secondary' : 'outline';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Treatment Plan for {patientName}</CardTitle>
              <CardDescription className="mt-1">
                Last saved: {format(lastSaved, 'MMM d, yyyy h:mm a')}
                {isDirty && <span className="text-amber-600 ml-2">(unsaved changes)</span>}
              </CardDescription>
            </div>
            <Badge variant={statusVariant} className="w-fit capitalize">
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            {status === 'draft' && (
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish Plan
              </Button>
            )}
            {status === 'active' && (
              <Button onClick={() => setIsSendDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send to Patient
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="prescriptions">Rx</TabsTrigger>
          <TabsTrigger value="peptides">Peptides</TabsTrigger>
          <TabsTrigger value="supplements">Supps</TabsTrigger>
        </TabsList>

        <TabsContent value="lifestyle" className="mt-6">
          <LifestyleEditor
            data={formData.lifestyle_behaviors || null}
            onChange={(data) => handleChange('lifestyle_behaviors', data)}
          />
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <NutritionEditor
            data={formData.nutrition || null}
            onChange={(data) => handleChange('nutrition', data)}
          />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <TrainingEditor
            data={formData.training || null}
            onChange={(data) => handleChange('training', data)}
          />
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <PrescriptionsEditor
            data={formData.prescriptions_data || null}
            onChange={(data) => handleChange('prescriptions_data', data)}
          />
        </TabsContent>

        <TabsContent value="peptides" className="mt-6">
          <PeptidesEditor
            data={formData.peptides_data || null}
            onChange={(data) => handleChange('peptides_data', data)}
          />
        </TabsContent>

        <TabsContent value="supplements" className="mt-6">
          <SupplementsEditor
            data={formData.supplements_data || null}
            onChange={(data) => handleChange('supplements_data', data)}
          />
        </TabsContent>
      </Tabs>

      {/* Send Plan Dialog */}
      <SendPlanDialog
        treatmentPlanId={treatmentPlan.id}
        patientName={patientName}
        isOpen={isSendDialogOpen}
        onClose={() => setIsSendDialogOpen(false)}
        isPlanActive={status === 'active'}
      />
    </div>
  );
}
