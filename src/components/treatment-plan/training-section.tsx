'use client';

import { Dumbbell, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import type { TrainingData } from '@/types/treatment-plan';

interface TrainingSectionProps {
  data: TrainingData | null | undefined;
}

export function TrainingSection({ data }: TrainingSectionProps) {
  if (!data) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No training protocol yet"
        description="Your provider will add training guidelines here"
      />
    );
  }

  const hasFrequency = data.frequency;
  const hasFocus = data.focus && data.focus.length > 0;
  const hasExercises = data.exercises && data.exercises.length > 0;
  const hasContent = hasFrequency || hasFocus || hasExercises || data.generalNotes;

  if (!hasContent) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No training protocol yet"
        description="Your provider will add training guidelines here"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview - Frequency and Focus */}
      {(hasFrequency || hasFocus) && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-blue-500" />
              Training Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasFrequency && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frequency</p>
                <p className="text-lg font-semibold">{data.frequency}</p>
              </div>
            )}
            {hasFocus && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {data.focus!.map((area, index) => (
                    <Badge key={index} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      {hasExercises && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-emerald-500" />
              Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.exercises!.map((exercise, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{exercise.name}</p>
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{exercise.notes}</p>
                    )}
                  </div>
                  {(exercise.sets || exercise.reps) && (
                    <div className="flex items-center gap-2 text-sm">
                      {exercise.sets && (
                        <Badge variant="outline">{exercise.sets} sets</Badge>
                      )}
                      {exercise.reps && (
                        <Badge variant="outline">{exercise.reps} reps</Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Notes */}
      {data.generalNotes && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.generalNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
