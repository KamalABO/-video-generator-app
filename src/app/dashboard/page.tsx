'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [sentence, setSentence] = useState('');
  const [type, setType] = useState<'video' | 'image'>('video');
  const [src, setSrc] = useState('');
  const [videoMap, setVideoMap] = useState<Record<string, { type: string; src: string }>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

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

    const finalSrc = `/${type === 'video' ? 'videos' : 'images'}/${src}`;

    const res = await fetch('/api/video-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence, type, src: finalSrc })
    });

    const result = await res.json();
    if (!res.ok) return toast.error(`خطأ: ${result.error || 'حدث خطأ ما'}`);

    const updatedMap = await fetch('/api/video-map').then(res => res.json());
    setVideoMap(updatedMap);
    setSentence('');
    setSrc('');
    setIsEditing(false);
    setEditingKey(null);
    toast.success('✅ تم الحفظ بنجاح');
  };

  const handleEdit = (key: string) => {
    setSentence(key);
    setType(videoMap[key].type as 'video' | 'image');
    const parts = videoMap[key].src.split('/');
    setSrc(parts[parts.length - 1]);
    setIsEditing(true);
    setEditingKey(key);
  };

  const handleCancelEdit = () => {
    setSentence('');
    setSrc('');
    setIsEditing(false);
    setEditingKey(null);
  };

  const handleDelete = async (key: string) => {
    const res = await fetch('/api/video-map', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: key })
    });

    const result = await res.json();
    if (!res.ok) return toast.error(`خطأ: ${result.error || 'فشل الحذف'}`);

    const updatedMap = { ...videoMap };
    delete updatedMap[key];
    setVideoMap(updatedMap);
    toast.success('🗑️ تم الحذف بنجاح');
  };

  const handleUpload = async () => {
    if (!fileToUpload) return toast.error('اختر ملف للرفع أولاً');
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('type', type);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const result = await res.json();
      setSrc(result.filename);
      toast.success('✅ تم رفع الملف بنجاح');
      fetch(`/api/list-files?type=${type}`)
        .then(res => res.json())
        .then(data => setFiles(data.files || []));
    } else {
      toast.error('فشل في رفع الملف');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ لوحة التحكم</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="📝 الجملة"
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

        <div className="flex items-center gap-2">
          <select
            value={src}
            onChange={e => setSrc(e.target.value)}
            className="flex-1 p-2 border rounded"
          >
            <option value="">اختر من الملفات المرفوعة</option>
            {files.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>

          <input
            type="file"
            accept={type === 'video' ? 'video/*' : 'image/*'}
            onChange={e => setFileToUpload(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={handleUpload}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            ⬆️ رفع
          </button>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {isEditing ? 'تحديث' : '💾 حفظ'}
          </button>
          {isEditing && (
            <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded">
              إلغاء
            </button>
          )}
        </div>
      </form>

      <input
        type="text"
        placeholder="🔍 بحث عن جملة أو اسم ملف..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <h2 className="text-xl font-semibold mb-2">📋 الجمل المرتبطة ({Object.keys(videoMap).length})</h2>
      <ul className="space-y-2">
        {Object.entries(videoMap)
          .filter(([key, val]) =>
            key.toLowerCase().includes(search.toLowerCase()) ||
            val.src.toLowerCase().includes(search.toLowerCase())
          )
          .map(([key, val]) => (
            <li key={key} className="border p-2 rounded flex justify-between items-center">
              <div>
                <strong>{key}</strong> → <span className="text-sm text-gray-600">[{val.type}]</span> <code className="text-blue-600">{val.src}</code>
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
