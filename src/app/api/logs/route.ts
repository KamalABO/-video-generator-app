import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const logFile = path.join(process.cwd(), "video-log.json");

export async function GET() {
  try {
    const data = await fs.readFile(logFile, "utf-8");
    return NextResponse.json({ logs: JSON.parse(data) });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}

export async function DELETE() {
  try {
    await fs.writeFile(logFile, "[]");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
