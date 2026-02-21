import { NextRequest, NextResponse } from 'next/server';
import { moderateContent } from '@/lib/moderation';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { content } = await request.json();
  const result = moderateContent(String(content ?? ''));

  if (!result.flagged) return NextResponse.json({ ok: true });

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('users').select('strike_count').eq('id', user.id).single();
    const strike_count = (profile?.strike_count ?? 0) + 1;
    await supabase
      .from('users')
      .update({ strike_count, is_banned: strike_count >= 3 })
      .eq('id', user.id);
  }

  return NextResponse.json({ error: 'Content violates moderation policy.' }, { status: 400 });
}
