'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [sentence, setSentence] = useState('');
  const [type, setType] = useState<'video' | 'image'>('video');
  const [src, setSrc] = useState('');
  const [videoMap, setVideoMap] = useState<Record<string, { type: string; src: string }>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileFilter, setFileFilter] = useState('');

  // Fetch videoMap
  useEffect(() => {
    fetch('/api/video-map')
      .then(res => res.json())
      .then(data => setVideoMap(data));
  }, []);

  // Fetch file list حسب النوع
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

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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
            <option key={file} value={file}>
              {file}
            </option>
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

            {/* بحث في الجمل */}
      <input
        type="text"
        placeholder="🔍 ابحث عن جملة..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* فلتر اسم الملف */}
      <select
        value={fileFilter}
        onChange={e => setFileFilter(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">كل الملفات</option>
        {files.map(file => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
      </select>

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
              <button
                className="text-green-600 hover:underline"
                onClick={() => handleEdit(key)}
              >
                تعديل
              </button>
              <button
                className="text-red-600 hover:underline"
                onClick={() => handleDelete(key)}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
