'use client';

import { Leaf } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { MedicationItem } from './medication-item';
import type { SupplementItem } from '@/types/treatment-plan';

interface SupplementsSectionProps {
  data: SupplementItem[] | null | undefined;
}

export function SupplementsSection({ data }: SupplementsSectionProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Leaf}
        title="No supplements yet"
        description="Your supplement recommendations will appear here"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((item, index) => (
        <MedicationItem
          key={`${item.name}-${index}`}
          name={item.name}
          dosage={item.dosage}
          frequency={item.frequency}
          timing={item.timing}
          brand={item.brand}
          instructions={item.instructions}
        />
      ))}
    </div>
  );
}
