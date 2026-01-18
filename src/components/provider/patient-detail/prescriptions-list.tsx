'use client';

import { format } from 'date-fns';
import { Pill, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Prescription, Product } from '@/types/database';

interface PrescriptionWithProduct extends Prescription {
  products?: Product | null;
}

interface PrescriptionsListProps {
  prescriptions: PrescriptionWithProduct[];
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'paused':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function getTypeVariant(type: string): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'rx':
      return 'default';
    case 'peptide':
      return 'secondary';
    case 'supplement':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function PrescriptionsList({ prescriptions }: PrescriptionsListProps) {
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription>All prescription records for this patient</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Pill}
            title="No Prescriptions"
            description="This patient has no prescription records."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescriptions</CardTitle>
        <CardDescription>
          {prescriptions.length} prescription record{prescriptions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="hidden md:table-cell">Pharmacy</TableHead>
                <TableHead className="hidden lg:table-cell">Next Refill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Auto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx) => (
                <TableRow key={rx.id}>
                  <TableCell className="font-medium">
                    {rx.products?.name || 'Unknown Product'}
                    {rx.instructions && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {rx.instructions}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(rx.products?.type || 'rx')}>
                      {rx.products?.type || 'rx'}
                    </Badge>
                  </TableCell>
                  <TableCell>{rx.dosage}</TableCell>
                  <TableCell>{rx.quantity}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {rx.pharmacy || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {rx.refill_date
                      ? format(new Date(rx.refill_date), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(rx.status)}>
                      {rx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {rx.auto_refill && (
                      <span title="Auto-refill enabled">
                        <RefreshCw className="h-4 w-4 text-green-500" />
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
