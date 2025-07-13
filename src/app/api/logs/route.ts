import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('video_log').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { prompt, url } = await req.json();
  if (!prompt || !url)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { error } = await supabase.from('video_log').insert({ prompt, url });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
