import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/analytics';

export async function GET() {
  const stats = await getAnalytics();
  return NextResponse.json(stats);
}
