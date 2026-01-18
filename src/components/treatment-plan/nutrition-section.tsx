'use client';

import { Apple, Flame, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import type { NutritionData } from '@/types/treatment-plan';

interface NutritionSectionProps {
  data: NutritionData | null | undefined;
}

export function NutritionSection({ data }: NutritionSectionProps) {
  if (!data) {
    return (
      <EmptyState
        icon={Apple}
        title="No nutrition plan yet"
        description="Your provider will add nutrition guidelines here"
      />
    );
  }

  const hasMacros = data.calories || data.protein || data.carbs || data.fat;
  const hasGuidelines = data.guidelines && data.guidelines.length > 0;
  const hasRestrictions = data.restrictions && data.restrictions.length > 0;
  const hasContent = hasMacros || hasGuidelines || hasRestrictions || data.generalNotes;

  if (!hasContent) {
    return (
      <EmptyState
        icon={Apple}
        title="No nutrition plan yet"
        description="Your provider will add nutrition guidelines here"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Macro Targets */}
      {hasMacros && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-5 w-5 text-orange-500" />
              Daily Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.calories && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{data.calories}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Calories</p>
                </div>
              )}
              {data.protein && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{data.protein}g</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Protein</p>
                </div>
              )}
              {data.carbs && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{data.carbs}g</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Carbs</p>
                </div>
              )}
              {data.fat && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{data.fat}g</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Fat</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      {hasGuidelines && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.guidelines!.map((guideline, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-1">&#8226;</span>
                  {guideline}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Restrictions */}
      {hasRestrictions && (
        <Card className="py-4 border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.restrictions!.map((restriction, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-1">&#8226;</span>
                  {restriction}
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
