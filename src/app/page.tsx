"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateVideo } from "./actions/actions";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setIsGenerating(true);

    try {
      const result = await generateVideo(prompt);
      if (result.success) {
        setVideoUrl(result.VideoUrl);
      }
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-100 dark:from-black dark:to-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6">
        {/* 🔗 Navigation */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            🎬 Video Generator
          </h1>
          <Link
            href="/history"
            className="text-sm bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            📜 عرض السجل
          </Link>
        </div>

        {/* 🧠 Prompt Input */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب وصفًا للفيديو المطلوب..."
            className="w-full p-4 border rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!prompt || loading || isGenerating || isPending}
            className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading || isPending ? "⏳ جاري التوليد..." : "🚀 توليد الفيديو"}
          </button>
        </form>

        {/* 🎥 Video Output */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">📺 الفيديو الناتج</h2>
          {loading || isPending ? (
            <div className="text-blue-500 dark:text-blue-300 animate-pulse">⏳ جاري تجهيز الفيديو...</div>
          ) : videoUrl ? (
            <video
              controls
              src={videoUrl}
              className="w-full rounded-lg shadow-lg border border-gray-300 dark:border-neutral-700"
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">لم يتم توليد فيديو بعد.</p>
          )}
        </div>
      </div>
    </main>
  );
}
