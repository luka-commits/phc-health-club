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
import type { SupplementItem, MedicationTiming } from '@/types/treatment-plan';

interface SupplementsEditorProps {
  data: SupplementItem[] | null;
  onChange: (data: SupplementItem[]) => void;
}

const timingOptions: { value: MedicationTiming; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'with_food', label: 'With Food' },
  { value: 'before_bed', label: 'Before Bed' },
  { value: 'as_directed', label: 'As Directed' },
];

export function SupplementsEditor({ data, onChange }: SupplementsEditorProps) {
  const supplements = data || [];

  const addSupplement = () => {
    const newSupplement: SupplementItem = {
      name: '',
      dosage: '',
      frequency: '',
      timing: 'as_directed',
      brand: '',
      instructions: '',
    };
    onChange([...supplements, newSupplement]);
  };

  const updateSupplement = (index: number, field: keyof SupplementItem, value: string) => {
    const updated = [...supplements];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSupplement = (index: number) => {
    const updated = [...supplements];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Supplements</h3>
          <p className="text-sm text-muted-foreground">Manage supplement recommendations</p>
        </div>
        <Button type="button" onClick={addSupplement}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplement
        </Button>
      </div>

      {supplements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground text-center mb-4">
              No supplements added yet.
            </p>
            <Button type="button" variant="outline" onClick={addSupplement}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Supplement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {supplements.map((supplement, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {supplement.name || `Supplement ${index + 1}`}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeSupplement(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`supp-${index}-name`}>Supplement Name *</Label>
                    <Input
                      id={`supp-${index}-name`}
                      placeholder="e.g., Vitamin D3"
                      value={supplement.name}
                      onChange={(e) => updateSupplement(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`supp-${index}-dosage`}>Dosage *</Label>
                    <Input
                      id={`supp-${index}-dosage`}
                      placeholder="e.g., 5000 IU"
                      value={supplement.dosage}
                      onChange={(e) => updateSupplement(index, 'dosage', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`supp-${index}-frequency`}>Frequency</Label>
                    <Input
                      id={`supp-${index}-frequency`}
                      placeholder="e.g., Once daily"
                      value={supplement.frequency}
                      onChange={(e) => updateSupplement(index, 'frequency', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`supp-${index}-timing`}>Timing</Label>
                    <Select
                      value={supplement.timing}
                      onValueChange={(value: MedicationTiming) =>
                        updateSupplement(index, 'timing', value)
                      }
                    >
                      <SelectTrigger id={`supp-${index}-timing`}>
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
                  <Label htmlFor={`supp-${index}-brand`}>Brand (optional)</Label>
                  <Input
                    id={`supp-${index}-brand`}
                    placeholder="e.g., Thorne, Pure Encapsulations"
                    value={supplement.brand || ''}
                    onChange={(e) => updateSupplement(index, 'brand', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`supp-${index}-instructions`}>Instructions</Label>
                  <Textarea
                    id={`supp-${index}-instructions`}
                    placeholder="Additional instructions for the patient..."
                    value={supplement.instructions || ''}
                    onChange={(e) => updateSupplement(index, 'instructions', e.target.value)}
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
