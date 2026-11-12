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

const FriendRequests = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      return;
    }
    const currentUser = JSON.parse(storedUser);
    const accessToken = sessionStorage.getItem('accessToken');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/backend/friendrequest/pending/${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.received || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Failed to fetch friend requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleResponse = async (senderId: number, status: 'accepted' | 'declined') => {
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
        setRequests(prevRequests => prevRequests.filter(req => req.sender.id !== senderId));
      } else {
        console.error('Failed to respond to friend request');
      }
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-7 bg-gray-200 rounded-md w-full"></div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">No new friend requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.filter(req => req && req.sender).map((req) => (
            <div key={req.id} className="flex items-center gap-3">
              <Link href={`/profile/${req.sender.id}`}>
                <div className="w-12 h-12 relative">
                    <Image
                    src={req.sender.profilepic || '/avatars/default-avatar.png'}
                    alt={req.sender.fullname}
                    fill
                    className="rounded-full object-cover"
                    />
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/profile/${req.sender.id}`}>
                    <h3 className="font-semibold text-sm hover:underline">{req.sender.fullname}</h3>
                </Link>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleResponse(req.sender.id, 'accepted')}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleResponse(req.sender.id, 'declined')}
                    className="flex-1 px-3 py-1 bg-gray-200 text-black rounded-lg text-xs font-semibold hover:bg-gray-300"
                  >
                    Delete
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

export default FriendRequests; 