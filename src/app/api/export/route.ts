import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const logFile = path.join(process.cwd(), "video-log.json");

  try {
    const content = await fs.readFile(logFile, "utf-8");

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=video-log-export.json",
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "فشل في تحميل ملف السجل" }),
      { status: 500 }
    );
  }
}
