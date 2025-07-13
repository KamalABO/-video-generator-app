// app/api/delete-all/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE() {
  const { error } = await supabase.from("video_log").delete().neq("id", 0);

  if (error) {
    console.error("❌ Failed to delete all logs:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
