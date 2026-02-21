import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
      <Link className="text-lg font-semibold text-accent" href="/">
        Get It Off Your Chest
      </Link>
      <div className="flex gap-3 text-sm text-zinc-300">
        <Link href="/feed">Feed</Link>
        <Link href="/new">New Post</Link>
        <Link href="/messages">Messages</Link>
        <Link href="/admin">Admin</Link>
        {user ? <Link href={`/profile/${user.id}`}>Profile</Link> : <Link href="/login">Login</Link>}
      </div>
    </nav>
  );
}
