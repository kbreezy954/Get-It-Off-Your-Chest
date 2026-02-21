import Link from 'next/link';
import { CATEGORIES } from '@/lib/types';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-3xl font-semibold text-accent">Get It Off Your Chest</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          A structured place to vent, reflect, and connect anonymously or openly through trusted categories.
        </p>
        <div className="mt-5 flex gap-3">
          <Link className="btn" href="/signup">
            Join now
          </Link>
          <Link className="btn-secondary" href="/feed">
            Explore feed
          </Link>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link className="card text-sm" key={category} href={`/categories/${encodeURIComponent(category)}`}>
            {category}
          </Link>
        ))}
      </section>
    </div>
  );
}
