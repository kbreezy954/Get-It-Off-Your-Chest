import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAnalytics } from '@/lib/analytics';

async function toggleBan(userId: string, banned: boolean) {
  'use server';

  const supabase = await createClient();

  await (supabase as any)
    .from('users')
    .update({ is_banned: banned })
    .eq('id', userId);
}

async function deletePost(postId: string) {
  'use server';
  const supabase = await createClient();
  await supabase.from('posts').delete().eq('id', postId);
}

async function deleteComment(commentId: string) {
  'use server';
  const supabase = await createClient();
  await supabase.from('comments').delete().eq('id', commentId);
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!me?.is_admin) redirect('/feed');

  const [{ data: users }, { data: reports }, { data: posts }, { data: comments }, stats] = await Promise.all([
    supabase.from('users').select('id,username,email,strike_count,is_banned').order('created_at', { ascending: false }),
    supabase.from('reports').select('id,reason,reported_post_id,reported_user_id,created_at').order('created_at', { ascending: false }),
    supabase.from('posts').select('id,title,category').order('created_at', { ascending: false }).limit(20),
    supabase.from('comments').select('id,content').order('created_at', { ascending: false }).limit(20),
    getAnalytics()
  ]);

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-semibold text-accent">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Users: {stats.totalUsers} · Posts: {stats.totalPosts} · Active 7d: {stats.activeUsers} · Reports: {stats.reportCount}
        </p>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Users / Strikes</h2>
        {users?.map((entry) => (
          <div className="flex items-center justify-between text-sm" key={entry.id}>
            <span>@{entry.username} ({entry.email}) · strikes: {entry.strike_count}</span>
            <form action={toggleBan.bind(null, entry.id, !entry.is_banned)}>
              <button className="btn-secondary">{entry.is_banned ? 'Unban' : 'Ban'}</button>
            </form>
          </div>
        ))}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Reported posts</h2>
        {reports?.map((report) => <p key={report.id} className="text-sm text-zinc-300">{report.reason} · post {report.reported_post_id}</p>)}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Delete posts</h2>
        {posts?.map((post) => (
          <div className="flex justify-between" key={post.id}>
            <span className="text-sm">{post.title} ({post.category})</span>
            <form action={deletePost.bind(null, post.id)}><button className="btn-secondary">Delete</button></form>
          </div>
        ))}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Delete comments</h2>
        {comments?.map((comment) => (
          <div className="flex justify-between" key={comment.id}>
            <span className="line-clamp-1 text-sm">{comment.content}</span>
            <form action={deleteComment.bind(null, comment.id)}><button className="btn-secondary">Delete</button></form>
          </div>
        ))}
      </section>
    </div>
  );
}
