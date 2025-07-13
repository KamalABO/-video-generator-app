"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface LogEntry {
  prompt: string;
  createdAt: string | null;
}

interface VideoMapEntry {
  type: "video" | "image";
  src: string;
}

export default function PhrasePage() {
  const { prompt } = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [topPhrases, setTopPhrases] = useState<{ prompt: string; count: number }[]>([]);

  const promptText = decodeURIComponent(prompt as string);

  useEffect(() => {
    const fetchPhraseLogs = async () => {
      try {
        const res = await fetch(`/api/logs`);
        const data: LogEntry[] = await res.json();

        const videoMapRes = await fetch("/api/video-map");
        const videoMap: Record<string, VideoMapEntry> = await videoMapRes.json();
        const videoEntry = videoMap[promptText];
        const src = videoEntry?.type === "video" ? videoEntry.src : "";
        setVideoSrc(src);

        const filtered = data
          .filter((log) => log.prompt.trim() === promptText)
          .sort((a, b) =>
            new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
          );

        setLogs(filtered);

        const counts: Record<string, number> = {};
        data.forEach((log) => {
          const key = log.prompt.trim();
          counts[key] = (counts[key] || 0) + 1;
        });

        const top = Object.entries(counts)
          .map(([key, count]) => ({ prompt: key, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopPhrases(top);
      } catch (err) {
        toast.error("فشل تحميل السجل");
      } finally {
        setLoading(false);
      }
    };

    fetchPhraseLogs();
  }, [promptText]);

  const handleDeletePhrase = async () => {
    const res = await fetch(`/api/delete?prompt=${encodeURIComponent(promptText)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("تم حذف جميع التكرارات للجملة ✅");
      router.push("/history");
    } else {
      toast.error("فشل الحذف");
    }
  };

  const chartData = {
    labels: topPhrases.map((p) => p.prompt),
    datasets: [
      {
        label: "عدد مرات التكرار",
        data: topPhrases.map((p) => p.count),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "أكثر 5 جمل تكرارًا",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center dark:text-white">
        📄 تفاصيل الجملة:{" "}
        <span className="text-blue-600">{promptText}</span>
      </h1>

      <div className="flex justify-between items-center">
        <p className="text-gray-500 dark:text-gray-300">عدد التكرارات: {logs.length}</p>
        <button
          onClick={handleDeletePhrase}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🗑️ حذف الجملة بالكامل
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">جاري التحميل...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-400">لا يوجد تكرارات لهذه الجملة.</p>
      ) : (
        <>
          {/* الفيديو الخاص بالجملة */}
          {videoSrc ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4 border dark:border-neutral-700 mb-6">
              <p className="text-sm text-gray-500 mb-2">🎬 الفيديو المرتبط:</p>
              <video
                controls
                className="rounded-md shadow mx-auto"
                style={{ width: "100%", height: "220px" }}
              >
                <source src={videoSrc} type="video/mp4" />
                المتصفح لا يدعم تشغيل الفيديو.
              </video>
            </div>
          ) : (
            <p className="text-center text-gray-400 mb-4">لا يوجد فيديو مرتبط بهذه الجملة.</p>
          )}

          {/* جميع الأوقات التي ظهرت فيها */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-4 border dark:border-neutral-700 max-h-[300px] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">🕓 أوقات التكرار:</h2>
            <ul className="text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
              {logs.map((log, idx) => {
                const date = log.createdAt ? new Date(log.createdAt) : null;
                const isValid = date && !isNaN(date.getTime());

                return (
                  <li key={idx}>
                    {isValid
                      ? `🕓 ${date.toLocaleString("ar-EG")}`
                      : "❌ تاريخ غير صالح"}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* الرسم البياني */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 border dark:border-neutral-700">
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* أكثر 5 جمل تكرارًا - عرض محسّن */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              أكثر 5 جمل تكرارًا 🔥
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPhrases.map(({ prompt, count }, idx) => {
                let badge = "🟢";
                let color = "text-green-600";

                if (count >= 15) {
                  badge = "🔥🔥";
                  color = "text-red-600";
                } else if (count >= 10) {
                  badge = "🔥";
                  color = "text-orange-500";
                } else if (count >= 5) {
                  badge = "⭐";
                  color = "text-yellow-500";
                }

                return (
                  <a
                    key={idx}
                    href={`/phrase/${encodeURIComponent(prompt)}`}
                    className="block bg-white dark:bg-neutral-800 rounded-xl shadow hover:shadow-lg transition p-4 border dark:border-neutral-700 hover:border-blue-500"
                  >
                    <h3 className={`text-lg font-bold truncate ${color}`}>
                      {badge} {prompt}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      🔁 تم التكرار <span className="font-semibold">{count}</span> مرة
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
