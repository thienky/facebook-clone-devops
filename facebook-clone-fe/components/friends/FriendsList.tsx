import Image from 'next/image';

// Mock data for demonstration
const mockFriends = [
  {
    id: 1,
    name: 'John Doe',
    avatar: '/avatars/default-avatar.png',
    mutualFriends: 12,
  },
  {
    id: 2,
    name: 'Jane Smith',
    avatar: '/avatars/default-avatar.png',
    mutualFriends: 8,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: '/avatars/default-avatar.png',
    mutualFriends: 15,
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    avatar: '/avatars/default-avatar.png',
    mutualFriends: 6,
  },
  {
    id: 5,
    name: 'David Brown',
    avatar: '/avatars/default-avatar.png',
    mutualFriends: 9,
  },
  {
    id: 6,
    name: 'Emma Davis',
    avatar: '/avatars/default-avatar.png',
    mutualFriends: 11,
  },
];

export default function FriendsList() {
  return (
    <>
      {mockFriends.map((friend) => (
        <div key={friend.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative h-48">
            <Image
              src={friend.avatar || '/avatars/default-avatar.png'}
              alt={friend.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 hover:underline cursor-pointer">{friend.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{friend.mutualFriends} mutual friends</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-500 text-white py-1.5 rounded-md hover:bg-blue-600 text-sm font-medium">
                Add Friend
              </button>
              <button className="flex-1 bg-gray-200 py-1.5 rounded-md hover:bg-gray-300 text-sm font-medium">
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
} 