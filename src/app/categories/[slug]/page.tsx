import { createClient } from '@/lib/supabase/server';
import { PostCard } from '@/components/post-card';
import { AffiliateBanner } from '@/components/ad-banners';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('id,title,content,category,upvotes_count,downvotes_count,created_at,is_anonymous,users(username)')
    .eq('category', category)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-accent">{category}</h2>
      <AffiliateBanner />
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
