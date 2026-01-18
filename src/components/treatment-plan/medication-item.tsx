'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Utensils, BedDouble, Clock, Syringe } from 'lucide-react';
import type { MedicationTiming } from '@/types/treatment-plan';

interface MedicationItemProps {
  name: string;
  dosage: string;
  frequency: string;
  timing: MedicationTiming;
  instructions?: string;
  injectionSite?: string;
  brand?: string;
}

const timingConfig: Record<MedicationTiming, { icon: typeof Sun; label: string; color: string }> = {
  morning: { icon: Sun, label: 'Morning', color: 'text-amber-500' },
  evening: { icon: Moon, label: 'Evening', color: 'text-indigo-500' },
  with_food: { icon: Utensils, label: 'With food', color: 'text-green-500' },
  before_bed: { icon: BedDouble, label: 'Before bed', color: 'text-purple-500' },
  as_directed: { icon: Clock, label: 'As directed', color: 'text-gray-500' },
};

export function MedicationItem({
  name,
  dosage,
  frequency,
  timing,
  instructions,
  injectionSite,
  brand,
}: MedicationItemProps) {
  const timingInfo = timingConfig[timing] || timingConfig.as_directed;
  const TimingIcon = timingInfo.icon;

  return (
    <Card className="py-4">
      <CardContent className="space-y-3">
        {/* Header with name and dosage */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-base leading-tight">{name}</h4>
          <Badge variant="secondary" className="shrink-0">
            {dosage}
          </Badge>
        </div>

        {/* Frequency and timing */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{frequency}</span>
          <span className="text-muted-foreground/30">|</span>
          <span className={`flex items-center gap-1.5 ${timingInfo.color}`}>
            <TimingIcon className="h-4 w-4" />
            {timingInfo.label}
          </span>
        </div>

        {/* Optional: Injection site */}
        {injectionSite && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Syringe className="h-4 w-4" />
            <span>Injection site: {injectionSite}</span>
          </div>
        )}

        {/* Optional: Brand */}
        {brand && (
          <p className="text-sm text-muted-foreground">
            Brand: <span className="font-medium">{brand}</span>
          </p>
        )}

        {/* Optional: Instructions */}
        {instructions && (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
            {instructions}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
