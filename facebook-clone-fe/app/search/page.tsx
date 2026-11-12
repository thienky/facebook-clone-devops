"use client";
import React, { useState } from "react";
import { usePostContext } from "@/context/PostContext";
import Post from "@/components/posts/Post";
import { useAuth } from "@/components/auth/AuthContext";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default function SearchPage() {
  const { posts } = usePostContext();
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  // Lọc kết quả theo content, author, tag
  const results = posts.filter(post => {
    const q = query.toLowerCase();
    return (
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q) ||
      (post.taggedPeople && post.taggedPeople.some(p => p.name.toLowerCase().includes(q)))
    );
  });

  // Gợi ý trending (lấy 5 post nhiều reaction nhất)
  const trending = [...posts]
    .sort((a, b) => {
      const ra = Object.values(a.reactions).reduce((s, v) => s + v, 0);
      const rb = Object.values(b.reactions).reduce((s, v) => s + v, 0);
      return rb - ra;
    })
    .slice(0, 5);

  return (
    <>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden md:flex" style={{ background: '#f3f4f6' }}>
          <aside className="hidden md:block lg:w-72 bg-gray-100 p-4 overflow-y-auto flex-shrink-0">
            <LeftSidebar />
          </aside>
          <main className="flex-1 overflow-auto scrollbar-hide p-4 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="max-w-2xl mx-auto py-8 px-2">
                {query === "" && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 text-gray-700">Trending Searches</h2>
                    <div className="space-y-2">
                      {trending.map((post, i) => (
                        <div
                          key={i}
                          className="cursor-pointer hover:bg-gray-100 rounded-lg px-4 py-2"
                          onClick={() => setQuery(post.content.slice(0, 30))}
                        >
                          <span className="font-medium text-blue-600">{post.author.name}</span>: {post.content.slice(0, 60)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  {query && results.length === 0 && (
                    <div className="text-gray-500 text-center">No results found.</div>
                  )}
                  {results.map((post, i) => (
                    <Post key={i} {...post} />
                  ))}
                </div>
              </div>
            </div>
          </main>
          <aside className="hidden lg:block lg:w-72 bg-gray-100 p-4 overflow-y-auto flex-shrink-0">
              <RightSidebar />
          </aside> 
        </div>
      </div>
    </>
  );
}



// Giao diện input tìm kiếm lớn, hiện trending (bài nhiều reaction nhất).
// Kết quả tìm kiếm realtime: lọc theo nội dung, tên tác giả, người được tag.
// Hiển thị kết quả giống NewsFeed (dùng lại component Post, đầy đủ media, tag, comment...).
// Giao diện hiện đại, UX mượt mà, có gợi ý trending, placeholder, trạng thái không tìm thấy.