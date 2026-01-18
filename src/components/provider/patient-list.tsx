'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { Users, Search, ChevronRight, ChevronLeft } from 'lucide-react';

// Type definitions
export interface PatientListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  intakeCompleted: boolean;
  treatmentPlanStatus: string | null;
  lastUpdated: string;
}

export interface PatientListProps {
  patients: PatientListItem[];
  showAllPatients: boolean;
}

type SortOrder = 'alphabetical' | 'newest' | 'oldest';

const ITEMS_PER_PAGE = 10;

export function PatientList({ patients, showAllPatients }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('alphabetical');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, sortOrder]);

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients];

    // Apply search filter
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query)
      );
    }

    // Apply sort
    switch (sortOrder) {
      case 'alphabetical':
        result.sort((a, b) => {
          const lastNameCompare = a.lastName.localeCompare(b.lastName);
          if (lastNameCompare !== 0) return lastNameCompare;
          return a.firstName.localeCompare(b.firstName);
        });
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
        break;
    }

    return result;
  }, [patients, debouncedQuery, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredAndSortedPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredAndSortedPatients.length === patients.length
          ? `Showing ${filteredAndSortedPatients.length} patient${filteredAndSortedPatients.length !== 1 ? 's' : ''}`
          : `Showing ${filteredAndSortedPatients.length} of ${patients.length} patients`}
        {showAllPatients && ' (all patients)'}
      </p>

      {/* Patient List */}
      {paginatedPatients.length > 0 ? (
        <div className="grid gap-4">
          {paginatedPatients.map((patient) => {
            const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
            return (
              <Link key={patient.id} href={`/provider/patients/${patient.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={patient.avatarUrl || undefined} />
                      <AvatarFallback>{initials || '??'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {patient.firstName} {patient.lastName}
                        </p>
                        {!patient.intakeCompleted && (
                          <Badge variant="secondary">Intake Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.email}
                      </p>
                      {patient.phone && (
                        <p className="text-sm text-muted-foreground">
                          {patient.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {patient.treatmentPlanStatus ? (
                        <Badge variant={patient.treatmentPlanStatus === 'active' ? 'default' : 'secondary'}>
                          {patient.treatmentPlanStatus}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Plan</Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {new Date(patient.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            {debouncedQuery.trim() && patients.length > 0 ? (
              <EmptyState
                icon={Search}
                title="No patients match your search"
                description="Try adjusting your search term."
              />
            ) : (
              <EmptyState
                icon={Users}
                title="No Patients Assigned"
                description="Patients will appear here once they are assigned to you."
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
