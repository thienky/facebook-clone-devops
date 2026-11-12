"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  if(!token){
    setTimeout(() => router.push('/login'), 0);
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/backend/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset password failed!');
      setSuccess('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Reset password failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-6xl w-full flex">
        {/* Left side - Facebook info */}
        <div className="w-1/2 pr-8 pt-8">
          <div className="text-4xl font-bold text-blue-600 mb-4">facebook</div>
          <h2 className="text-2xl">
            Facebook helps you connect and share with the people in your life.
          </h2>
        </div>
        {/* Right side - Reset Password form */}
        <div className="w-1/2">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 pr-12"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
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
                  placeholder="Xác nhận mật khẩu mới"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 pr-12"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
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
                className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
              {error && <div className="text-red-500 text-center text-sm">{error}</div>}
              {success && (
                <div className="text-green-600 text-center text-sm">
                  {success}
                </div>
              )}
              <div className="text-center">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm; 