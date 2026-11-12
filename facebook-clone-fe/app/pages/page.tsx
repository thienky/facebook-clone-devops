"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import Image from "next/image";
import { Camera } from 'lucide-react';

export default function Pages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPages, setLikedPages] = useState<any[]>([]);
  const [loadingLiked, setLoadingLiked] = useState(true);
  const [errorLiked, setErrorLiked] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/pages/suggested`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error('Không thể lấy danh sách page!');
        const data = await res.json();
        // Map API data sang format card
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          name: item.name,
          desc: item.description,
          avatar: item.pagePicture,
          liked: false,
          likes: '', // Nếu API có trường likes thì map vào đây
          sub: '',
        }));
        setPages(mapped);
      } catch (err: any) {
        setError(err.message || 'Đã có lỗi xảy ra!');
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, []);

  useEffect(() => {
    const fetchLikedPages = async () => {
      setLoadingLiked(true);
      setErrorLiked(null);
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/pages/liked`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error('Không thể lấy danh sách page đã thích!');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          name: item.name,
          desc: item.description,
          avatar: item.pagePicture,
        }));
        setLikedPages(mapped);
      } catch (err: any) {
        setErrorLiked(err.message || 'Đã có lỗi xảy ra!');
      } finally {
        setLoadingLiked(false);
      }
    };
    fetchLikedPages();
  }, []);

  const handleLike = async (id: number) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likeLoading: true } : p))
    );
    const page = pages.find((p) => p.id === id);
    const accessToken = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_BASE}/pages/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Action failed');
      // Move page to likedPages
      setPages((prev) => prev.filter((p) => p.id !== id));
      setLikedPages((prev) => [
        { ...page, liked: true, likeLoading: false },
        ...prev,
      ]);
    } catch (err) {
      setPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likeLoading: false } : p))
      );
      alert('Failed to like page');
    }
  };

  const handleUnlike = async (id: number) => {
    setLikedPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likeLoading: true } : p))
    );
    const page = likedPages.find((p) => p.id === id);
    const accessToken = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_BASE}/pages/${id}/unlike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Action failed');
      // Move page to suggested
      setLikedPages((prev) => prev.filter((p) => p.id !== id));
      setPages((prev) => [
        { ...page, liked: false, likeLoading: false },
        ...prev,
      ]);
    } catch (err) {
      setLikedPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likeLoading: false } : p))
      );
      alert('Failed to unlike page');
    }
  };

  const handleClose = (id: number) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpenCreate = () => {
    setShowCreateModal(true);
    setCreateError(null);
    setImageFile(null);
    setImageUrl(null);
  };

  const handleCloseCreate = () => {
    setShowCreateModal(false);
    setCreateError(null);
    setImageFile(null);
    setImageUrl(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImageFile(file);
    // Always preview immediately
    setPreviewUrl(URL.createObjectURL(file));
    setUploadingImg(true);
    try {
      const formData = new FormData();
      if (file) formData.append('files', file as Blob);
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/backend/common/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      let imageUrl = '';
      if (Array.isArray(data.paths) && data.paths.length > 0) {
        imageUrl = `${API_BASE}/${data.paths[0].replace(/^\/+/,'')}`;
      } else if (data.path) {
        imageUrl = `${API_BASE}/${data.path.replace(/^\/+/,'')}`;
      } else {
        throw new Error('No image path returned');
      }
      setImageUrl(imageUrl);
    } catch (err) {
      setCreateError('Failed to upload image');
    } finally {
      setUploadingImg(false);
    }
  };

  // Reset preview and imageUrl when modal close
  useEffect(() => { if (!showCreateModal) { setPreviewUrl(null); setImageUrl(null); } }, [showCreateModal]);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const name = nameRef.current?.value?.trim();
      const description = descRef.current?.value?.trim();
      if (!name || !imageUrl) {
        setCreateError('Name and image are required');
        setCreateLoading(false);
        return;
      }
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          pagePicture: imageUrl,
        }),
      });
      if (!res.ok) throw new Error('Failed to create page');
      const data = await res.json();
      // Like the page after creation
      try {
        const likeRes = await fetch(`${API_BASE}/pages/${data.id}/like`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!likeRes.ok) throw new Error('Failed to like page after creation');
      } catch (err) {
        // Optional: show error, but still add to likedPages
      }
      setLikedPages(prev => [{
        id: data.id,
        name: data.name,
        desc: data.description,
        avatar: data.pagePicture,
      }, ...prev]);
      handleCloseCreate();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create page');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden md:flex">
        <aside className="hidden md:block lg:w-72 bg-gray-100 p-4 overflow-y-auto flex-shrink-0">
          <LeftSidebar />
        </aside>
        <main className="flex-1 overflow-auto scrollbar-hide p-4 flex flex-col items-center">
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Liked Pages</h2>
            {loadingLiked ? (
              <div className="text-center text-gray-500 py-4">Loading...</div>
            ) : errorLiked ? (
              <div className="text-center text-red-500 py-4">{errorLiked}</div>
            ) : likedPages.length === 0 ? (
              <div className="text-center text-gray-400 py-4">You haven't liked any pages yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {likedPages.map((page) => (
                  <div key={page.id} className="relative bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col">
                    <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-2">
                      <Image
                        src={page.avatar}
                        alt={page.name}
                        width={64}
                        height={64}
                        className="rounded-full border-4 border-white bg-white shadow"
                      />
                      <span className="font-bold text-gray-900 leading-tight text-base mt-2">{page.name}</span>
                      <span className="text-xs text-gray-600">{page.desc}</span>
                    </div>
                    {/* Unlike button */}
                    <div className="px-4 pb-4 mt-auto">
                      <button
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700 ${page.likeLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        onClick={() => !page.likeLoading && handleUnlike(page.id)}
                        disabled={page.likeLoading}
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6.5 10.5l2 2 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="#fff" strokeWidth="2"/></svg>
                        Unlike
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover Pages</h2>
            <h3 className="text-lg text-gray-600 mb-6">Suggested for you</h3>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading pages...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page) => (
                <div key={page.id} className="relative bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col">
                  {/* Close button */}
                  
                  {/* Avatar + Info */}
                  <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-2">
                    <Image
                      src={page.avatar}
                      alt={page.name}
                      width={64}
                      height={64}
                      className="rounded-full border-4 border-white bg-white shadow"
                    />
                    <span className="font-bold text-gray-900 leading-tight text-base mt-2">{page.name}</span>
                    <span className="text-xs text-gray-600">{page.desc}</span>
                  </div>
                  {/* Sub info */}
                  <div className="px-4 mt-2 text-xs text-gray-500">
                    {page.sub}
                  </div>
                  {/* Likes */}
                  <div className="px-4 text-xs text-gray-500 mb-2">{page.likes}</div>
                  {/* Like/Unlike button */}
                  <div className="px-4 pb-4 mt-auto">
                    <button
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-colors ${page.liked ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${page.likeLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={() => !page.likeLoading && handleLike(page.id)}
                      disabled={page.likeLoading}
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6.5 10.5l2 2 5-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="#2563eb" strokeWidth="2"/></svg>
                      {page.liked ? 'Unlike' : 'Like'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </main>
        <aside className="hidden lg:block lg:w-72 bg-gray-100 p-4 overflow-y-auto flex-shrink-0">
          <RightSidebar />
        </aside>
      </div>
      {/* Floating create page button */}
      <button
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg font-semibold text-base"
        onClick={handleOpenCreate}
      >
        <span className="text-2xl leading-none">+</span> Create your page
      </button>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleCreatePage} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={handleCloseCreate}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Create Page</h2>
            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">Page Name <span className="text-red-500">*</span></label>
              <input ref={nameRef} type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" required maxLength={100} />
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <textarea ref={descRef} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" rows={3} maxLength={500} />
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">Page Picture <span className="text-red-500">*</span></label>
              <div className="flex flex-col items-center">
                <label htmlFor="page-image-upload" className="relative group cursor-pointer">
                  <input
                    id="page-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-100 overflow-hidden transition-all duration-200 group-hover:border-blue-400 group-hover:bg-blue-50 ${previewUrl || imageUrl ? '' : 'border-gray-300'}`}>
                    {previewUrl || imageUrl ? (
                      <img
                        src={previewUrl || imageUrl || ''}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Camera className="w-10 h-10 mb-1" />
                        <span className="text-xs">Upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all duration-200"></div>
                  </div>
                </label>
                {(previewUrl || imageUrl) && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-blue-600 hover:underline"
                    onClick={() => { setImageFile(null); setImageUrl(null); setPreviewUrl(null); }}
                  >
                    Choose another image
                  </button>
                )}
                {uploadingImg && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
              </div>
            </div>
            {createError && <div className="text-red-500 text-sm mb-2">{createError}</div>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold mt-2 disabled:opacity-60" disabled={createLoading || uploadingImg}>
              {createLoading ? 'Creating...' : 'Create Page'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 