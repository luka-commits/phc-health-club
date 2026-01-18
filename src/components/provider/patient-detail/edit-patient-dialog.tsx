'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { updatePatientInfo } from '@/lib/actions/patients';
import type { Patient, User, Address } from '@/types/database';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Form validation schema
const editPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  shipping_street: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_zip: z.string().optional(),
  shipping_country: z.string().optional(),
  billing_street: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_zip: z.string().optional(),
  billing_country: z.string().optional(),
  same_billing_as_shipping: z.boolean(),
  insurance_provider_name: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  insurance_group_number: z.string().optional(),
});

type EditPatientForm = z.infer<typeof editPatientSchema>;

interface EditPatientDialogProps {
  patient: Patient & { user: User };
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function EditPatientDialog({ patient, open, onOpenChange }: EditPatientDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const sameBillingAsShipping = areAddressesEqual(
    patient.shipping_address,
    patient.billing_address
  );

  const form = useForm<EditPatientForm>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: {
      first_name: patient.user.first_name || '',
      last_name: patient.user.last_name || '',
      phone: patient.user.phone || '',
      date_of_birth: patient.date_of_birth || '',
      shipping_street: patient.shipping_address?.street || '',
      shipping_city: patient.shipping_address?.city || '',
      shipping_state: patient.shipping_address?.state || '',
      shipping_zip: patient.shipping_address?.zip || '',
      shipping_country: patient.shipping_address?.country || 'US',
      billing_street: patient.billing_address?.street || '',
      billing_city: patient.billing_address?.city || '',
      billing_state: patient.billing_address?.state || '',
      billing_zip: patient.billing_address?.zip || '',
      billing_country: patient.billing_address?.country || 'US',
      same_billing_as_shipping: sameBillingAsShipping,
      insurance_provider_name: (patient.insurance_info?.provider_name as string) || '',
      insurance_policy_number: (patient.insurance_info?.policy_number as string) || '',
      insurance_group_number: (patient.insurance_info?.group_number as string) || '',
    },
  });

  const watchSameBilling = form.watch('same_billing_as_shipping');

  async function onSubmit(data: EditPatientForm) {
    setIsPending(true);
    try {
      // Build shipping address
      let shippingAddress: Address | null = null;
      if (data.shipping_street && data.shipping_city && data.shipping_state && data.shipping_zip) {
        shippingAddress = {
          street: data.shipping_street,
          city: data.shipping_city,
          state: data.shipping_state.toUpperCase(),
          zip: data.shipping_zip,
          country: data.shipping_country || 'US',
        };
      }

      // Build billing address (if not same as shipping)
      let billingAddress: Address | null = null;
      if (!data.same_billing_as_shipping && data.billing_street && data.billing_city && data.billing_state && data.billing_zip) {
        billingAddress = {
          street: data.billing_street,
          city: data.billing_city,
          state: data.billing_state.toUpperCase(),
          zip: data.billing_zip,
          country: data.billing_country || 'US',
        };
      }

      // Build insurance info
      let insuranceInfo: Record<string, string> | null = null;
      if (data.insurance_provider_name || data.insurance_policy_number || data.insurance_group_number) {
        insuranceInfo = {};
        if (data.insurance_provider_name) insuranceInfo.provider_name = data.insurance_provider_name;
        if (data.insurance_policy_number) insuranceInfo.policy_number = data.insurance_policy_number;
        if (data.insurance_group_number) insuranceInfo.group_number = data.insurance_group_number;
      }

      const result = await updatePatientInfo({
        patientId: patient.id,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        insurance_info: insuranceInfo,
        same_billing_as_shipping: data.same_billing_as_shipping,
      });

      if (result.success) {
        toast.success('Patient information updated');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update patient');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient Information</DialogTitle>
          <DialogDescription>
            Update patient profile, addresses, and insurance information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="addresses" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Shipping Address</h4>
                  <FormField
                    control={form.control}
                    name="shipping_street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 grid-cols-2">
                    <FormField
                      control={form.control}
                      name="shipping_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shipping_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="NY"
                              maxLength={2}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="shipping_zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" maxLength={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="same_billing_as_shipping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Billing address same as shipping
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!watchSameBilling && (
                    <>
                      <h4 className="font-medium">Billing Address</h4>
                      <FormField
                        control={form.control}
                        name="billing_street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 grid-cols-2">
                        <FormField
                          control={form.control}
                          name="billing_city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="NY"
                                  maxLength={2}
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="billing_zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" maxLength={5} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="insurance_provider_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Blue Cross Blue Shield" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insurance_policy_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insurance_group_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Number</FormLabel>
                      <FormControl>
                        <Input placeholder="GRP12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
