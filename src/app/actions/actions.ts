"use server";

import { supabase } from "@/lib/supabase";

// حفظ السجل
async function logRequest(prompt: string, url: string) {
  const { error } = await supabase.from("video_log").insert({ prompt, url });
  if (error) {
    console.error("❌ Failed to log prompt:", error.message);
  }
}

export async function generateVideo(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();

  const { data, error } = await supabase.from("video_map").select("*");
  if (error || !data) {
    console.error("❌ Supabase fetch error:", error?.message);
    return { success: false, videoUrl: "" };
  }

  const matched = data.find(entry =>
    lowerPrompt.includes(entry.sentence.toLowerCase())
  );

  const selectedVideo = matched?.src || "";

  if (selectedVideo) {
    await logRequest(prompt, selectedVideo);
    return { success: true, videoUrl: selectedVideo };
  }

  return { success: false, videoUrl: "" };
}
