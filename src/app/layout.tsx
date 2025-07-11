import "./globals.css";
import { Inter } from "next/font/google";
import fs from "fs";
import path from "path";

const inter = Inter({ subsets: ["latin"] });

// ✅ تحميل تاريخ آخر تعديل من video-log.json (لو موجود)
let lastModified = "—";
try {
  const logFile = path.join(process.cwd(), "video-log.json");
  if (fs.existsSync(logFile)) {
    const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
    if (logs.length > 0) {
      const last = logs[logs.length - 1];
      lastModified = new Date(last.createdAt).toLocaleString("ar-EG");
    }
  }
} catch {
  lastModified = "غير متاح";
}

export const metadata = {
  title: "Video Generator",
  description: "AI-powered video generation app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className + " flex flex-col min-h-screen bg-white dark:bg-black"}>
        <main className="flex-grow">{children}</main>

        {/* ✅ Footer */}
        <footer className="text-center py-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-neutral-800 space-y-2">
          <div>💼 تم التطوير بواسطة: <strong>ENG. Kamal Mohamed</strong></div>
          <div>📅 © {new Date().getFullYear()} – آخر تعديل: {lastModified}</div>
          <div className="flex justify-center gap-4 text-blue-600 dark:text-blue-400 mt-1">
            <a href="https://github.com/username" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/username" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:youremail@example.com">Email</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
