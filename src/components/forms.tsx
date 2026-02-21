'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function AuthForm({ type }: { type: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (type === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (signUpError) return setError(signUpError.message);
      router.push('/login?verify=true');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) return setError(signInError.message);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('users').select('is_banned').eq('id', user.id).single();
      if (profile?.is_banned) {
        await supabase.auth.signOut();
        return setError('Your account is banned. Contact support.');
      }
    }

    router.push('/feed');
    router.refresh();
  };

  return (
    <form className="card mx-auto max-w-md space-y-3" onSubmit={submit}>
      {type === 'signup' && (
        <input className="input" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} />
      )}
      <input className="input" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="btn w-full" type="submit">
        {type === 'signup' ? 'Create account' : 'Login'}
      </button>
    </form>
  );
}

export function NewPostForm() {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload = {
      title: String(formData.get('title') ?? ''),
      category: String(formData.get('category') ?? ''),
      content: String(formData.get('content') ?? ''),
      is_anonymous: formData.get('is_anonymous') === 'on'
    };

    const moderate = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `${payload.title} ${payload.content}` })
    });

    if (!moderate.ok) {
      const moderationError = await moderate.json();
      setError(moderationError.error ?? 'Content rejected');
      return;
    }

    const { error: insertError } = await supabase.from('posts').insert(payload);
    if (insertError) return setError(insertError.message);

    router.push('/feed');
    router.refresh();
  };

  return (
    <form className="card space-y-3" onSubmit={submit}>
      <input className="input" name="title" placeholder="Title" required maxLength={120} />
      <select className="input" name="category" required>
        <option value="">Select category</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <textarea className="input min-h-40" name="content" placeholder="Vent safely and honestly..." required maxLength={2000} />
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input name="is_anonymous" type="checkbox" /> Post anonymously
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="btn" type="submit">
        Publish post
      </button>
    </form>
  );
}
