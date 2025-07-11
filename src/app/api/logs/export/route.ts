import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const logFile = path.join(process.cwd(), "video-log.json");

export async function GET() {
  try {
    const data = await fs.readFile(logFile);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=video-log-export.json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export." }, { status: 500 });
  }
}
