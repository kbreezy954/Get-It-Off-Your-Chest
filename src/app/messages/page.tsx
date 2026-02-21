import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function sendMessage(formData: FormData) {
  'use server';
  const receiver_id = String(formData.get('receiver_id') ?? '');
  const content = String(formData.get('content') ?? '');
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  await supabase.from('messages').insert({ sender_id: user.id, receiver_id, content: content.slice(0, 1000) });
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: messages } = await supabase
    .from('messages')
    .select('id,sender_id,receiver_id,content,created_at')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(40);

  const { data: users } = await supabase.from('users').select('id,username').neq('id', user.id).limit(20);

  return (
    <div className="space-y-4">
      <form className="card space-y-3" action={sendMessage}>
        <h2 className="text-lg font-semibold">New message</h2>
        <select className="input" name="receiver_id" required>
          <option value="">Select user</option>
          {users?.map((entry) => (
            <option key={entry.id} value={entry.id}>{entry.username}</option>
          ))}
        </select>
        <textarea className="input min-h-24" name="content" required />
        <button className="btn" type="submit">Send</button>
      </form>

      {messages?.map((message) => (
        <article className="card" key={message.id}>
          <p className="text-sm text-zinc-200">{message.content}</p>
          <p className="mt-2 text-xs text-zinc-400">
            {message.sender_id === user.id ? 'You' : 'Them'} · {new Date(message.created_at).toLocaleString()}
          </p>
        </article>
      ))}
    </div>
  );
}
