'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { TestTube, FileText, Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { BloodWork, BiomarkerValue } from '@/types/database';

interface BloodWorkTabProps {
  bloodWorkRecords: BloodWork[];
}

export function BloodWorkTab({ bloodWorkRecords }: BloodWorkTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  const toggleRecord = (id: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecords(newExpanded);
  };

  // Filter records by biomarker search
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return bloodWorkRecords;

    return bloodWorkRecords.filter((record) => {
      if (!record.biomarkers) return false;
      return Object.keys(record.biomarkers).some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [bloodWorkRecords, searchTerm]);

  if (!bloodWorkRecords || bloodWorkRecords.length === 0) {
    return (
      <EmptyState
        icon={TestTube}
        title="No Blood Work Records"
        description="This patient has no blood work records on file."
      />
    );
  }

  // Calculate summary stats
  const totalRecords = bloodWorkRecords.length;
  const dateRange = {
    oldest: bloodWorkRecords[bloodWorkRecords.length - 1]?.date,
    newest: bloodWorkRecords[0]?.date,
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Blood Work Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Recent</p>
              <p className="font-medium">
                {dateRange.newest
                  ? format(new Date(dateRange.newest), 'MMM d, yyyy')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="text-sm">
                {dateRange.oldest && dateRange.newest
                  ? `${format(new Date(dateRange.oldest), 'MMM yyyy')} - ${format(new Date(dateRange.newest), 'MMM yyyy')}`
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search biomarkers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No records found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id}>
              <Collapsible
                open={expandedRecords.has(record.id)}
                onOpenChange={() => toggleRecord(record.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {format(new Date(record.date), 'MMMM d, yyyy')}
                        </p>
                        <Badge variant="outline" className="capitalize">
                          {record.lab_source}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.pdf_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={record.pdf_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            PDF
                          </a>
                        </Button>
                      )}
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedRecords.has(record.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  {/* Quick preview of top 4 biomarkers */}
                  {record.biomarkers && Object.keys(record.biomarkers).length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                      {Object.entries(record.biomarkers)
                        .slice(0, 4)
                        .map(([name, data]) => {
                          const biomarker = data as BiomarkerValue;
                          return (
                            <div key={name} className="rounded-lg border p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium truncate">{name}</span>
                                {biomarker.flag && (
                                  <Badge
                                    variant={
                                      biomarker.flag === 'high'
                                        ? 'destructive'
                                        : biomarker.flag === 'low'
                                        ? 'secondary'
                                        : 'default'
                                    }
                                    className="text-xs"
                                  >
                                    {biomarker.flag === 'high' && <TrendingUp className="mr-1 h-3 w-3" />}
                                    {biomarker.flag === 'low' && <TrendingDown className="mr-1 h-3 w-3" />}
                                    {biomarker.flag === 'normal' && <Minus className="mr-1 h-3 w-3" />}
                                    {biomarker.flag}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-bold">
                                {biomarker.value}{' '}
                                <span className="text-xs font-normal text-muted-foreground">
                                  {biomarker.unit}
                                </span>
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-4">
                    {record.biomarkers && Object.keys(record.biomarkers).length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="font-medium">All Biomarkers</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(record.biomarkers).map(([name, data]) => {
                            const biomarker = data as BiomarkerValue;
                            return (
                              <div key={name} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{name}</span>
                                  {biomarker.flag && (
                                    <Badge
                                      variant={
                                        biomarker.flag === 'high'
                                          ? 'destructive'
                                          : biomarker.flag === 'low'
                                          ? 'secondary'
                                          : 'default'
                                      }
                                      className="text-xs"
                                    >
                                      {biomarker.flag}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-lg font-bold">
                                  {biomarker.value}{' '}
                                  <span className="text-sm font-normal text-muted-foreground">
                                    {biomarker.unit}
                                  </span>
                                </p>
                                {biomarker.reference_low !== null && biomarker.reference_high !== null && (
                                  <p className="text-xs text-muted-foreground">
                                    Reference: {biomarker.reference_low} - {biomarker.reference_high}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No biomarker data available</p>
                    )}

                    {record.notes && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {record.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
