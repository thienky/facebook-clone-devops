import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Person {
  id: string;
  name: string;
  avatar: string;
}

interface TagPeopleModalProps {
  onClose: () => void;
  onTagPeople: (taggedPeople: Person[]) => void;
}

const TagPeopleModal: React.FC<TagPeopleModalProps> = ({ onClose, onTagPeople }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [friends, setFriends] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch friends from API
  useEffect(() => {
    const fetchFriends = async () => {
      const storedUser = sessionStorage.getItem('user');
      const accessToken = sessionStorage.getItem('accessToken');
      
      if (!storedUser || !accessToken) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const currentUser = JSON.parse(storedUser);
        const res = await fetch(`${API_BASE}/backend/friendrequest/${currentUser.id}`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Transform the API response to match our Person interface
          const friendsList = data.map((friend: any) => ({
            id: friend.id.toString(),
            name: friend.fullname,
            avatar: friend.profilepic || '/avatars/default-avatar.png'
          }));
          setFriends(friendsList);
        } else {
          setError('Failed to fetch friends');
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        setError('Failed to fetch friends');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedPeople.find(p => p.id === friend.id)
  );

  const handleSelectPerson = (person: Person) => {
    setSelectedPeople([...selectedPeople, person]);
    setSearchTerm('');
  };

  const handleRemovePerson = (personId: string) => {
    setSelectedPeople(selectedPeople.filter(p => p.id !== personId));
  };

  const handleDone = () => {
    onTagPeople(selectedPeople);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Tag People</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for friends"
              className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:border-blue-500"
            />
            <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Selected People */}
        {selectedPeople.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {selectedPeople.map(person => (
                <div
                  key={person.id}
                  className="flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                >
                  {person.name}
                  <button
                    onClick={() => handleRemovePerson(person.id)}
                    className="ml-2 hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading friends...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map(friend => (
              <div
                key={friend.id}
                onClick={() => handleSelectPerson(friend)}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                  <Image
                    src={friend.avatar || '/avatars/default-avatar.png'}
                    alt={friend.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="ml-3 font-medium">{friend.name}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No friends found matching your search.' : 'No friends available to tag.'}
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleDone}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagPeopleModal; 