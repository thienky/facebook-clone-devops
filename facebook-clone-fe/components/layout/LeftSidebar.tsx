"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import Avatar from '../user/Avatar';

const LeftSidebar = () => {
  const { user, avatarVersion } = useAuth();
  const menuItems = [
    { name: 'Pages', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="3" height="18" rx="1.5" fill="#2196F3"/>
        <rect x="7" y="5" width="10" height="6" rx="2" fill="#FF6D1B"/>
        <rect x="9" y="11" width="10" height="6" rx="2" fill="#FF9139"/>
      </svg>
    ), href: '/pages' },
    { name: 'Friends', icon: '👥', href: '/friends' }, 
    { name: 'Watch', icon: '📺', href: '/watch' },
    { name: 'Saved', icon: '🔖', href: '/saved' }, 
  ];

  return (
    <div className="p-4 flex flex-col">
      {/* User Section */}
      <Link href="/profile" className="flex items-center p-2 rounded-lg hover:bg-gray-200 cursor-pointer mb-4 -ml-2 -mr-2 gap-[10]">
        <Avatar author={{
          avatar: user?.profilepic ? user.profilepic + '?v=' + avatarVersion : "from-red-600 to-red-300",
          name: user?.fullname || "User"
        }} />
        <span className="font-semibold text-gray-800">{user?.fullname || 'User'}</span>
      </Link>

      {/* Divider */}
      <hr className="border-t border-gray-300 my-2" />

      {/* Menu Items */}
      <ul className="space-y-1 flex-grow">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link href={item.href} className="flex items-center p-2 rounded-lg hover:bg-gray-200 cursor-pointer text-gray-700 -ml-2 -mr-2">

              <div className="w-8 h-8 flex items-center justify-center mr-3 text-xl">
                {item.icon}
              </div>
              <span className="font-medium text-gray-800 text-sm">{item.name}</span>
            </Link>
          </li>
        ))}

      </ul>

    </div>
  );
};

export default LeftSidebar; 