"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ChangePasswordForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.oldPassword) errs.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    if (!formData.newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (formData.newPassword.length < 6) errs.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    if (formData.confirmPassword !== formData.newPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) throw new Error('Bạn chưa đăng nhập!');
      const res = await fetch(`${API_BASE}/backend/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmPassword,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.message || 'Đổi mật khẩu thất bại!');
      setSuccess('Đổi mật khẩu thành công!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] bg-gray-100 flex items-center justify-center py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Đổi mật khẩu</h1>
        </div>
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Mật khẩu cũ"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:border-blue-500 pr-12 ${errors.oldPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowOldPassword((v) => !v)}
              aria-label={showOldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showOldPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.662 5.61 6 9.75 6 2.042 0 3.97-.492 5.617-1.357M21.75 12c-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12C16.07 6.492 14.142 6 12.1 6c-4.14 0-7.714 2.338-9.75 6 .512.885 1.13 1.712 1.844 2.464m2.12 2.12C7.93 17.508 9.858 18 11.9 18c4.14 0 7.714-2.338 9.75-6-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88m-4.24-4.24A3 3 0 0 1 12 9a3 3 0 0 1 2.12.88m-4.24 4.24L3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.662 5.61 6 9.75 6 2.042 0 3.97-.492 5.617-1.357M21.75 12c-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12C16.07 6.492 14.142 6 12.1 6c-4.14 0-7.714 2.338-9.75 6 .512.885 1.13 1.712 1.844 2.464m2.12 2.12C7.93 17.508 9.858 18 11.9 18c4.14 0 7.714-2.338 9.75-6-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12z" />
                </svg>
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Mật khẩu mới"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:border-blue-500 pr-12 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showNewPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.662 5.61 6 9.75 6 2.042 0 3.97-.492 5.617-1.357M21.75 12c-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12C16.07 6.492 14.142 6 12.1 6c-4.14 0-7.714 2.338-9.75 6 .512.885 1.13 1.712 1.844 2.464m2.12 2.12C7.93 17.508 9.858 18 11.9 18c4.14 0 7.714-2.338 9.75-6-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88m-4.24-4.24A3 3 0 0 1 12 9a3 3 0 0 1 2.12.88m-4.24 4.24L3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.662 5.61 6 9.75 6 2.042 0 3.97-.492 5.617-1.357M21.75 12c-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12C16.07 6.492 14.142 6 12.1 6c-4.14 0-7.714 2.338-9.75 6 .512.885 1.13 1.712 1.844 2.464m2.12 2.12C7.93 17.508 9.858 18 11.9 18c4.14 0 7.714-2.338 9.75-6-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12z" />
                </svg>
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu mới"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:border-blue-500 pr-12 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.662 5.61 6 9.75 6 2.042 0 3.97-.492 5.617-1.357M21.75 12c-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12C16.07 6.492 14.142 6 12.1 6c-4.14 0-7.714 2.338-9.75 6 .512.885 1.13 1.712 1.844 2.464m2.12 2.12C7.93 17.508 9.858 18 11.9 18c4.14 0 7.714-2.338 9.75-6-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88m-4.24-4.24A3 3 0 0 1 12 9a3 3 0 0 1 2.12.88m-4.24 4.24L3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.662 5.61 6 9.75 6 2.042 0 3.97-.492 5.617-1.357M21.75 12c-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12C16.07 6.492 14.142 6 12.1 6c-4.14 0-7.714 2.338-9.75 6 .512.885 1.13 1.712 1.844 2.464m2.12 2.12C7.93 17.508 9.858 18 11.9 18c4.14 0 7.714-2.338 9.75-6-.512-.885-1.13-1.712-1.844-2.464m-2.12-2.12z" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm; 