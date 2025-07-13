import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type'); // "video" or "image"
  if (!type || (type !== 'video' && type !== 'image')) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const folder = type === 'video' ? 'public/videos' : 'public/images';
  const fullPath = path.join(process.cwd(), folder);

  try {
    const files = fs.readdirSync(fullPath);
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read folder' }, { status: 500 });
  }
}
