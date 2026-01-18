'use client';

import { Pill } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { MedicationItem } from './medication-item';
import type { PrescriptionItem } from '@/types/treatment-plan';

interface PrescriptionsSectionProps {
  data: PrescriptionItem[] | null | undefined;
}

export function PrescriptionsSection({ data }: PrescriptionsSectionProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Pill}
        title="No prescriptions yet"
        description="Your prescriptions will appear here when prescribed"
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
          instructions={item.instructions}
        />
      ))}
    </div>
  );
}
