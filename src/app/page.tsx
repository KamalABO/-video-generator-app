"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateVideo } from "./actions/actions";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const router = useRouter();

  const playSound = () => {
    const audio = new Audio("/sounds/notify.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setNotFound(false);

    try {
      const res = await generateVideo(prompt);
      if (res?.videoUrl) {
        setVideoUrl(res.videoUrl);
        playSound();
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 4000);
      } else {
        setVideoUrl("");
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
      console.error("❌ خطأ في توليد الفيديو:", error);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 dark:from-black dark:to-neutral-900 p-6 relative">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-xl border border-gray-300 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            🎬 فيديو تلقائي حسب الجملة
          </h1>
          <button
            onClick={() => router.push("/history")}
            className="px-4 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            📜 السجل
          </button>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <textarea
            className="resize-none p-4 rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-lg"
            placeholder="📝 اكتب جملة تحتوي على كلمة دالة..."
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="self-start px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-lg"
          >
            {loading ? "🔄 جاري التحليل..." : "▶️ عرض الفيديو"}
          </button>
        </form>

        <div className="mt-8 text-center">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">جاري تحميل الفيديو...</p>
          ) : notFound ? (
            <p className="text-red-500 dark:text-red-400 font-medium mt-6">
              ⚠️ لا يوجد فيديو مناسب لهذه الجملة.
            </p>
          ) : videoUrl ? (
            <video
              key={videoUrl}
              controls
              autoPlay
              className="mt-4 rounded-xl shadow-lg mx-auto"
              style={{ width: "420px", height: "250px" }}
            >
              <source src={videoUrl} type="video/mp4" />
              المتصفح لا يدعم تشغيل الفيديو.
            </video>
          ) : (
            <p className="text-gray-400 mt-6">لم يتم عرض أي فيديو بعد.</p>
          )}
        </div>
      </div>

      {showMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          ✅ تم عرض الفيديو بنجاح
        </div>
      )}
    </main>
  );
}
