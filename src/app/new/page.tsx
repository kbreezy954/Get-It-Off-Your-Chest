import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewPostForm } from '@/components/forms';

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('is_banned').eq('id', user.id).single();
  if (profile?.is_banned) redirect('/feed');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Create a new vent</h2>
      <NewPostForm />
    </div>
  );
}
