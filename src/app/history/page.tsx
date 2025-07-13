"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Howl } from "howler";
import Link from "next/link";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type LogEntry = {
  prompt: string;
  url: string;
  created_at: string;
};

type VideoMapEntry = {
  type: "video" | "image";
  src: string;
};

const successSound = new Howl({
  src: ["/sounds/notify.mp3"],
  volume: 0.3,
});

export default function HistoryPage() {
  const [logs, setLogs] = useState<
    { prompt: string; count: number; createdAt: string; videoUrl: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const router = useRouter();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data: logData, error: logError } = await supabase
          .from("video_log")
          .select("prompt, url, created_at");

        if (logError) throw logError;

        const { data: mapData, error: mapError } = await supabase
          .from("video_map")
          .select("sentence, type, src");

        if (mapError) throw mapError;

        const grouped: Record<string, LogEntry[]> = {};

        logData.forEach((log) => {
          const key = log.prompt.trim();
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            prompt: log.prompt,
            url: log.url,
            created_at: log.created_at,
          });
        });

        const videoMap: Record<string, VideoMapEntry> = {};
        mapData.forEach((entry) => {
          videoMap[entry.sentence] = { type: entry.type, src: entry.src };
        });

        const filteredKeys = Object.keys(grouped).filter((key) =>
          key.toLowerCase().includes(searchText.toLowerCase())
        );

        const filtered = filteredKeys.map((key) => {
          const sortedLogs = grouped[key].sort((a, b) =>
            sort === "desc"
              ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          const videoEntry = videoMap[key];
          const videoUrl = videoEntry?.type === "video" ? videoEntry.src : "";

          return {
            prompt: key,
            count: grouped[key].length,
            createdAt: sortedLogs[0]?.created_at,
            videoUrl,
          };
        });

        const sorted = filtered.sort((a, b) =>
          sort === "desc"
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setLogs(sorted);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("فشل في تحميل السجل");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [searchText, sort]);

  const handleDeletePhrase = async (prompt: string) => {
    try {
      const { error } = await supabase
        .from("video_log")
        .delete()
        .eq("prompt", prompt);

      if (!error) {
        toast.success("تم حذف الجملة بنجاح 🗑️");
        successSound.play();
        setLogs((prev) => prev.filter((log) => log.prompt !== prompt));
        router.refresh();
      } else {
        toast.error("فشل في حذف الجملة");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

const handleDeleteAll = async () => {
  const res = await fetch("/api/delete-all", { method: "DELETE" });
  if (res.ok) {
    toast.success("تم حذف جميع السجلات");
    successSound.play();
    setLogs([]);
    router.refresh();
  } else {
    toast.error("فشل في الحذف");
  }
};


  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center dark:text-white">
        📜 سجل الفيديوهات (حسب الجملة)
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
        <p>📁 عدد الجمل المختلفة: {logs.length}</p>
        <button
          onClick={handleDeleteAll}
          className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🗑️ حذف الكل
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 ابحث عن جملة..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full md:w-[300px]"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "asc" | "desc")}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="desc">الأحدث ⬇️</option>
          <option value="asc">الأقدم ⬆️</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">جاري تحميل السجل...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-400">لا توجد نتائج.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logs.map(({ prompt, count, createdAt, videoUrl }) => (
            <div
              key={`${prompt}-${createdAt}`}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow border dark:border-neutral-700 p-4 relative"
            >
              <button
                className="absolute top-2 left-2 text-red-600 hover:text-red-800 text-lg"
                onClick={() => handleDeletePhrase(prompt)}
                title="حذف الجملة"
              >
                🗑️
              </button>

              <Link href={`/phrase/${encodeURIComponent(prompt)}`}>
                <p className="text-lg font-semibold mb-1 cursor-pointer hover:underline">
                  📝 {prompt}
                </p>
              </Link>

              <p className="text-sm text-gray-500 mb-2">
                📅 {new Date(createdAt).toLocaleString("ar-EG")}
              </p>

              <p className="text-sm mb-3 text-blue-600 dark:text-blue-400">
                🔁 تم التكرار: {count} مرة
              </p>

              {videoUrl ? (
                <video
                  controls
                  className="rounded-md shadow mx-auto"
                  style={{ width: "100%", height: "220px" }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  المتصفح لا يدعم تشغيل الفيديو.
                </video>
              ) : (
                <p className="text-center text-gray-400">لا يوجد فيديو مرتبط</p>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push("/")}
        className="fixed bottom-5 right-5 z-50 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700"
        title="رجوع للرئيسية"
      >
        ⬅️
      </button>
    </div>
  );
}