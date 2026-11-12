'use client';
import { API_BASE } from '@/lib/apiBase';
import { useAuth } from '@/components/auth/AuthContext';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileContent from '@/components/profile/ProfileContent';
import { PostProvider } from '@/context/PostContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);

  // Lấy id từ URL, nếu không có thì lấy user.id
  const id = params?.id || user?.id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/backend/user/${id}`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleProfileUpdated = async () => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/backend/user/${id}`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="text-center py-10">Đang tải thông tin cá nhân...</div>;
  if (!profile) return <div className="text-center py-10 text-red-500">Không tìm thấy thông tin người dùng.</div>;

  const userData = {
    coverPhotoUrl: profile.coverpic || '/avatars/default-avatar.png',
    profilePictureUrl: profile.profilepic || '/avatars/default-avatar.png',
    userName: profile.fullname || profile.email || '',
  };

  return (
    <PostProvider>
      <div className="bg-gray-100 min-h-screen">
        <ProfileHeader {...userData} profileId={profile.id} currentUserId={user?.id} onProfileUpdated={handleProfileUpdated} friendsCount={friendsCount} profile={profile} />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 mt-4">
          <div className="flex flex-col md:flex-row mt-4 lg:mt-6 mx-auto max-w-[1200px]">
            <ProfileSidebar profile={profile} profileId={profile.id} currentUserId={user?.id} onProfileUpdated={handleProfileUpdated} setFriendsCount={setFriendsCount} />
            <ProfileContent profile={profile} profileId={profile.id} currentUserId={user?.id} />
          </div>
        </div>
      </div>
    </PostProvider>
  );
} 