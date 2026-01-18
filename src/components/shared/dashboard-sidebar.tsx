'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  TestTube,
  Package,
  Calendar,
  MessageSquare,
  Settings,
  Users,
  UserCog,
  ClipboardList,
  PillBottle,
  CreditCard,
  BarChart3,
  Bell,
  Notebook,
  Scale,
  Dumbbell,
  CalendarDays,
} from 'lucide-react';
import type { UserRole } from '@/types/database';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const patientNavigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/patient', icon: LayoutDashboard },
      { title: 'Treatment Plan', href: '/patient/treatment-plan', icon: FileText },
    ],
  },
  {
    label: 'Health',
    items: [
      { title: 'Blood Work', href: '/patient/blood-work', icon: TestTube },
      { title: 'Lab Schedule', href: '/patient/blood-work-schedule', icon: CalendarDays },
      { title: 'Products', href: '/patient/products', icon: Package },
      { title: 'Refill Schedule', href: '/patient/refills', icon: PillBottle },
    ],
  },
  {
    label: 'Tracking',
    items: [
      { title: 'Lifestyle Notes', href: '/patient/lifestyle', icon: Notebook },
      { title: 'Body Metrics', href: '/patient/body-metrics', icon: Scale },
      { title: 'Fitness', href: '/patient/fitness', icon: Dumbbell },
    ],
  },
  {
    label: 'Communication',
    items: [
      { title: 'Messages', href: '/patient/messages', icon: MessageSquare },
      { title: 'Appointments', href: '/patient/appointments', icon: Calendar },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Billing', href: '/patient/billing', icon: CreditCard },
      { title: 'Settings', href: '/patient/settings', icon: Settings },
    ],
  },
];

const providerNavigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/provider', icon: LayoutDashboard },
      { title: 'My Patients', href: '/provider/patients', icon: Users },
    ],
  },
  {
    label: 'Patient Care',
    items: [
      { title: 'Treatment Plans', href: '/provider/treatment-plans', icon: ClipboardList },
      { title: 'Blood Work', href: '/provider/blood-work', icon: TestTube },
      { title: 'Prescriptions', href: '/provider/prescriptions', icon: PillBottle },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { title: 'Calendar', href: '/provider/calendar', icon: Calendar },
      { title: 'Messages', href: '/provider/messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Settings', href: '/provider/settings', icon: Settings },
    ],
  },
];

const adminNavigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Users',
    items: [
      { title: 'Patients', href: '/admin/patients', icon: Users },
      { title: 'Providers', href: '/admin/providers', icon: UserCog },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Products', href: '/admin/products', icon: Package },
      { title: 'Appointments', href: '/admin/appointments', icon: Calendar },
      { title: 'Billing', href: '/admin/billing', icon: CreditCard },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Notifications', href: '/admin/notifications', icon: Bell },
      { title: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

const navigationByRole: Record<UserRole, NavGroup[]> = {
  patient: patientNavigation,
  provider: providerNavigation,
  admin: adminNavigation,
};

interface DashboardSidebarProps {
  role: UserRole;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const navigation = navigationByRole[role];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">PHC</span>
          </div>
          <span className="text-lg font-semibold">Health Club</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          PHC Health Club v1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
