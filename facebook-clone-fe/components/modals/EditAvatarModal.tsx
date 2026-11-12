'use client'
import { API_BASE } from '@/lib/apiBase';
import React, { useRef, useState } from 'react';

interface EditAvatarModalProps {
  onClose: () => void;
  userId: number;
  accessToken: string;
  onUploaded?: (newAvatarUrl: string) => void;
}

const EditAvatarModal: React.FC<EditAvatarModalProps> = ({ onClose, userId, accessToken, onUploaded }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('files', file);
      const uploadRes = await fetch(`${API_BASE}/backend/common/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      let imageUrl = '';
      if (Array.isArray(uploadData.paths) && uploadData.paths.length > 0) {
        imageUrl = `${API_BASE}/${uploadData.paths[0].replace(/^\/+/,'')}`;
      } else if (uploadData.path) {
        imageUrl = `${API_BASE}/${uploadData.path.replace(/^\/+/,'')}`;
      } else {
        throw new Error('Không nhận được path từ API upload');
      }
      // 2. Gọi API update profilepic
      const updateRes = await fetch(`${API_BASE}/backend/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ profilepic: imageUrl })
      });
      const updateData = await updateRes.json();
      if (onUploaded) {
        onUploaded(imageUrl);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa ảnh đại diện</h2>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
          onChange={handleFileChange}
            className="hidden"
        />
        <div className="w-32 h-32 rounded-full mb-4 flex items-center justify-center bg-gray-200 overflow-hidden cursor-pointer mx-auto" onClick={() => fileInputRef.current?.click()}>
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500">Chưa chọn ảnh</span>
          )}
        </div>
          <button
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 mt-4 cursor-pointer"
          onClick={handleUpload}
          disabled={loading || !file}
          >
          {loading ? 'Đang lưu...' : 'Lưu ảnh đại diện'}
          </button>
          <button
          className="w-full py-2 mt-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300 cursor-pointer"
          onClick={onClose}
          disabled={loading}
          >
          Hủy
          </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default EditAvatarModal; 