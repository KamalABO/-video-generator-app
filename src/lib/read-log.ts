// src/lib/read-log.ts
import fs from "fs/promises";
import path from "path";

const logFilePath = path.join(process.cwd(), "video-log.json");

export async function readLogs() {
  try {
    const content = await fs.readFile(logFilePath, "utf-8");
    return JSON.parse(content) as {
      prompt: string;
      url: string;
      createdAt: string;
    }[];
  } catch (error) {
    console.error("Error reading log file:", error);
    return [];
  }
}
