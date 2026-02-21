import Link from 'next/link';
import { AuthForm } from '@/components/forms';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ verify?: string }> }) {
  const params = await searchParams;

  return (
    <div className="space-y-4">
      {params.verify && <p className="text-sm text-accent">Verify your email before posting.</p>}
      <AuthForm type="login" />
      <p className="text-center text-sm text-zinc-400">
        Need an account? <Link className="text-accent" href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
