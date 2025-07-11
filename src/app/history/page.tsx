import fs from "fs/promises";
import path from "path";
import Link from "next/link";

const logFile = path.join(process.cwd(), "video-log.json");

interface VideoLog {
  prompt: string;
  url: string;
  createdAt: string;
}

export default async function HistoryPage() {
  let logs: VideoLog[] = [];

  try {
    const data = await fs.readFile(logFile, "utf-8");
    logs = JSON.parse(data);
  } catch {
    logs = [];
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-black dark:to-gray-900 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl">
        
        {/* 🔝 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">📜 سجل الفيديوهات</h1>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              🏠 رجوع للرئيسية
            </Link>
            <a
              href="/video-log.json"
              download
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              📤 تصدير JSON
            </a>
            <form action="/api/clear-log" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                🗑️ حذف الكل
              </button>
            </form>
          </div>
        </div>

        {/* 📝 سجل الفيديوهات */}
        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">لا يوجد فيديوهات محفوظة بعد.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {logs
              .slice()
              .reverse()
              .map((log, index) => (
                <div
                  key={index}
                  className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg shadow border border-gray-300 dark:border-neutral-700"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    🧠 الوصف:
                  </h3>
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
    </main>
  );
}
