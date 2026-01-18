'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { LifestyleData, LifestyleRecommendation } from '@/types/treatment-plan';

interface LifestyleEditorProps {
  data: LifestyleData | null;
  onChange: (data: LifestyleData) => void;
}

const defaultData: LifestyleData = {
  sleep: { recommendation: '', notes: '' },
  stress: { recommendation: '', notes: '' },
  habits: [],
  generalNotes: '',
};

export function LifestyleEditor({ data, onChange }: LifestyleEditorProps) {
  const currentData = data || defaultData;

  const updateSleep = (field: keyof LifestyleRecommendation, value: string) => {
    onChange({
      ...currentData,
      sleep: {
        recommendation: currentData.sleep?.recommendation || '',
        notes: currentData.sleep?.notes,
        [field]: value,
      },
    });
  };

  const updateStress = (field: keyof LifestyleRecommendation, value: string) => {
    onChange({
      ...currentData,
      stress: {
        recommendation: currentData.stress?.recommendation || '',
        notes: currentData.stress?.notes,
        [field]: value,
      },
    });
  };

  const addHabit = () => {
    onChange({
      ...currentData,
      habits: [...(currentData.habits || []), { recommendation: '', notes: '' }],
    });
  };

  const updateHabit = (index: number, field: keyof LifestyleRecommendation, value: string) => {
    const habits = [...(currentData.habits || [])];
    habits[index] = { ...habits[index], [field]: value };
    onChange({ ...currentData, habits });
  };

  const removeHabit = (index: number) => {
    const habits = [...(currentData.habits || [])];
    habits.splice(index, 1);
    onChange({ ...currentData, habits });
  };

  return (
    <div className="space-y-6">
      {/* Sleep Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sleep Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sleep-recommendation">Recommendation</Label>
            <Textarea
              id="sleep-recommendation"
              placeholder="e.g., Aim for 7-9 hours of sleep per night"
              value={currentData.sleep?.recommendation || ''}
              onChange={(e) => updateSleep('recommendation', e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleep-notes">Notes</Label>
            <Textarea
              id="sleep-notes"
              placeholder="Additional notes about sleep..."
              value={currentData.sleep?.notes || ''}
              onChange={(e) => updateSleep('notes', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stress Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Stress Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stress-recommendation">Recommendation</Label>
            <Textarea
              id="stress-recommendation"
              placeholder="e.g., Practice 10 minutes of meditation daily"
              value={currentData.stress?.recommendation || ''}
              onChange={(e) => updateStress('recommendation', e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stress-notes">Notes</Label>
            <Textarea
              id="stress-notes"
              placeholder="Additional notes about stress management..."
              value={currentData.stress?.notes || ''}
              onChange={(e) => updateStress('notes', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Habits */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daily Habits</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addHabit}>
              <Plus className="h-4 w-4 mr-1" />
              Add Habit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!currentData.habits || currentData.habits.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No habits added yet. Click &quot;Add Habit&quot; to add one.
            </p>
          ) : (
            currentData.habits.map((habit, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`habit-${index}-recommendation`}>Habit {index + 1}</Label>
                    <Textarea
                      id={`habit-${index}-recommendation`}
                      placeholder="e.g., Walk 10,000 steps daily"
                      value={habit.recommendation || ''}
                      onChange={(e) => updateHabit(index, 'recommendation', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => removeHabit(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`habit-${index}-notes`}>Notes</Label>
                  <Textarea
                    id={`habit-${index}-notes`}
                    placeholder="Additional notes..."
                    value={habit.notes || ''}
                    onChange={(e) => updateHabit(index, 'notes', e.target.value)}
                    rows={2}
                  />
                </div>
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
            placeholder="Any additional lifestyle recommendations..."
            value={currentData.generalNotes || ''}
            onChange={(e) => onChange({ ...currentData, generalNotes: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
