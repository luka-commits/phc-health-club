'use client';

import { FlaskConical } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { MedicationItem } from './medication-item';
import type { PeptideItem } from '@/types/treatment-plan';

interface PeptidesSectionProps {
  data: PeptideItem[] | null | undefined;
}

export function PeptidesSection({ data }: PeptidesSectionProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No peptide therapy yet"
        description="Your peptide protocol will appear here when prescribed"
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
          injectionSite={item.injectionSite}
          instructions={item.instructions}
        />
      ))}
    </div>
  );
}
