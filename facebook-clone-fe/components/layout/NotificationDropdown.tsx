import { API_BASE } from '@/lib/apiBase';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface NotifyItem {
  id: number;
  user?: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  image?: string;
  read?: boolean;
}

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<NotifyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/backend/notify/news`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        // API trả về { data: [...], ... }
        const arr = Array.isArray(data.data) ? data.data : [];
        const mapped = arr.map((item: any) => {
          // Lấy user/avatar từ user hoặc post.user
          let userObj = item.user;
          if ((!userObj || !userObj.fullname) && item.post && item.post.user) {
            userObj = item.post.user;
          }
          // Lấy preview media nếu có
          let image = '';
          if (item.post && Array.isArray(item.post.mediaUrl) && item.post.mediaUrl.length > 0) {
            image = item.post.mediaUrl[0];
          }
          return {
            id: item.id,
            user: userObj ? {
              name: userObj.fullname || userObj.email || 'User',
              avatar: userObj.profilepic || '/default-avatar.png',
            } : undefined,
            content: item.content,
            time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
            image,
            read: item.read || false,
          };
        });
        setNotifications(mapped);
      } catch (err: any) {
        setError(err.message || 'Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="absolute right-0 top-14 w-88 md:w-88 sm:w-72 bg-white rounded-lg shadow-lg py-2 z-30 border border-gray-200">
      <div className="px-4 py-2 border-b border-gray-100 font-bold text-lg text-gray-800">Notifications</div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No notifications</div>
        ) : notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer ${notif.read ? '' : 'bg-blue-50'}`}
          >
            <div className="relative mr-3">
              <Image
                src={notif.user?.avatar || '/default-avatar.png'}
                alt={notif.user?.name || 'User'}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
              {!notif.read && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-blue-500"></span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-800">
                <span className="font-semibold">{notif.user?.name || 'User'}</span> {notif.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown; 