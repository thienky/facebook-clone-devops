"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // TODO: Replace with real API call
    try {
      const res = await fetch(`${API_BASE}/backend/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email.');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
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
        {/* Right side - Forgot Password form */}
        <div className="w-1/2">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              {error && <div className="text-red-500 text-center text-sm">{error}</div>}
              {submitted && !error && (
                <div className="text-green-600 text-center text-sm">
                  If this email is registered, a reset link has been sent.
                </div>
              )}
              <div className="text-center">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm; 