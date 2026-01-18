'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PrescriptionItem, MedicationTiming } from '@/types/treatment-plan';

interface PrescriptionsEditorProps {
  data: PrescriptionItem[] | null;
  onChange: (data: PrescriptionItem[]) => void;
}

const timingOptions: { value: MedicationTiming; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'with_food', label: 'With Food' },
  { value: 'before_bed', label: 'Before Bed' },
  { value: 'as_directed', label: 'As Directed' },
];

export function PrescriptionsEditor({ data, onChange }: PrescriptionsEditorProps) {
  const prescriptions = data || [];

  const addPrescription = () => {
    const newPrescription: PrescriptionItem = {
      name: '',
      dosage: '',
      frequency: '',
      timing: 'as_directed',
      instructions: '',
      startDate: '',
    };
    onChange([...prescriptions, newPrescription]);
  };

  const updatePrescription = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePrescription = (index: number) => {
    const updated = [...prescriptions];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Prescriptions</h3>
          <p className="text-sm text-muted-foreground">Manage prescription medications</p>
        </div>
        <Button type="button" onClick={addPrescription}>
          <Plus className="h-4 w-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground text-center mb-4">
              No prescriptions added yet.
            </p>
            <Button type="button" variant="outline" onClick={addPrescription}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Prescription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {prescription.name || `Prescription ${index + 1}`}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removePrescription(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`rx-${index}-name`}>Medication Name *</Label>
                    <Input
                      id={`rx-${index}-name`}
                      placeholder="e.g., Testosterone Cypionate"
                      value={prescription.name}
                      onChange={(e) => updatePrescription(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rx-${index}-dosage`}>Dosage *</Label>
                    <Input
                      id={`rx-${index}-dosage`}
                      placeholder="e.g., 100mg"
                      value={prescription.dosage}
                      onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`rx-${index}-frequency`}>Frequency</Label>
                    <Input
                      id={`rx-${index}-frequency`}
                      placeholder="e.g., Once daily, Twice weekly"
                      value={prescription.frequency}
                      onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rx-${index}-timing`}>Timing</Label>
                    <Select
                      value={prescription.timing}
                      onValueChange={(value: MedicationTiming) =>
                        updatePrescription(index, 'timing', value)
                      }
                    >
                      <SelectTrigger id={`rx-${index}-timing`}>
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        {timingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`rx-${index}-startDate`}>Start Date</Label>
                  <Input
                    id={`rx-${index}-startDate`}
                    type="date"
                    value={prescription.startDate || ''}
                    onChange={(e) => updatePrescription(index, 'startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`rx-${index}-instructions`}>Instructions</Label>
                  <Textarea
                    id={`rx-${index}-instructions`}
                    placeholder="Additional instructions for the patient..."
                    value={prescription.instructions || ''}
                    onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
