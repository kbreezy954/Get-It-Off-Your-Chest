import { createClient } from '@/lib/supabase/server';

export async function getAnalytics() {
  const supabase = await createClient();

  const [{ count: totalUsers }, { count: totalPosts }, { count: reportCount }, { data: categoryRows }] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('category')
    ]);

  const postsPerCategory = (categoryRows ?? []).reduce<Record<string, number>>((acc, row: { category: string }) => {
    acc[row.category] = (acc[row.category] ?? 0) + 1;
    return acc;
  }, {});

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', sevenDaysAgo);

  return {
    totalUsers: totalUsers ?? 0,
    totalPosts: totalPosts ?? 0,
    reportCount: reportCount ?? 0,
    activeUsers: activeUsers ?? 0,
    postsPerCategory
  };
}
