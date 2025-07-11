"use client";

import { useState } from "react";
import { generateVideo } from "./actions/actions";
import Link from "next/link";


export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [videos, setVideos] = useState<{ prompt: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateVideo(prompt);
      if (result.success) {
        setVideos((prev) => [...prev, { prompt, url: result.VideoUrl }]);
      } else {
        alert("فشل في توليد الفيديو.");
      }
    } catch {
      alert("حدث خطأ أثناء التوليد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="w-full max-w-4xl mx-auto bg-gray-100 dark:bg-neutral-900 p-6 rounded-xl shadow">
              {/* ✅ زر الانتقال إلى صفحة السجل */}
      <div className="flex justify-end mb-4">
<div className="flex justify-end mb-4">
  <Link
    href="/history"
    className="text-sm bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
  >
    📜 عرض السجل
  </Link>
</div>
      </div>
        <form onSubmit={handleGenerate} className="mb-6 space-y-4">
          <h1 className="text-xl font-bold">🎬 توليد فيديو من وصف</h1>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: فيديو عن الذكاء الاصطناعي باللغة العربية"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "جارٍ التوليد..." : "توليد الفيديو"}
          </button>
        </form>

        {videos.length > 0 && (
          <div className="space-y-6">
            {videos.map((video, idx) => (
              <div key={idx}>
                <p className="text-sm text-gray-600 dark:text-gray-300">الوصف: {video.prompt}</p>
                <video controls src={video.url} className="w-full mt-2 rounded shadow" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
