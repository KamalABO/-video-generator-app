// src/app/api/phrases/add/route.ts
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { phrase, videoUrl } = await req.json();

  const { data, error } = await supabase
    .from("video_phrases")
    .insert([{ phrase, video_url: videoUrl }]);

  if (error) return Response.json({ success: false, error });

  return Response.json({ success: true, data });
}
