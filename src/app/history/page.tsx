"use client";

import { useEffect, useState } from "react";

type VideoLog = {
  prompt: string;
  url: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<VideoLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data.logs || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const handleDelete = async () => {
    await fetch("/api/logs", { method: "DELETE" });
    setLogs([]);
  };

  const handleExport = async () => {
    const res = await fetch("/api/logs/export");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-log-export.json";
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-5xl mx-auto bg-gray-100 dark:bg-neutral-900 p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">📜 سجل الفيديوهات</h1>
          <div className="space-x-2">
            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-1 rounded">📥 تصدير</button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-1 rounded">🗑️ حذف الكل</button>
          </div>
        </div>

        {loading ? (
          <p>جاري تحميل السجل...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">لا توجد فيديوهات محفوظة.</p>
        ) : (
          logs.map((entry, idx) => (
            <div key={idx} className="mb-6 border-b pb-4 border-gray-300 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">📝 {entry.prompt}</p>
              <video controls src={entry.url} className="w-full rounded mt-2" />
              <p className="text-xs text-gray-500 mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
