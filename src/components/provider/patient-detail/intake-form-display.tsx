'use client';

import { ClipboardList, Check, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface IntakeFormDisplayProps {
  intakeData: Record<string, unknown> | null;
  intakeCompleted: boolean;
}

// Convert snake_case or camelCase to Title Case
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Check if a value looks like a date
function isDateString(value: string): boolean {
  const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/;
  return datePattern.test(value);
}

// Format a date string nicely
function formatDate(value: string): string {
  try {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

// Render a value based on its type
function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">Not provided</span>;
  }

  if (typeof value === 'boolean') {
    return value ? (
      <Badge variant="default" className="gap-1">
        <Check className="h-3 w-3" /> Yes
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <X className="h-3 w-3" /> No
      </Badge>
    );
  }

  if (typeof value === 'string') {
    if (!value.trim()) {
      return <span className="text-muted-foreground">Not provided</span>;
    }
    if (isDateString(value)) {
      return formatDate(value);
    }
    return value;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">None</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, index) => (
          <li key={index} className="text-sm">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="pl-4 border-l-2 space-y-2 mt-2">
        {Object.entries(value as Record<string, unknown>).map(([key, val]) => (
          <div key={key}>
            <span className="text-sm font-medium">{formatKey(key)}:</span>{' '}
            <span className="text-sm">{renderValue(val)}</span>
          </div>
        ))}
      </div>
    );
  }

  return String(value);
}

// Group entries by common prefixes or patterns
function groupEntries(data: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const groups: Record<string, Record<string, unknown>> = {
    'Personal Information': {},
    'Medical History': {},
    'Current Medications': {},
    Allergies: {},
    'Goals & Lifestyle': {},
    Other: {},
  };

  const keyPatterns: Record<string, string[]> = {
    'Personal Information': ['name', 'email', 'phone', 'address', 'dob', 'birth', 'contact', 'gender', 'sex'],
    'Medical History': ['medical', 'history', 'condition', 'diagnosis', 'surgery', 'hospital', 'disease'],
    'Current Medications': ['medication', 'drug', 'prescription', 'treatment', 'supplement'],
    Allergies: ['allergy', 'allergies', 'allergic', 'reaction'],
    'Goals & Lifestyle': ['goal', 'lifestyle', 'exercise', 'diet', 'sleep', 'stress', 'alcohol', 'smoking', 'tobacco'],
  };

  Object.entries(data).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    let placed = false;

    for (const [group, patterns] of Object.entries(keyPatterns)) {
      if (patterns.some((pattern) => lowerKey.includes(pattern))) {
        groups[group][key] = value;
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups['Other'][key] = value;
    }
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([, entries]) => Object.keys(entries).length > 0)
  );
}

export function IntakeFormDisplay({ intakeData, intakeCompleted }: IntakeFormDisplayProps) {
  if (!intakeCompleted) {
    return (
      <Alert>
        <ClipboardList className="h-4 w-4" />
        <AlertTitle>Intake Form Not Completed</AlertTitle>
        <AlertDescription>
          The patient has not yet completed their intake form.
        </AlertDescription>
      </Alert>
    );
  }

  if (!intakeData || Object.keys(intakeData).length === 0) {
    return (
      <Alert>
        <ClipboardList className="h-4 w-4" />
        <AlertTitle>No Intake Data</AlertTitle>
        <AlertDescription>
          The intake form was marked as complete but no data is available.
        </AlertDescription>
      </Alert>
    );
  }

  const groupedData = groupEntries(intakeData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Intake Form Responses
        </CardTitle>
        <CardDescription>Patient&apos;s answers from their initial intake form</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={Object.keys(groupedData)} className="space-y-2">
          {Object.entries(groupedData).map(([group, entries]) => (
            <AccordionItem key={group} value={group} className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                {group}
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(entries).length}
                </Badge>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {Object.entries(entries).map(([key, value]) => (
                    <div key={key} className="grid gap-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatKey(key)}
                      </span>
                      <div className="text-sm">{renderValue(value)}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
