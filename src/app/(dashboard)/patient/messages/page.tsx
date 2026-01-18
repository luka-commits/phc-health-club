import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { MessageSquare } from 'lucide-react';

export default async function MessagesPage() {
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
        title="Messages"
        description="Communicate securely with your healthcare team"
      />

      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={MessageSquare}
            title="Messaging Coming Soon"
            description="Secure messaging with your providers will be available soon."
          />
        </CardContent>
      </Card>
    </div>
  );
}
