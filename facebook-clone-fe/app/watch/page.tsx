'use client';
import React from 'react';
import Header from '@/components/layout/Header';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import WatchFeed from '@/components/watch/WatchFeed';

export default function WatchPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden md:flex" style={{background: '#f3f4f6'}}>
        <aside className="hidden md:block lg:w-72 bg-gray-100 p-4 overflow-y-auto flex-shrink-0">
          <LeftSidebar />
        </aside>
        <main className="flex-1 overflow-auto scrollbar-hide p-4 flex justify-center">
          <div className="w-full max-w-2xl">
            <WatchFeed />
          </div>
        </main>
        <aside className="hidden lg:block lg:w-72 bg-gray-100 p-4 overflow-y-auto flex-shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
} 