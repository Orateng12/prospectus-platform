import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/requireAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin — Prospectus Platform',
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

export default async function AdminPage() {
  const auth = await requireAuth();
  if (!auth.ok) redirect('/login');

  const email = auth.user.email ?? '';
  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) redirect('/dashboard');

  return <AdminDashboard />;
}
