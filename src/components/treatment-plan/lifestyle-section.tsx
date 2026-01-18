'use client';

import { Bed, Brain, Heart, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import type { LifestyleData } from '@/types/treatment-plan';

interface LifestyleSectionProps {
  data: LifestyleData | null | undefined;
}

export function LifestyleSection({ data }: LifestyleSectionProps) {
  if (!data) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No lifestyle recommendations yet"
        description="Your provider will add recommendations here"
      />
    );
  }

  const hasSleep = data.sleep?.recommendation;
  const hasStress = data.stress?.recommendation;
  const hasHabits = data.habits && data.habits.length > 0;
  const hasContent = hasSleep || hasStress || hasHabits || data.generalNotes;

  if (!hasContent) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No lifestyle recommendations yet"
        description="Your provider will add recommendations here"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Sleep Recommendations */}
      {hasSleep && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bed className="h-5 w-5 text-indigo-500" />
              Sleep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">{data.sleep!.recommendation}</p>
            {data.sleep!.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                {data.sleep!.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stress Management */}
      {hasStress && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-purple-500" />
              Stress Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">{data.stress!.recommendation}</p>
            {data.stress!.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                {data.stress!.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Habits */}
      {hasHabits && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-rose-500" />
              Daily Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.habits!.map((habit, index) => (
                <li key={index} className="space-y-1">
                  <p className="text-sm">{habit.recommendation}</p>
                  {habit.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                      {habit.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
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
