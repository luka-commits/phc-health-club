import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { CreditCard, Receipt, Settings } from 'lucide-react';

export default async function BillingPage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Payments"
        description="Manage your payment methods and view billing history"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your saved payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CreditCard}
              title="No Payment Methods"
              description="Add a payment method to enable auto-refills and easy checkout."
            >
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </EmptyState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Billing Settings
            </CardTitle>
            <CardDescription>
              Configure auto-pay and billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Pay</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically charge for refills
                  </p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Receipts</p>
                  <p className="text-sm text-muted-foreground">
                    Receive receipts via email
                  </p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View past transactions and download receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Receipt}
            title="No Billing History"
            description="Your transactions will appear here once you make a purchase."
          />
        </CardContent>
      </Card>
    </div>
  );
}
