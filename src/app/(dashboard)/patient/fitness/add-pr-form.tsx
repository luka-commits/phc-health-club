'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createPersonalRecord } from '@/lib/actions/personal-records';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LiftType } from '@/types/database';

const LIFT_OPTIONS: { value: LiftType; label: string }[] = [
  { value: 'squat', label: 'Squat' },
  { value: 'bench_press', label: 'Bench Press' },
  { value: 'deadlift', label: 'Deadlift' },
  { value: 'overhead_press', label: 'Overhead Press' },
  { value: 'barbell_row', label: 'Barbell Row' },
  { value: 'pull_up', label: 'Pull-up' },
  { value: 'other', label: 'Other' },
];

export function AddPRForm() {
  const [isPending, startTransition] = useTransition();

  // Form state
  const [liftType, setLiftType] = useState<LiftType | ''>('');
  const [weightLbs, setWeightLbs] = useState('');
  const [reps, setReps] = useState('');
  const [recordedAt, setRecordedAt] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!liftType) {
      toast.error('Please select a lift type');
      return;
    }

    if (!weightLbs || parseFloat(weightLbs) <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    if (!reps || parseInt(reps) <= 0) {
      toast.error('Please enter a valid number of reps');
      return;
    }

    startTransition(async () => {
      const result = await createPersonalRecord({
        liftType: liftType as LiftType,
        weightLbs: parseFloat(weightLbs),
        reps: parseInt(reps),
        recordedAt,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success('PR added successfully');
        // Reset form fields except date
        setLiftType('');
        setWeightLbs('');
        setReps('');
        setNotes('');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Lift Type */}
      <div className="space-y-2">
        <Label htmlFor="lift-type">Lift</Label>
        <Select value={liftType} onValueChange={(v) => setLiftType(v as LiftType)}>
          <SelectTrigger id="lift-type">
            <SelectValue placeholder="Select lift type" />
          </SelectTrigger>
          <SelectContent>
            {LIFT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Weight and Reps Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            step="0.5"
            min="0"
            placeholder="e.g., 225"
            value={weightLbs}
            onChange={(e) => setWeightLbs(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            type="number"
            step="1"
            min="1"
            placeholder="e.g., 5"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="recorded-at">Date</Label>
        <Input
          id="recorded-at"
          type="date"
          value={recordedAt}
          onChange={(e) => setRecordedAt(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="pr-notes">Notes (optional)</Label>
        <Textarea
          id="pr-notes"
          placeholder="Any notes about this PR..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Adding...' : 'Add PR'}
      </Button>
    </form>
  );
}
