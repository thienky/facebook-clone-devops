"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useRequireAuth from '@/lib/useRequireAuth';
import FriendRequests from '@/components/friends/FriendRequests';
import SentRequestsPlaceholder from '@/components/friends/SentRequestsPlaceholder';
import SentFriendRequests from '@/components/friends/SentFriendRequests';
import ReceivedFriendRequests from '@/components/friends/ReceivedFriendRequests';
import { usePathname } from 'next/navigation';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import Header from '@/components/layout/Header';

interface User {
  id: number;
  fullname: string;
  email: string;
  profilepic?: string;
}

enum FriendRequestStatus {
  Default = 'Add Friend',
  Sending = 'Sending...',
  Sent = 'Request Sent',
}

const FriendsPage = () => {
  useRequireAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<Record<number, FriendRequestStatus>>({});
  const [sentChanged, setSentChanged] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
        setLoading(false);
    }
  }, []);


  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/backend/friendrequest/suggestions?page=1&limit=100`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const responseData = await res.json();
        console.log('Suggestions API response:', responseData);
        const suggestions: User[] = Array.isArray(responseData) ? responseData : responseData.users || [];
        setUsers(suggestions);
        console.log('users state after setUsers:', suggestions);
      } catch (error) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleAddFriend = async (receiverId: number) => {
    const userToSend = users.find(u => u.id === receiverId);
    if (!userToSend) return;
    setRequestStatus(prev => ({ ...prev, [receiverId]: FriendRequestStatus.Sending }));
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/backend/friendrequest/send/${receiverId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setRequestStatus(prev => ({ ...prev, [receiverId]: FriendRequestStatus.Sent }));
        setUsers(prev => prev.filter(u => u.id !== receiverId));
        setSentRequests(prev => [...prev, userToSend]);
        setSentChanged(c => c + 1);
      } else {
        setRequestStatus(prev => ({ ...prev, [receiverId]: FriendRequestStatus.Default }));
      }
    } catch (error) {
      setRequestStatus(prev => ({ ...prev, [receiverId]: FriendRequestStatus.Default }));
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center">
      <Link href={`/profile/${user.id}`}>
        <div className="w-24 h-24 relative mb-3 cursor-pointer">
          <Image
            src={user.profilepic || '/avatars/default-avatar.png'}
            alt={user.fullname}
            fill
            className="rounded-full object-cover"
          />
        </div>
      </Link>
      <Link href={`/profile/${user.id}`}>
        <h2 className="text-md font-semibold text-gray-900 hover:underline truncate w-full">{user.fullname}</h2>
      </Link>
      <p className="text-sm text-gray-500 mb-4 truncate w-full">{user.email}</p>
      <button
        onClick={() => handleAddFriend(user.id)}
        disabled={requestStatus[user.id] === FriendRequestStatus.Sending || requestStatus[user.id] === FriendRequestStatus.Sent}
        className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-colors
          ${
            requestStatus[user.id] === FriendRequestStatus.Sent
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
          }
        `}
      >
        {requestStatus[user.id] || FriendRequestStatus.Default}
      </button>
    </div>
  );

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Left Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 min-h-screen bg-white">
        <LeftSidebar />
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-2 min-h-screen">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h1 className="text-2xl font-bold mb-2">People You May Know</h1>
          </div>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {users.map((user) => <UserCard key={user.id} user={user} />)}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10 bg-white p-6 rounded-lg shadow">
              <p className="text-lg">No New Friends to Suggest</p>
              <p>Check back later!</p>
            </div>
          )}
          
        </div>
      </main>
      {/* Right Sidebar: Friend Requests */}
      <aside className="hidden lg:block w-96 flex-shrink-0 p-6 space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-green-700">Received Friend Requests</h2>
          <ReceivedFriendRequests />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-purple-700">Sent Friend Requests</h2>
          <SentFriendRequests sentChanged={sentChanged} />
        </div>
      </aside>
    </div>
  );
};

export default FriendsPage; 