'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { manualEntrySchema, ManualEntryInput } from '@/lib/validations/blood-work';
import { saveManualBloodWork } from '@/lib/actions/blood-work';
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
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle } from 'lucide-react';

interface ManualEntryFormProps {
  patientId: string;
}

export function ManualEntryForm({ patientId }: ManualEntryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ManualEntryInput>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      lab_source: 'quest',
      notes: '',
      biomarkers: [{ name: '', value: 0, unit: '', reference_low: null, reference_high: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'biomarkers',
  });

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const onSubmit = async (data: ManualEntryInput) => {
    setIsSubmitting(true);
    try {
      const result = await saveManualBloodWork(data);
      if (result.success) {
        setSuccess(true);
        toast.success('Blood work saved successfully');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Entry Saved</h3>
        <p className="mb-4 text-muted-foreground">
          Your blood work has been saved successfully.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/patient/blood-work')}>
            View Blood Work
          </Button>
          <Button
            onClick={() => {
              setSuccess(false);
              reset();
              setExpandedRows(new Set());
            }}
          >
            Add Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Date and Lab Source */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date of Lab Work</Label>
          <Input type="date" id="date" {...register('date')} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lab_source">Lab Provider</Label>
          <Select
            defaultValue="quest"
            onValueChange={(value) => setValue('lab_source', value as 'quest' | 'labcorp' | 'other')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lab provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quest">Quest Diagnostics</SelectItem>
              <SelectItem value="labcorp">LabCorp</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.lab_source && (
            <p className="text-sm text-destructive">{errors.lab_source.message}</p>
          )}
        </div>
      </div>

      {/* Biomarkers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Biomarkers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ name: '', value: 0, unit: '', reference_low: null, reference_high: null })
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Biomarker
          </Button>
        </div>

        {errors.biomarkers?.root && (
          <p className="text-sm text-destructive">{errors.biomarkers.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-card p-4"
            >
              {/* Main row */}
              <div className="grid gap-3 sm:grid-cols-[1fr_100px_80px_auto]">
                <div className="space-y-1">
                  <Label htmlFor={`biomarkers.${index}.name`} className="text-xs text-muted-foreground">
                    Name
                  </Label>
                  <Input
                    id={`biomarkers.${index}.name`}
                    placeholder="e.g., Testosterone"
                    {...register(`biomarkers.${index}.name`)}
                  />
                  {errors.biomarkers?.[index]?.name && (
                    <p className="text-xs text-destructive">
                      {errors.biomarkers[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`biomarkers.${index}.value`} className="text-xs text-muted-foreground">
                    Value
                  </Label>
                  <Input
                    id={`biomarkers.${index}.value`}
                    type="number"
                    step="any"
                    placeholder="0"
                    {...register(`biomarkers.${index}.value`, { valueAsNumber: true })}
                  />
                  {errors.biomarkers?.[index]?.value && (
                    <p className="text-xs text-destructive">
                      {errors.biomarkers[index]?.value?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`biomarkers.${index}.unit`} className="text-xs text-muted-foreground">
                    Unit
                  </Label>
                  <Input
                    id={`biomarkers.${index}.unit`}
                    placeholder="ng/dL"
                    {...register(`biomarkers.${index}.unit`)}
                  />
                  {errors.biomarkers?.[index]?.unit && (
                    <p className="text-xs text-destructive">
                      {errors.biomarkers[index]?.unit?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpanded(index)}
                    title="Reference range"
                  >
                    {expandedRows.has(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded reference range */}
              {expandedRows.has(index) && (
                <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor={`biomarkers.${index}.reference_low`}
                      className="text-xs text-muted-foreground"
                    >
                      Reference Low
                    </Label>
                    <Input
                      id={`biomarkers.${index}.reference_low`}
                      type="number"
                      step="any"
                      placeholder="Optional"
                      {...register(`biomarkers.${index}.reference_low`, {
                        setValueAs: (v) => (v === '' ? null : parseFloat(v)),
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`biomarkers.${index}.reference_high`}
                      className="text-xs text-muted-foreground"
                    >
                      Reference High
                    </Label>
                    <Input
                      id={`biomarkers.${index}.reference_high`}
                      type="number"
                      step="any"
                      placeholder="Optional"
                      {...register(`biomarkers.${index}.reference_high`, {
                        setValueAs: (v) => (v === '' ? null : parseFloat(v)),
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about this lab work..."
          {...register('notes')}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Blood Work'
        )}
      </Button>
    </form>
  );
}
