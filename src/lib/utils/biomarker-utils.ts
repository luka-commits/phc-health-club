import { format } from 'date-fns';
import type { BloodWork, BiomarkerValue } from '@/types/database';

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface TrendChange {
  direction: 'up' | 'down' | 'stable';
  percent: number;
}

/**
 * Transform blood_work records into chart-ready format for a specific biomarker.
 * Returns data points sorted by date ascending.
 */
export function getBiomarkerTrend(
  records: BloodWork[],
  biomarkerKey: string
): ChartDataPoint[] {
  return records
    .filter((r) => r.biomarkers && r.biomarkers[biomarkerKey])
    .map((r) => ({
      date: format(new Date(r.date), 'MMM yyyy'),
      value: (r.biomarkers![biomarkerKey] as BiomarkerValue).value,
      rawDate: new Date(r.date).getTime(),
    }))
    .sort((a, b) => a.rawDate - b.rawDate)
    .map(({ date, value }) => ({ date, value }));
}

/**
 * Extract unique biomarker names from all records.
 */
export function getUniqueBiomarkers(records: BloodWork[]): string[] {
  const biomarkers = new Set<string>();
  records.forEach((r) => {
    if (r.biomarkers) {
      Object.keys(r.biomarkers).forEach((k) => biomarkers.add(k));
    }
  });
  return Array.from(biomarkers).sort();
}

/**
 * Calculate percentage change between two values.
 * Returns 'stable' if change is less than 2%.
 */
export function calculateTrendChange(
  current: number,
  previous: number
): TrendChange {
  if (previous === 0) {
    return { direction: 'stable', percent: 0 };
  }

  const percentChange = ((current - previous) / previous) * 100;
  const absChange = Math.abs(percentChange);

  if (absChange < 2) {
    return { direction: 'stable', percent: absChange };
  }

  return {
    direction: percentChange > 0 ? 'up' : 'down',
    percent: absChange,
  };
}

/**
 * Determine if a biomarker value is within reference range.
 * Returns null if reference range is not available.
 */
export function getBiomarkerStatus(
  value: number,
  refLow: number | null,
  refHigh: number | null
): 'normal' | 'low' | 'high' | null {
  if (refLow === null && refHigh === null) {
    return null;
  }

  if (refLow !== null && value < refLow) {
    return 'low';
  }

  if (refHigh !== null && value > refHigh) {
    return 'high';
  }

  return 'normal';
}
