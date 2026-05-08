import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name, province')
    .eq('id', user.id)
    .single();

  // Pre-fill name from profile or auth metadata
  const firstName =
    profile?.first_name ??
    (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    '';
  const lastName =
    profile?.last_name ??
    (user.user_metadata?.full_name as string | undefined)?.split(' ').slice(1).join(' ') ??
    '';

  return (
    <OnboardingWizard
      initialFirstName={firstName}
      initialLastName={lastName}
    />
  );
}
