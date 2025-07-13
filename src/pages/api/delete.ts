import { supabase } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const prompt = req.query.prompt as string;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const { error } = await supabase
    .from("video_log")
    .delete()
    .eq("prompt", prompt);

  if (error) {
    console.error("❌ Error deleting from Supabase:", error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: "Deleted successfully" });
}
