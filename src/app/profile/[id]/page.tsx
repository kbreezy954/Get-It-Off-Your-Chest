import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function updateProfile(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const username = String(formData.get('username') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const avatar = formData.get('avatar') as File | null;

  let avatar_url: string | undefined;
  if (avatar && avatar.size > 0) {
    const path = `${user.id}/${Date.now()}-${avatar.name}`;
    await supabase.storage.from('avatars').upload(path, avatar, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    avatar_url = data.publicUrl;
  }

  await supabase.from('users').update({ username, bio, avatar_url }).eq('id', user.id);
}

async function followUser(targetId: string) {
  'use server';
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user || user.id === targetId) return;
  await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
}

async function blockUser(targetId: string) {
  'use server';
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user || user.id === targetId) return;
  await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetId });
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('users').select('*').eq('id', id).single();
  if (!profile) redirect('/feed');

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        {profile.avatar_url && <Image src={profile.avatar_url} alt="avatar" width={72} height={72} className="rounded-full" />}
        <h1 className="text-xl font-semibold">@{profile.username}</h1>
        <p className="text-sm text-zinc-300">{profile.bio || 'No bio yet.'}</p>
        {currentUser && currentUser.id !== id && (
          <div className="flex gap-2">
            <form action={followUser.bind(null, id)}><button className="btn-secondary">Follow</button></form>
            <form action={blockUser.bind(null, id)}><button className="btn-secondary">Block</button></form>
          </div>
        )}
      </section>
      {currentUser?.id === id && (
        <form action={updateProfile} className="card space-y-3">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <input className="input" name="username" defaultValue={profile.username} required />
          <textarea className="input" name="bio" defaultValue={profile.bio ?? ''} maxLength={160} />
          <input className="input" name="avatar" type="file" accept="image/*" />
          <button className="btn" type="submit">Save profile</button>
        </form>
      )}
    </div>
  );
}
