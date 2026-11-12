"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

const RegisterForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          error = 'Vui lòng nhập họ';
        } else if (value.length < 2) {
          error = 'Tên phải có ít nhất 2 ký tự';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          error = 'Vui lòng nhập tên';
        } else if (value.length < 2) {
          error = 'Họ phải có ít nhất 2 ký tự';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email không hợp lệ';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Vui lòng nhập mật khẩu';
        } else if (value.length < 6) {
          error = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Mật khẩu phải chứa chữ hoa, chữ thường và số';
        }
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field khi người dùng nhập
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate tất cả các trường
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof RegisterFormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      
      const response = await fetch(`${API_BASE}/backend/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: formData.firstName + ' ' + formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Đăng ký thành công, tự động đăng nhập
      try {
        await login(formData.email, formData.password);
        router.replace('/dashboard');
      } catch (loginError) {
        console.error('Lỗi đăng nhập tự động:', loginError);
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-600">Đăng ký</h1>
          <p className="text-gray-600 mt-2">Nhanh chóng và dễ dàng.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Họ"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:border-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Tên"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:border-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:border-blue-500 pr-12 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
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
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-8 py-3 rounded-md font-bold hover:bg-green-600 transition-colors disabled:bg-green-300"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            Đã có tài khoản?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 