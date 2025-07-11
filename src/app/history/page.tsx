"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VideoLog = {
  prompt: string;
  url: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<VideoLog[]>([]);
  const [loading, setLoading] = useState(true);
  type SnackbarType = "success" | "error" | "info";
  const [snackbar, setSnackbar] = useState<{
      message: string;
      type: SnackbarType;
    } | null>(null);


  // جلب السجل من الـ API
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/logs");
      const { logs } = await res.json();
      setLogs(logs);
      setLoading(false);
    })();
  }, []);

  

    // عرض رسالة
const showSnackbar = (message: string, type: SnackbarType = "info") => {
  setSnackbar({ message, type });

  // ✅ تشغيل صوت
  const audio = new Audio("/notify.mp3");
  audio.volume = 0.5;
  audio.play();

  setTimeout(() => setSnackbar(null), 10000); // بعد 10 ثواني
};

  // حذف الكل
const handleDeleteAll = async () => {
  await fetch("/api/logs", { method: "DELETE" });
  setLogs([]);
showSnackbar("🗑️ تم حذف السجل بنجاح", "error");
};



  // تصدير JSON
const handleExport = () => {
  window.location.href = "/api/logs/export";
showSnackbar("📤 تم تحميل ملف السجل", "success");
};





  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-black dark:to-gray-900 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">📜 سجل الفيديوهات</h1>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              🏠 رجوع للرئيسية
            </Link>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              📤 تصدير JSON
            </button>
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              🗑️ حذف الكل
            </button>
          </div>
        </div>

        {/* محتوى السجل */}
        {loading ? (
          <p>جاري تحميل السجل...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">لا يوجد فيديوهات محفوظة بعد.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {logs
              .slice()
              .reverse()
              .map((log, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg shadow border border-gray-300 dark:border-neutral-700"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">🧠 الوصف:</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{log.prompt}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    🕒 {new Date(log.createdAt).toLocaleString("ar-EG")}
                  </p>
                  <video
                    controls
                    src={log.url}
                    className="w-full rounded border border-gray-300 dark:border-neutral-700"
                  />
                </div>
              ))}
          </div>
        )}
      </div>
{snackbar && (
  <div
    className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 transition-all animate-fade-in-out
      ${
        snackbar.type === "success"
          ? "bg-green-600 text-white"
          : snackbar.type === "error"
          ? "bg-red-600 text-white"
          : "bg-blue-600 text-white"
      }
    `}
  >
    {snackbar.message}
  </div>
)}


    </main>
  );
}
