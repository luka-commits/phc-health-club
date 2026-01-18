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
import type { PeptideItem, MedicationTiming } from '@/types/treatment-plan';

interface PeptidesEditorProps {
  data: PeptideItem[] | null;
  onChange: (data: PeptideItem[]) => void;
}

const timingOptions: { value: MedicationTiming; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'with_food', label: 'With Food' },
  { value: 'before_bed', label: 'Before Bed' },
  { value: 'as_directed', label: 'As Directed' },
];

export function PeptidesEditor({ data, onChange }: PeptidesEditorProps) {
  const peptides = data || [];

  const addPeptide = () => {
    const newPeptide: PeptideItem = {
      name: '',
      dosage: '',
      frequency: '',
      timing: 'as_directed',
      injectionSite: '',
      instructions: '',
    };
    onChange([...peptides, newPeptide]);
  };

  const updatePeptide = (index: number, field: keyof PeptideItem, value: string) => {
    const updated = [...peptides];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePeptide = (index: number) => {
    const updated = [...peptides];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Peptides</h3>
          <p className="text-sm text-muted-foreground">Manage peptide therapy</p>
        </div>
        <Button type="button" onClick={addPeptide}>
          <Plus className="h-4 w-4 mr-2" />
          Add Peptide
        </Button>
      </div>

      {peptides.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground text-center mb-4">
              No peptides added yet.
            </p>
            <Button type="button" variant="outline" onClick={addPeptide}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Peptide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {peptides.map((peptide, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {peptide.name || `Peptide ${index + 1}`}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removePeptide(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`peptide-${index}-name`}>Peptide Name *</Label>
                    <Input
                      id={`peptide-${index}-name`}
                      placeholder="e.g., BPC-157"
                      value={peptide.name}
                      onChange={(e) => updatePeptide(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`peptide-${index}-dosage`}>Dosage *</Label>
                    <Input
                      id={`peptide-${index}-dosage`}
                      placeholder="e.g., 250mcg"
                      value={peptide.dosage}
                      onChange={(e) => updatePeptide(index, 'dosage', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`peptide-${index}-frequency`}>Frequency</Label>
                    <Input
                      id={`peptide-${index}-frequency`}
                      placeholder="e.g., Once daily"
                      value={peptide.frequency}
                      onChange={(e) => updatePeptide(index, 'frequency', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`peptide-${index}-timing`}>Timing</Label>
                    <Select
                      value={peptide.timing}
                      onValueChange={(value: MedicationTiming) =>
                        updatePeptide(index, 'timing', value)
                      }
                    >
                      <SelectTrigger id={`peptide-${index}-timing`}>
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
                  <Label htmlFor={`peptide-${index}-injectionSite`}>Injection Site</Label>
                  <Input
                    id={`peptide-${index}-injectionSite`}
                    placeholder="e.g., Subcutaneous abdomen"
                    value={peptide.injectionSite || ''}
                    onChange={(e) => updatePeptide(index, 'injectionSite', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`peptide-${index}-instructions`}>Instructions</Label>
                  <Textarea
                    id={`peptide-${index}-instructions`}
                    placeholder="Additional instructions for the patient..."
                    value={peptide.instructions || ''}
                    onChange={(e) => updatePeptide(index, 'instructions', e.target.value)}
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
