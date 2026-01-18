'use client';

import { useState } from 'react';
import { format, differenceInYears } from 'date-fns';
import { Edit, User as UserIcon, MapPin, Shield, Calendar, Mail, Phone } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EditPatientDialog } from './edit-patient-dialog';
import type { Patient, User, Address } from '@/types/database';

interface PatientInfoCardProps {
  patient: Patient & { user: User };
  canEdit: boolean;
}

function formatAddress(address: Address | null): string {
  if (!address) return '';
  const parts = [
    address.street,
    address.city,
    `${address.state} ${address.zip}`,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

function formatPhone(phone: string | null): string {
  if (!phone) return '';
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function areAddressesEqual(a: Address | null, b: Address | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.street === b.street &&
    a.city === b.city &&
    a.state === b.state &&
    a.zip === b.zip &&
    a.country === b.country
  );
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase() || 'P';
}

export function PatientInfoCard({ patient, canEdit }: PatientInfoCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const memberSince = format(new Date(patient.created_at), 'MMMM d, yyyy');

  const hasInsurance = patient.insurance_info && Object.keys(patient.insurance_info).length > 0;
  const insuranceProvider = patient.insurance_info?.provider_name as string | undefined;
  const policyNumber = patient.insurance_info?.policy_number as string | undefined;
  const groupNumber = patient.insurance_info?.group_number as string | undefined;

  const billingIsSameAsShipping = areAddressesEqual(
    patient.shipping_address,
    patient.billing_address
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Patient personal details</CardDescription>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={patient.user.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(patient.user.first_name, patient.user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {patient.user.first_name} {patient.user.last_name}
                </h3>
                <Badge variant={patient.intake_completed ? 'default' : 'secondary'}>
                  {patient.intake_completed ? 'Intake Complete' : 'Intake Pending'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{patient.user.email}</span>
              </div>

              {patient.user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPhone(patient.user.phone)}</span>
                </div>
              )}

              {patient.date_of_birth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(patient.date_of_birth), 'MMMM d, yyyy')}
                    {age !== null && <span className="text-muted-foreground"> ({age} years old)</span>}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance Information
            </CardTitle>
            <CardDescription>Health insurance details</CardDescription>
          </CardHeader>
          <CardContent>
            {hasInsurance ? (
              <div className="space-y-3">
                {insuranceProvider && (
                  <div>
                    <span className="text-sm font-medium">Provider</span>
                    <p className="text-sm text-muted-foreground">{insuranceProvider}</p>
                  </div>
                )}
                {policyNumber && (
                  <div>
                    <span className="text-sm font-medium">Policy Number</span>
                    <p className="text-sm text-muted-foreground">{policyNumber}</p>
                  </div>
                )}
                {groupNumber && (
                  <div>
                    <span className="text-sm font-medium">Group Number</span>
                    <p className="text-sm text-muted-foreground">{groupNumber}</p>
                  </div>
                )}
                {!insuranceProvider && !policyNumber && !groupNumber && (
                  <p className="text-sm text-muted-foreground">
                    Insurance information is available but not in expected format
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No insurance information on file</p>
            )}
          </CardContent>
        </Card>

        {/* Addresses Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
            <CardDescription>Shipping and billing addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium">Shipping Address</h4>
                {patient.shipping_address ? (
                  <p className="text-sm text-muted-foreground">
                    {formatAddress(patient.shipping_address)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipping address on file</p>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Billing Address</h4>
                {patient.billing_address ? (
                  billingIsSameAsShipping ? (
                    <p className="text-sm text-muted-foreground">Same as shipping address</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {formatAddress(patient.billing_address)}
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">No billing address on file</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditPatientDialog
        patient={patient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
