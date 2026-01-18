export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';
import { DashboardHeader } from '@/components/shared/dashboard-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <DashboardSidebar role={user.role} />
      <SidebarInset>
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
