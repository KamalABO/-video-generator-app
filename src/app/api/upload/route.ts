// /app/api/upload/route.ts
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;

  if (!file || !type) {
    return NextResponse.json({ error: 'Missing file or type' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const dir = path.join(process.cwd(), 'public', type === 'video' ? 'videos' : 'images');
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}_${file.name}`;
  const filePath = path.join(dir, filename);

  await writeFile(filePath, buffer);

  return NextResponse.json({ success: true, filename });
}
