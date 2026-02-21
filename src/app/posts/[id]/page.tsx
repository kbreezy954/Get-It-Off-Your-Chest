import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function vote(postId: string, value: 1 | -1) {
  'use server';
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: existing } = await supabase.from('votes').select('value').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
  if (existing) return;

  await supabase.from('votes').insert({ post_id: postId, user_id: user.id, value });
  if (value === 1) await supabase.rpc('increment_post_upvote', { post_id_input: postId });
  if (value === -1) await supabase.rpc('increment_post_downvote', { post_id_input: postId });
}

async function addComment(postId: string, formData: FormData) {
  'use server';
  const content = String(formData.get('content') ?? '');
  if (!content.trim()) return;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: content.slice(0, 500) });
}

async function reportPost(postId: string, formData: FormData) {
  'use server';
  const reason = String(formData.get('reason') ?? '');
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();

  await supabase.from('reports').insert({ reported_post_id: postId, reported_user_id: post?.user_id, reason: reason.slice(0, 240) });
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('id,title,content,category,is_anonymous,upvotes_count,downvotes_count,created_at,users(id,username)')
    .eq('id', id)
    .maybeSingle();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from('comments')
    .select('id,content,created_at,users(username)')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-4">
      <article className="card space-y-3">
        <div className="text-xs text-zinc-400">{post.category}</div>
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="whitespace-pre-wrap text-zinc-200">{post.content}</p>
        <p className="text-xs text-zinc-400">By {post.is_anonymous ? 'Anonymous' : post.users?.username}</p>
        <div className="flex gap-2">
          <form action={vote.bind(null, id, 1)}><button className="btn-secondary">▲ Upvote</button></form>
          <form action={vote.bind(null, id, -1)}><button className="btn-secondary">▼ Downvote</button></form>
        </div>
      </article>

      <form className="card space-y-3" action={addComment.bind(null, id)}>
        <h2 className="text-lg font-semibold">Comment</h2>
        <textarea className="input min-h-24" name="content" required maxLength={500} />
        <button className="btn" type="submit">Post comment</button>
      </form>

      <form className="card space-y-2" action={reportPost.bind(null, id)}>
        <h3 className="font-semibold">Report post</h3>
        <input className="input" name="reason" required placeholder="Reason" maxLength={240} />
        <button className="btn-secondary" type="submit">Submit report</button>
      </form>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Comments</h2>
        {comments?.map((comment) => (
          <article className="card" key={comment.id}>
            <p className="text-sm text-zinc-200">{comment.content}</p>
            <p className="mt-2 text-xs text-zinc-400">{comment.users?.username} · {new Date(comment.created_at).toLocaleString()}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
