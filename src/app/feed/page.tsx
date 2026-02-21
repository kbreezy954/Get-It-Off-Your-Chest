import { createClient } from '@/lib/supabase/server';
import { InFeedAdBanner } from '@/components/ad-banners';
import { PostCard, scorePost } from '@/components/post-card';

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('id,title,content,category,upvotes_count,downvotes_count,created_at,is_anonymous,users(username)')
    .order('created_at', { ascending: false })
    .limit(50);

  const trending = (posts ?? []).sort((a, b) => scorePost(b) - scorePost(a));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Trending vents</h2>
      {trending.map((post, index) => (
        <div key={post.id}>
          <PostCard post={post} />
          {(index + 1) % 4 === 0 && <InFeedAdBanner />}
        </div>
      ))}
    </div>
  );
}
