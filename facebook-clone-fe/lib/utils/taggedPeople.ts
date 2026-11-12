import { API_BASE } from '@/lib/apiBase';
interface Person {
  id: string;
  name: string;
  avatar: string;
}

/**
 * Fetches user information for tagged people from friend IDs
 * @param friends Array of friend IDs from backend
 * @param accessToken Authentication token
 * @returns Array of Person objects with user information
 */
export const fetchTaggedPeople = async (friends: number[], accessToken: string): Promise<Person[]> => {
  if (!friends || !Array.isArray(friends) || friends.length === 0) {
    return [];
  }

  try {
    const res = await fetch(`${API_BASE}/backend/user/many`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // nếu cần
      },
      body: JSON.stringify({ ids: friends })
    });
    if (!res.ok) {
      return [];
    }
    const users = await res.json();
    // users là mảng các user trả về từ backend
    return users.map((user: any) => ({
      id: user.id.toString(),
      name: user.fullname || user.email || 'User',
      avatar: user.profilepic || '/avatars/default-avatar.png',
    }));
  } catch (error) {
    console.error('Error fetching tagged people:', error);
    return [];
  }
};

/**
 * Converts Person array to friend IDs for backend
 * @param taggedPeople Array of Person objects
 * @returns Array of friend IDs
 */
export const convertToFriendIds = (taggedPeople: Person[]): number[] => {
  return taggedPeople.map(p => Number(p.id)).filter(id => !isNaN(id));
}; 