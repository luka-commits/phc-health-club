import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { User, MapPin, Bell, Shield } from 'lucide-react';

import { ProfileForm } from './profile-form';
import { AddressForm } from './address-form';
import type { Patient, Address } from '@/types/database';

export default async function SettingsPage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  const supabase = await createClient();

  // Get patient record
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm user={user} patient={patient as Patient | null} />
        </TabsContent>

        <TabsContent value="addresses">
          <div className="grid gap-6 md:grid-cols-2">
            <AddressForm
              type="shipping"
              address={(patient?.shipping_address as Address) || null}
              title="Shipping Address"
              description="Where your medications will be delivered"
            />
            <AddressForm
              type="billing"
              address={(patient?.billing_address as Address) || null}
              title="Billing Address"
              description="Address associated with your payment method"
            />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified before your appointments
                  </p>
                </div>
                <Button variant="outline" size="sm">Email & SMS</Button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Refill Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when refills are due
                  </p>
                </div>
                <Button variant="outline" size="sm">Email & SMS</Button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Blood Work Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when blood work is due
                  </p>
                </div>
                <Button variant="outline" size="sm">Email & SMS</Button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">New Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive a message
                  </p>
                </div>
                <Button variant="outline" size="sm">Email Only</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
