import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';

export default async function Home() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      redirect('/admin');
    case 'provider':
      redirect('/provider');
    case 'patient':
    default:
      redirect('/patient');
  }
}
