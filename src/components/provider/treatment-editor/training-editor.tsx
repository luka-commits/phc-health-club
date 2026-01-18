'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { TrainingData, ExerciseItem } from '@/types/treatment-plan';

interface TrainingEditorProps {
  data: TrainingData | null;
  onChange: (data: TrainingData) => void;
}

const defaultData: TrainingData = {
  frequency: '',
  focus: [],
  exercises: [],
  generalNotes: '',
};

export function TrainingEditor({ data, onChange }: TrainingEditorProps) {
  const currentData = data || defaultData;

  const addFocusArea = () => {
    onChange({
      ...currentData,
      focus: [...(currentData.focus || []), ''],
    });
  };

  const updateFocusArea = (index: number, value: string) => {
    const focus = [...(currentData.focus || [])];
    focus[index] = value;
    onChange({ ...currentData, focus });
  };

  const removeFocusArea = (index: number) => {
    const focus = [...(currentData.focus || [])];
    focus.splice(index, 1);
    onChange({ ...currentData, focus });
  };

  const addExercise = () => {
    const newExercise: ExerciseItem = {
      name: '',
      sets: undefined,
      reps: '',
      notes: '',
    };
    onChange({
      ...currentData,
      exercises: [...(currentData.exercises || []), newExercise],
    });
  };

  const updateExercise = (index: number, field: keyof ExerciseItem, value: string | number | undefined) => {
    const exercises = [...(currentData.exercises || [])];
    exercises[index] = { ...exercises[index], [field]: value };
    onChange({ ...currentData, exercises });
  };

  const removeExercise = (index: number) => {
    const exercises = [...(currentData.exercises || [])];
    exercises.splice(index, 1);
    onChange({ ...currentData, exercises });
  };

  return (
    <div className="space-y-6">
      {/* Frequency */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Training Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Input
              id="frequency"
              placeholder="e.g., 4x per week"
              value={currentData.frequency || ''}
              onChange={(e) => onChange({ ...currentData, frequency: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Focus Areas</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFocusArea}>
              <Plus className="h-4 w-4 mr-1" />
              Add Focus Area
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!currentData.focus || currentData.focus.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No focus areas added yet. Click &quot;Add Focus Area&quot; to add one.
            </p>
          ) : (
            currentData.focus.map((area, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="e.g., Upper body, Core, Cardio"
                  value={area}
                  onChange={(e) => updateFocusArea(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeFocusArea(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Exercises</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addExercise}>
              <Plus className="h-4 w-4 mr-1" />
              Add Exercise
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!currentData.exercises || currentData.exercises.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No exercises added yet. Click &quot;Add Exercise&quot; to add one.
            </p>
          ) : (
            currentData.exercises.map((exercise, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`exercise-${index}-name`}>Exercise Name</Label>
                      <Input
                        id={`exercise-${index}-name`}
                        placeholder="e.g., Barbell Squat"
                        value={exercise.name || ''}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0 mt-6"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`exercise-${index}-sets`}>Sets</Label>
                      <Input
                        id={`exercise-${index}-sets`}
                        type="number"
                        placeholder="e.g., 4"
                        value={exercise.sets ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                          updateExercise(index, 'sets', isNaN(val as number) ? undefined : val);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`exercise-${index}-reps`}>Reps</Label>
                      <Input
                        id={`exercise-${index}-reps`}
                        placeholder="e.g., 8-12"
                        value={exercise.reps || ''}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`exercise-${index}-notes`}>Notes</Label>
                    <Textarea
                      id={`exercise-${index}-notes`}
                      placeholder="Exercise notes or instructions..."
                      value={exercise.notes || ''}
                      onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
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
            placeholder="Any additional training recommendations..."
            value={currentData.generalNotes || ''}
            onChange={(e) => onChange({ ...currentData, generalNotes: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
