"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Sender {
  id: number;
  fullname: string;
  profilepic?: string;
}

interface FriendRequest {
  id: number;
  sender: Sender;
  status: string;
}

const ReceivedFriendRequests = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceivedRequests = async () => {
    const storedUser = sessionStorage.getItem('user');
    const accessToken = sessionStorage.getItem('accessToken');
    console.log('ReceivedFriendRequests: user:', storedUser, 'accessToken:', accessToken);
    if (!storedUser) {
      setLoading(false);
      return;
    }
    const currentUser = JSON.parse(storedUser);
    setLoading(true);
    try {
      console.log('ReceivedFriendRequests: Bắt đầu fetch pending requests');
      const res = await fetch(`${API_BASE}/backend/friendrequest/pending/${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      console.log('ReceivedFriendRequests: Đã fetch xong, status:', res.status);
      const data = await res.json();
      console.log('ReceivedFriendRequests: DATA:', data);
      setRequests(data.received || []);
    } catch (error) {
      console.error('ReceivedFriendRequests: FETCH ERROR:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('ReceivedFriendRequests mounted');
    fetchReceivedRequests();
  }, []);

  const handleResponse = async (senderId: number, status: 'accept' | 'reject') => {
    const accessToken = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`${API_BASE}/backend/friendrequest/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ senderId, status }),
      });

      if (res.ok) {
        setRequests(prevRequests =>
          prevRequests.filter(req =>
            req && req.sender && typeof req.sender.id !== 'undefined' && req.sender.id !== senderId
          )
        );
      } else {
        console.error('Failed to respond to friend request');
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  // Map lại dữ liệu cho đúng API mới, loại bỏ phần tử không hợp lệ
  const mappedRequests = ((requests as any[]) || [])
    .filter(req => req && req.from && typeof req.from.id !== 'undefined')
    .map((req: any) => ({
      id: req.requestId,
      sender: req.from,
      // status: req.status, // Không có status trong API mẫu
    }));

  // Nếu requests là FriendRequest[] chuẩn (có sender), thì map lại cho an toàn
  const safeMappedRequests = Array.isArray(requests)
    ? requests.filter(req => req && req.sender && typeof req.sender.id !== 'undefined')
    : [];

  // Ưu tiên mappedRequests nếu có, nếu không thì dùng safeMappedRequests
  const finalRequests = mappedRequests.length > 0 ? mappedRequests : safeMappedRequests;

  return (
    <div>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : finalRequests.length > 0 ? (
        <div className="space-y-4">
          {finalRequests.map((req) => (
            req && req.sender && typeof req.sender.id !== 'undefined' && (
              <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <Link href={`/profile/${req.sender.id}`}>
                  <div className="w-10 h-10 relative">
                    <Image
                      src={req.sender.profilepic || '/avatars/default-avatar.png'}
                      alt={req.sender.fullname}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${req.sender.id}`}>
                    <h3 className="font-semibold text-sm truncate hover:underline">{req.sender.fullname}</h3>
                  </Link>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleResponse(req.sender.id, 'accept')}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleResponse(req.sender.id, 'reject')}
                      className="px-3 py-1 bg-gray-200 text-black rounded-lg text-xs font-semibold hover:bg-gray-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-2">No new friend requests.</div>
      )}
    </div>
  );
};

export default ReceivedFriendRequests; 