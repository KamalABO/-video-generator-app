"use server";

import fs from "fs/promises";
import path from "path";

// ملف السجل
const logFile = path.join(process.cwd(), "video-log.json");

async function logRequest(prompt: string, url: string) {
  let logs = [];
  try {
    const existing = await fs.readFile(logFile, "utf-8");
    logs = JSON.parse(existing);
  } catch {
    logs = [];
  }
  logs.push({ prompt, url, createdAt: new Date().toISOString() });
  await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
}

export async function generateVideo(prompt: string) {
  try {
    // محاكاة انتظار التوليد
    await new Promise((res) => setTimeout(res, 2000));

    const fakeVideoUrl = "/videos/videom3.mp4";

    await logRequest(prompt, fakeVideoUrl);

    return { success: true, VideoUrl: fakeVideoUrl };
  } catch (error) {
    console.error("Simulated API Error:", error);
    return { success: false, VideoUrl: "" };
  }
}


// ✅ الدالة الرئيسية لتوليد الفيديو (وهمي الآن، API حقيقي لاحقًا)
// export async function generateVideo(prompt: string) {
//   // ✅ لو أردت التبديل لاحقًا لـ DeepBrain API، ضع الكود هنا
//   const simulateDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

//   try {
//     // محاكاة انتظار التوليد
//     await simulateDelay(2000);

//     const fakeVideoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

//     await logRequest(prompt, fakeVideoUrl);

//     return { success: true, VideoUrl: fakeVideoUrl };
//   } catch (error) {
//     console.error("Simulated API Error:", error);
//     return { success: false, VideoUrl: "" };
//   }
// }

// export async function generateVideo(prompt: string) {
//   const appId = process.env.APP_ID!;
//   const userKey = process.env.USER_KEY!;

//   try {
//     // ✅ 1. الحصول على التوكن من DeepBrain
//     const tokenRes = await fetch("https://app.aistudios.com/api/odin/v3/auth/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ appId, userKey }),
//     });

//     const tokenData = await tokenRes.json();
//     const accessToken = tokenData.token;

//     if (!accessToken) throw new Error("فشل الحصول على التوكن");

//     // ✅ 2. توليد الفيديو بناءً على الوصف
//     const createRes = await fetch("https://app.aistudios.com/api/odin/v3/automation/topic_to_video", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         title: prompt,
//         topic: prompt,
//         avatarId: "1001",         // يمكنك تغييره لاحقًا
//         backgroundId: "1001",     // يمكنك تغييره لاحقًا
//         voiceId: "1",             // صوت المقدم
//         useSubtitle: true,
//         useBackground: true,
//         useMusic: true,
//         useAvatar: true,
//         exportMode: "mp4",
//         quality: "720p"
//       }),
//     });

//     const createData = await createRes.json();

//     // ✅ تحقق إن الفيديو فعلاً تم إنشاؤه
//     if (!createData?.videoUrl) throw new Error("فشل توليد الفيديو");

//     const videoUrl = createData.videoUrl;

//     // ✅ حفظ السجل
//     await logRequest(prompt, videoUrl);

//     return { success: true, VideoUrl: videoUrl };
//   } catch (error) {
//     console.error("API Error:", error);
//     return { success: false, VideoUrl: "" };
//   }
// }
