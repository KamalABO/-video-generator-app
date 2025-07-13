// src/pages/api/clear-log.ts
import fs from "fs/promises";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

const logFilePath = path.join(process.cwd(), "video-log.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await fs.writeFile(logFilePath, "[]");
    return res.status(200).json({ message: "تم الحذف" });
  }
  res.status(405).end();
}
