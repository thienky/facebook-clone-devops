"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Receiver {
  id: number;
  fullname: string;
  profilepic?: string;
}

interface SentRequest {
  id: number;
  receiver: Receiver;
  status: string;
}

interface SentFriendRequestsProps {
  sentChanged?: number;
}

const SentFriendRequests = ({ sentChanged }: SentFriendRequestsProps) => {
  const [requests, setRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSentRequests = async () => {
    const storedUser = sessionStorage.getItem('user');
    const accessToken = sessionStorage.getItem('accessToken');
    console.log('SentFriendRequests: user:', storedUser, 'accessToken:', accessToken);
    if (!storedUser) {
      setLoading(false);
      return;
    }
    const currentUser = JSON.parse(storedUser);
    setLoading(true);
    try {
      console.log('SentFriendRequests: Bắt đầu fetch pending requests');
      const res = await fetch(`${API_BASE}/backend/friendrequest/pending/${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      console.log('SentFriendRequests: Đã fetch xong, status:', res.status);
      const data = await res.json();
      console.log('SentFriendRequests: DATA:', data);
      setRequests(data.sent || []);
    } catch (error) {
      console.error('SentFriendRequests: FETCH ERROR:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, [sentChanged]);

  const handleCancelRequest = async (receiverId: number) => {
    const accessToken = sessionStorage.getItem('accessToken');
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) return;
    const currentUser = JSON.parse(storedUser);

    try {
      const res = await fetch(`${API_BASE}/backend/friendrequest/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ senderId: currentUser.id, receiverId }),
      });

      if (res.ok) {
        setRequests(prevRequests => prevRequests.filter(req => req.receiver.id !== receiverId));
      } else {
        console.error('Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
  };

  // Map lại dữ liệu cho đúng API mới
  const mappedRequests = requests.map((req: any) => ({
    id: req.requestId,
    receiver: req.to,
    status: req.status,
  }));

  return (
    <div>
      {loading ? (
        <div className="text-center text-gray-500">Loading requests...</div>
      ) : mappedRequests.length === 0 ? (
        <p className="text-gray-500 text-sm">No sent requests.</p>
      ) : (
        <div className="space-y-4">
          {mappedRequests.filter(req => req && req.receiver).map((req) => (
            <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <Link href={`/profile/${req.receiver.id}`}>
                <div className="w-10 h-10 relative">
                  <Image
                    src={req.receiver.profilepic || '/avatars/default-avatar.png'}
                    alt={req.receiver.fullname}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${req.receiver.id}`}>
                  <h3 className="font-semibold text-sm truncate hover:underline">{req.receiver.fullname}</h3>
                </Link>
                <div className="flex gap-2 mt-1">
                  <button
                    // onClick={() => handleCancelRequest(req.receiver.id)}
                    className="px-3 py-1 bg-gray-200 text-black rounded-lg text-xs font-semibold hover:bg-gray-300"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentFriendRequests; 