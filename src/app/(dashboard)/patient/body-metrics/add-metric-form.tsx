'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createBodyMetric } from '@/lib/actions/body-metrics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function AddMetricForm() {
  const [isPending, startTransition] = useTransition();
  const [showCircumferences, setShowCircumferences] = useState(false);

  // Form state
  const [measuredAt, setMeasuredAt] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [weightLbs, setWeightLbs] = useState('');
  const [chestInches, setChestInches] = useState('');
  const [waistInches, setWaistInches] = useState('');
  const [hipInches, setHipInches] = useState('');
  const [armInches, setArmInches] = useState('');
  const [thighInches, setThighInches] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Check that at least one measurement is provided
    const hasValue =
      weightLbs ||
      chestInches ||
      waistInches ||
      hipInches ||
      armInches ||
      thighInches;

    if (!hasValue) {
      toast.error('Please enter at least one measurement');
      return;
    }

    startTransition(async () => {
      const result = await createBodyMetric({
        measuredAt,
        weightLbs: weightLbs ? parseFloat(weightLbs) : undefined,
        chestInches: chestInches ? parseFloat(chestInches) : undefined,
        waistInches: waistInches ? parseFloat(waistInches) : undefined,
        hipInches: hipInches ? parseFloat(hipInches) : undefined,
        armInches: armInches ? parseFloat(armInches) : undefined,
        thighInches: thighInches ? parseFloat(thighInches) : undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success('Measurement added successfully');
        // Reset form fields except date
        setWeightLbs('');
        setChestInches('');
        setWaistInches('');
        setHipInches('');
        setArmInches('');
        setThighInches('');
        setNotes('');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="measured-at">Date</Label>
        <Input
          id="measured-at"
          type="date"
          value={measuredAt}
          onChange={(e) => setMeasuredAt(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <Label htmlFor="weight">Weight (lbs)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="0"
          placeholder="e.g., 175.5"
          value={weightLbs}
          onChange={(e) => setWeightLbs(e.target.value)}
        />
      </div>

      {/* Circumferences (Collapsible) */}
      <Collapsible open={showCircumferences} onOpenChange={setShowCircumferences}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" className="w-full justify-between">
            Body Circumferences (optional)
            {showCircumferences ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chest">Chest (in)</Label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 42"
                value={chestInches}
                onChange={(e) => setChestInches(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist">Waist (in)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 34"
                value={waistInches}
                onChange={(e) => setWaistInches(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hip">Hip (in)</Label>
              <Input
                id="hip"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 40"
                value={hipInches}
                onChange={(e) => setHipInches(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arm">Arm (in)</Label>
              <Input
                id="arm"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 15"
                value={armInches}
                onChange={(e) => setArmInches(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thigh">Thigh (in)</Label>
              <Input
                id="thigh"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g., 24"
                value={thighInches}
                onChange={(e) => setThighInches(e.target.value)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any notes about this measurement..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Adding...' : 'Add Measurement'}
      </Button>
    </form>
  );
}
