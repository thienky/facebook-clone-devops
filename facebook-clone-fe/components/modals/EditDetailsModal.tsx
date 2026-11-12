"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from 'react';

interface EditDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DetailsData) => void;
  initialData: DetailsData;
  userId: number;
  accessToken: string;
}

export interface DetailsData {
  fullname: string;
  phone: string;
  profilepic: string;
  coverpic: string;
  bio: string;
  birthplace: string;
  workingPlace: string;
  isActive: boolean;
}

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({ open, onClose, onSave, initialData, userId, accessToken }) => {
  if (typeof window === 'undefined') return null;
  const [form, setForm] = useState<DetailsData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialData);
      setError(null);
      setSuccess(false);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/backend/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Cập nhật thất bại');
      }
      setSuccess(true);
      onSave(form);
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-screen">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl cursor-pointer" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Edit Details</h2>
       <div className='overflow-y-auto h-[550px]'>
       <form onSubmit={handleSubmit} className="space-y-4 mr-[20px]">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input type="text" name="fullname" value={form.fullname} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Birthplace</label>
            <input type="text" name="birthplace" value={form.birthplace} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Working Place</label>
            <input type="text" name="workingPlace" value={form.workingPlace} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            <label className="text-sm">Active</label>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Cập nhật thành công!</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
       </div>
      </div>
    </div>
  );
};

export default EditDetailsModal; 