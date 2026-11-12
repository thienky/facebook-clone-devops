"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from "react";
import Post from "@/components/posts/Post";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import useRequireAuth from "@/lib/useRequireAuth";
import { PostData as BasePostData } from "@/lib/dummyData";

interface SavedPostData extends BasePostData {
  user?: {
    id: number;
    fullname: string;
    email: string;
    profilepic?: string;
  };
}

const SavedPage = () => {
  useRequireAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/backend/postsaved`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch saved posts');
        }
        const data = await res.json();
        // Backend trả về mảng các object PostSaved, mỗi object có chứa 'post'
        const extractedPosts = data.map((item: any) => {
          const post = item.post;
          // Map media: ưu tiên photos, nếu không có thì map từ mediaUrl
          let media: { type: 'image' | 'video'; url: string }[] = [];
          if (Array.isArray(post.photos) && post.photos.length > 0) {
            media = post.photos.map((photo: any) => ({
              type: photo.isType === 1 ? 'video' : 'image',
              url: photo.url,
            }));
          } else if (Array.isArray(post.mediaUrl)) {
            media = post.mediaUrl.map((url: string) => ({
              type: /\.(mp4|mov|avi|wmv|flv|webm)$/i.test(url) ? 'video' : 'image',
              url,
            }));
          }
          // Map comments như cũ
          const comments = Array.isArray(post.comments)
            ? post.comments.map((c: any) => ({
                author: c.author
                  ? {
                      name: c.author.fullname || c.author.email || 'User',
                      avatar: c.author.profilepic || '/avatars/default-avatar.png',
                      email: c.author.email || '',
                    }
                  : {
                      name: 'User',
                      avatar: '/avatars/default-avatar.png',
                      email: '',
                    },
                content: c.content,
                timeAgo: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
                likes: 0,
              }))
            : [];
          return {
            ...post,
            author: {
              name: post.user?.fullname || post.user?.email || 'User',
              avatar: post.user?.profilepic || '/avatars/default-avatar.png',
              email: post.user?.email || '',
            },
            media,
            comments,
            reactions: post.reactions || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
            shares: post.shares || 0,
            timeAgo: post.timeAgo || new Date(post.createdAt).toLocaleDateString(),
          };
        });
        setSavedPosts(extractedPosts);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const handleUnsave = (postId: number) => {
    setSavedPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
  };

  return (
    <>
      <Header />
      <div className="flex bg-gray-100 min-h-screen">
        {/* Left Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 min-h-screen">
          <LeftSidebar />
        </aside>
        {/* Main Content */}
        <main className="flex-1 max-w-xl mx-auto py-6 px-2">
          <h1 className="text-2xl font-bold mb-4">Saved Posts</h1>
          {loading ? (
            <div className="text-center py-10">Loading saved posts...</div>
          ) : savedPosts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <div className="text-lg font-semibold">No saved items</div>
              <div className="text-sm">You haven't saved any posts yet.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {savedPosts.map((post, idx) => (
                <div key={post.id} className="relative">
                  <Post
                    {...post}
                    isOnSavedPage={true}
                    onUnsave={() => handleUnsave(post.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
        {/* Right Sidebar (optional, để trống hoặc thêm gì đó sau) */}
        <aside className="hidden lg:block w-72 flex-shrink-0"></aside>
      </div>
    </>
  );
};

export default SavedPage; 

