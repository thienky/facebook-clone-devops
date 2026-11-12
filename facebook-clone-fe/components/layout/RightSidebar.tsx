"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Friend {
  id: number;
  fullname: string;
  profilepic?: string;
  isOnline?: boolean; // Tạm thời, sẽ xử lý logic online sau
}

const RightSidebar = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      const storedUser = sessionStorage.getItem('user');
      if (!storedUser) {
        setLoading(false);
        return;
      }
      const currentUser = JSON.parse(storedUser);
      const accessToken = sessionStorage.getItem('accessToken');
      
      if (!currentUser || !accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/backend/friendrequest/${currentUser.id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Gán isOnline ngẫu nhiên cho mục đích hiển thị, vì API chưa có
          const friendsWithStatus = data.map((friend: Friend) => ({
            ...friend,
            isOnline: Math.random() > 0.5,
          }));
          setFriends(friendsWithStatus);
        } else {
          console.error("Failed to fetch friends");
          setFriends([]);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="p-4 flex flex-col">
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">
          Contacts
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading contacts...</p>
        ) : friends.length > 0 ? (
          <ul className="space-y-2">
            {friends.map((friend, idx) => (
              <li key={`${friend.id}-${idx}`}>
                <Link href={`/profile/${friend.id}`} className="flex items-center p-2 rounded-md hover:bg-gray-200 cursor-pointer text-gray-700 -ml-2 -mr-2">
                  <div className="relative mr-3 w-8 h-8">
                    <Image
                      src={friend.profilepic || '/avatars/default-avatar.png'}
                      alt={`${friend.fullname}'s avatar`}
                      width={32}
                      height={32}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-800 text-sm">{friend.fullname}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No contacts to display.</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar; 