import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const logFile = path.join(process.cwd(), "video-log.json");

export async function GET() {
  try {
    const content = await fs.readFile(logFile, "utf-8");
    const logs = JSON.parse(content);
    return NextResponse.json(logs);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ error: "فشل قراءة السجل" }, { status: 500 });
  }
}
