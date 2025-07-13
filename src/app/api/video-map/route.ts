// app/api/video-map/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('video_map').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map: Record<string, { type: string; src: string }> = {};
  data.forEach(entry => {
    map[entry.sentence] = { type: entry.type, src: entry.src };
  });

  return NextResponse.json(map);
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log('📥 Body received:', body);

  const { sentence, type, src } = body;
  if (!sentence || !type || !src)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { error } = await supabase
    .from('video_map')
    .upsert({ sentence, type, src }, { onConflict: 'sentence' });

  if (error) {
    console.error('❌ Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('✅ Saved successfully');
  return NextResponse.json({ success: true });
}


export async function DELETE(req: Request) {
  const { sentence } = await req.json();
  if (!sentence)
    return NextResponse.json({ error: 'Missing sentence' }, { status: 400 });

  const { error } = await supabase.from('video_map').delete().eq('sentence', sentence);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
