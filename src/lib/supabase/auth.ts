import { createClient } from './server';
import type { User, UserRole } from '@/types/database';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getDBUser(): Promise<{ user: User | null; error: Error | null }> {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return { user: null, error: authError };
  }

  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  return { user: dbUser as User | null, error: dbError };
}

export async function getUserRole(): Promise<UserRole | null> {
  const { user } = await getDBUser();
  return user?.role ?? null;
}

export async function requireAuth() {
  const { user, error } = await getUser();
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const { user } = await getDBUser();
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}
