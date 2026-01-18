'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { NutritionData } from '@/types/treatment-plan';

interface NutritionEditorProps {
  data: NutritionData | null;
  onChange: (data: NutritionData) => void;
}

const defaultData: NutritionData = {
  calories: undefined,
  protein: undefined,
  carbs: undefined,
  fat: undefined,
  guidelines: [],
  restrictions: [],
  generalNotes: '',
};

export function NutritionEditor({ data, onChange }: NutritionEditorProps) {
  const currentData = data || defaultData;

  const updateMacro = (field: 'calories' | 'protein' | 'carbs' | 'fat', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    onChange({
      ...currentData,
      [field]: isNaN(numValue as number) ? undefined : numValue,
    });
  };

  const addGuideline = () => {
    onChange({
      ...currentData,
      guidelines: [...(currentData.guidelines || []), ''],
    });
  };

  const updateGuideline = (index: number, value: string) => {
    const guidelines = [...(currentData.guidelines || [])];
    guidelines[index] = value;
    onChange({ ...currentData, guidelines });
  };

  const removeGuideline = (index: number) => {
    const guidelines = [...(currentData.guidelines || [])];
    guidelines.splice(index, 1);
    onChange({ ...currentData, guidelines });
  };

  const addRestriction = () => {
    onChange({
      ...currentData,
      restrictions: [...(currentData.restrictions || []), ''],
    });
  };

  const updateRestriction = (index: number, value: string) => {
    const restrictions = [...(currentData.restrictions || [])];
    restrictions[index] = value;
    onChange({ ...currentData, restrictions });
  };

  const removeRestriction = (index: number) => {
    const restrictions = [...(currentData.restrictions || [])];
    restrictions.splice(index, 1);
    onChange({ ...currentData, restrictions });
  };

  return (
    <div className="space-y-6">
      {/* Macro Targets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daily Macro Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="e.g., 2000"
                value={currentData.calories ?? ''}
                onChange={(e) => updateMacro('calories', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                placeholder="e.g., 150"
                value={currentData.protein ?? ''}
                onChange={(e) => updateMacro('protein', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                placeholder="e.g., 200"
                value={currentData.carbs ?? ''}
                onChange={(e) => updateMacro('carbs', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                placeholder="e.g., 70"
                value={currentData.fat ?? ''}
                onChange={(e) => updateMacro('fat', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Dietary Guidelines</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addGuideline}>
              <Plus className="h-4 w-4 mr-1" />
              Add Guideline
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!currentData.guidelines || currentData.guidelines.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No guidelines added yet. Click &quot;Add Guideline&quot; to add one.
            </p>
          ) : (
            currentData.guidelines.map((guideline, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="e.g., Eat lean protein with every meal"
                  value={guideline}
                  onChange={(e) => updateGuideline(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeGuideline(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Restrictions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Dietary Restrictions</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRestriction}>
              <Plus className="h-4 w-4 mr-1" />
              Add Restriction
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!currentData.restrictions || currentData.restrictions.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No restrictions added yet. Click &quot;Add Restriction&quot; to add one.
            </p>
          ) : (
            currentData.restrictions.map((restriction, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="e.g., Avoid processed sugars"
                  value={restriction}
                  onChange={(e) => updateRestriction(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeRestriction(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* General Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional nutrition recommendations..."
            value={currentData.generalNotes || ''}
            onChange={(e) => onChange({ ...currentData, generalNotes: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
