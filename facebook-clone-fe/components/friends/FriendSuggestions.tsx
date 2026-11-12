import { API_BASE } from '@/lib/apiBase';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/backend/friendrequest/suggestions?page=1&limit=100`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const data = await res.json();
        const suggestionsData = Array.isArray(data) ? data : (data.data || []);
        setSuggestions(suggestionsData);
      } catch (err: any) {
        setError(err.message || 'Error fetching suggestions');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleAddFriend = async (receiverId: number) => {
    setLoadingId(receiverId);
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/backend/friendrequest/send/${receiverId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        const user = suggestions.find(s => s.id === receiverId);
        const userName = user?.fullname || user?.name || 'User';
        alert(`Friend request sent successfully to ${userName}!`);
        setSuggestions(prev => prev.filter(s => s.id !== receiverId));
      } else {
        const errorMessage = data?.message || 'Failed to send friend request';
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Error sending friend request. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">People You May Know</h2>
        <a href="#" className="text-blue-500 text-sm font-medium hover:underline">See All</a>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-6">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-6">{error}</div>
        ) : suggestions.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No suggestions</div>
        ) : suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src={suggestion.profilepic || '/avatars/default-avatar.png'}
                alt={suggestion.fullname || 'User'}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm hover:underline cursor-pointer">{suggestion.fullname || suggestion.name}</h3>
              {suggestion.mutualFriends !== undefined && (
                <p className="text-gray-500 text-xs">{suggestion.mutualFriends} mutual friends</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 bg-blue-500 text-white py-1 rounded-md text-xs font-medium hover:bg-blue-600 disabled:opacity-60"
                  onClick={() => handleAddFriend(suggestion.id)}
                  disabled={loadingId === suggestion.id}
                >
                  {loadingId === suggestion.id ? 'Sending...' : 'Add Friend'}
                </button>
                <button className="flex-1 bg-gray-200 py-1 rounded-md text-xs font-medium hover:bg-gray-300">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 