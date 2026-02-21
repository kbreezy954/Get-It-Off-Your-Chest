import Link from 'next/link';

type PostCardProps = {
  post: {
    id: string;
    title: string;
    content: string;
    category: string;
    upvotes_count: number;
    downvotes_count: number;
    created_at: string;
    is_anonymous: boolean;
    users?: { username: string } | null;
  };
};

export function scorePost(post: PostCardProps['post']) {
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / 36e5;
  const netVotes = post.upvotes_count - post.downvotes_count;
  return netVotes + Math.max(0, 48 - ageHours) * 0.25;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="card">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
        <span>{post.category}</span>
        <span>{new Date(post.created_at).toLocaleString()}</span>
      </div>
      <Link className="text-lg font-semibold hover:text-accent" href={`/posts/${post.id}`}>
        {post.title}
      </Link>
      <p className="mt-2 line-clamp-3 text-sm text-zinc-300">{post.content}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <span>{post.is_anonymous ? 'Anonymous' : post.users?.username ?? 'Unknown'}</span>
        <span>
          ▲ {post.upvotes_count} ▼ {post.downvotes_count}
        </span>
      </div>
    </article>
  );
}
