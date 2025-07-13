'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'map' | 'files'>('map');
  const [sentence, setSentence] = useState('');
  const [type, setType] = useState<'video' | 'image'>('video');
  const [src, setSrc] = useState('');
  const [videoMap, setVideoMap] = useState<Record<string, { type: string; src: string }>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileFilter, setFileFilter] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/video-map')
      .then(res => res.json())
      .then(data => setVideoMap(data));
  }, []);

  useEffect(() => {
    fetch(`/api/list-files?type=${type}`)
      .then(res => res.json())
      .then(data => setFiles(data.files || []));
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentence || !src) return;

    await fetch('/api/video-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence, type, src: `/${type === 'video' ? 'videos' : 'images'}/${src}` }),
    });

    const updatedMap = await fetch('/api/video-map').then(res => res.json());
    setVideoMap(updatedMap);
    setSentence('');
    setSrc('');
    setIsEditing(false);
  };

  const handleEdit = (key: string) => {
    setSentence(key);
    setType(videoMap[key].type as 'video' | 'image');
    const fullSrc = videoMap[key].src;
    const parts = fullSrc.split('/');
    setSrc(parts[parts.length - 1]);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSentence('');
    setSrc('');
    setIsEditing(false);
  };

  const handleDelete = async (key: string) => {
    await fetch('/api/video-map', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: key }),
    });

    setVideoMap(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const filteredVideoMapEntries = Object.entries(videoMap).filter(([key, val]) => {
    const matchesSearch = key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = val.type === type;
    const fileName = val.src.split("/").pop() || "";
    const matchesFile = fileFilter ? fileName.includes(fileFilter) : true;
    return matchesSearch && matchesType && matchesFile;
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📋 لوحة التحكم</h1>

      {/* التبويبات */}
      <div className="flex gap-4 mb-6 border-b pb-2">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-t ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-zinc-950'}`}
        >
          🧩 الجُمل المرتبطة
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-t ${activeTab === 'files' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-zinc-950'}`}
        >
          📂 إدارة الملفات
        </button>
      </div>

      {activeTab === 'map' && (
        <>
          <div className="space-y-4 border p-4 rounded mb-6">
            <h2 className="text-lg font-semibold">➕ إضافة جملة وملف</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="الجملة"
                value={sentence}
                onChange={e => setSentence(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={isEditing}
              />

              <select
                value={type}
                onChange={e => setType(e.target.value as 'video' | 'image')}
                className="w-full p-2 border rounded"
              >
                <option value="video">🎬 فيديو</option>
                <option value="image">🖼️ صورة</option>
              </select>

              <select
                value={src}
                onChange={e => setSrc(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">اختر ملف</option>
                {files.map(file => (
                  <option key={file} value={file}>{file}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {isEditing ? 'تحديث' : 'حفظ'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-4 border p-4 rounded mb-6">
            <h2 className="text-lg font-semibold">🔍 فلترة الجمل</h2>
            <input
              type="text"
              placeholder="🔍 ابحث عن جملة..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <select
              value={fileFilter}
              onChange={e => setFileFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">كل الملفات</option>
              {files.map(file => (
                <option key={file} value={file}>{file}</option>
              ))}
            </select>
          </div>

          <h2 className="text-xl font-semibold mb-2">
            🗂 الجمل المسجلة ({filteredVideoMapEntries.length})
          </h2>

          <ul className="space-y-2 max-h-[400px] overflow-auto border p-2 rounded">
            {filteredVideoMapEntries.length === 0 && (
              <p className="text-center text-gray-500">لا توجد جمل مطابقة.</p>
            )}
            {filteredVideoMapEntries.map(([key, val]) => (
              <li key={key} className="border p-2 rounded flex justify-between items-center">
                <div>
                  <strong>{key}</strong> → [{val.type}] {val.src}
                </div>
                <div className="space-x-2">
                  <button className="text-green-600 hover:underline" onClick={() => handleEdit(key)}>تعديل</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(key)}>حذف</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {activeTab === 'files' && (
        <>
          <div className="space-y-4 border p-4 rounded mb-6">
            <h2 className="text-lg font-semibold">⬆️ رفع ملف جديد</h2>
            <input
              type="file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const form = new FormData();
                form.append("file", file);
                form.append("type", type);

                const res = await fetch("/api/upload", {
                  method: "POST",
                  body: form,
                });

                if (res.ok) {
                  const { fileName } = await res.json();
                  alert(`✅ تم رفع الملف بنجاح: ${fileName}`);
                  setUploadedFileName(fileName);
                  const updated = await fetch(`/api/list-files?type=${type}`).then(r => r.json());
                  setFiles(updated.files || []);
                } else {
                  const { error } = await res.json();
                  alert(`❌ فشل رفع الملف: ${error}`);
                }
              }}
              className="w-full p-2 border rounded"
            />

            {uploadedFileName && (
              <div className="mt-2">
                <p className="text-green-700">📁 تم رفع الملف: {uploadedFileName}</p>
                <button
                  onClick={() => setSrc(uploadedFileName)}
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
                >
                  ➕ أضف الملف إلى النموذج
                </button>
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold mb-2">📁 الملفات ({files.length})</h2>
          <ul className="space-y-1 max-h-[300px] overflow-auto border p-2 rounded">
            {files.map(file => (
              <li key={file} className="flex justify-between items-center">
                <span className="truncate">{file}</span>
                <button
                  onClick={async () => {
                    const confirmed = confirm(`هل تريد حذف الملف: ${file}؟`);
                    if (!confirmed) return;
                    const res = await fetch('/api/upload', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ file, type }),
                    });

                    if (res.ok) {
                      alert(`🗑 تم حذف الملف`);
                      const updated = await fetch(`/api/list-files?type=${type}`).then(r => r.json());
                      setFiles(updated.files || []);
                    } else {
                      const { error } = await res.json();
                      alert(`❌ فشل حذف الملف: ${error}`);
                    }
                  }}
                  className="text-red-600 hover:underline"
                >
                  🗑 حذف
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
