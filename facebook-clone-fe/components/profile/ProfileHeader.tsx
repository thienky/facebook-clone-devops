"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FolderDot, UserPlus, UserCog, UserCheck, UserX, UserMinus } from 'lucide-react';
import EditDetailsModal, { DetailsData } from '../modals/EditDetailsModal';
import EditAvatarModal from '../modals/EditAvatarModal';
import EditCoverPhotoModal from '../modals/EditCoverPhotoModal';
import { useAuth } from '@/components/auth/AuthContext';
import { createPortal } from 'react-dom';

enum FriendStatus {
  FRIEND = 0,
  PENDING_SENT = 1,
  PENDING_RECEIVED = 2,
  NONE = 3,
}

interface ProfileHeaderProps {
  profile: any;
  profileId: number;
  currentUserId: number;
  onProfileUpdated?: () => void;
  friendsCount?: number;
}

const defaultDetails: DetailsData = {
  fullname: '',
  phone: '',
  profilepic: '',
  coverpic: '',
  bio: '',
  birthplace: '',
  workingPlace: '',
  isActive: false,
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  profileId,
  currentUserId,
  onProfileUpdated,
  friendsCount = 0,
}) => {
  const { user, updateUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserName, setCurrentUserName] = useState(profile?.fullname || profile?.email || '');
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState(profile?.profilepic || '/avatars/default-avatar.png');
  const [details, setDetails] = useState<DetailsData>({
    fullname: profile?.fullname || '',
    phone: profile?.phone || '',
    profilepic: profile?.profilepic || '',
    coverpic: profile?.coverpic || '',
    bio: profile?.bio || '',
    birthplace: profile?.birthplace || '',
    workingPlace: profile?.workingPlace || '',
    isActive: typeof profile?.isActive !== 'undefined' ? profile.isActive : true,
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>(FriendStatus.NONE);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [coverVersion, setCoverVersion] = useState(Date.now());
  const isFirstRender = useRef(true);

  const isOwner = profileId === currentUserId;

  // Cập nhật state khi props thay đổi
  useEffect(() => {
    setCurrentUserName(profile?.fullname || profile?.email || '');
    setCurrentProfilePictureUrl(profile?.profilepic || '/avatars/default-avatar.png');
  }, [profile]);

  // Check friend status when component mounts or profileId changes
  useEffect(() => {
    const checkFriendStatus = async () => {
      if (isOwner || !profileId) {
        setIsLoadingStatus(false);
        return;
      }
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/backend/friendrequest/status/${profileId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setFriendStatus(data.status);
        }
      } catch (error) {
        console.error('Error checking friend status:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    checkFriendStatus();
  }, [profileId, isOwner]);

  useEffect(() => {
    // Khi prop coverPhotoUrl thay đổi (profile mới), reset version
    if (!isFirstRender.current) {
      setCoverVersion(Date.now());
    } else {
      isFirstRender.current = false;
    }
  }, [profile?.coverpic]);

  // Lấy cover photo tạm nếu có
  let coverPhoto = profile?.coverpic || '/avatars/default-avatar.png';
  if (typeof window !== 'undefined') {
    const temp = localStorage.getItem('temp_cover_photo');
    if (temp) coverPhoto = temp;
  }

  const handleAddFriend = async () => {
    if (isAddingFriend || friendStatus !== FriendStatus.NONE) return;
    setIsAddingFriend(true);
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/backend/friendrequest/send/${profileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setFriendStatus(FriendStatus.PENDING_SENT);
        alert('Đã gửi lời mời kết bạn thành công!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Gửi lời mời kết bạn thất bại!');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Có lỗi xảy ra khi gửi lời mời kết bạn!');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleAcceptFriend = async () => {
    if (isAddingFriend) return;
    setIsAddingFriend(true);
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/backend/friendrequest/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: profileId,
          status: 'accept',
        }),
      });
      if (res.ok) {
        setFriendStatus(FriendStatus.FRIEND);
        alert('Đã chấp nhận lời mời kết bạn!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Chấp nhận lời mời kết bạn thất bại!');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Có lỗi xảy ra khi chấp nhận lời mời kết bạn!');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleCancelOrUnfriend = async () => {
    if (isAddingFriend) return;
    setIsAddingFriend(true);
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/backend/friendrequest/unfriend/${currentUserId}/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        setFriendStatus(FriendStatus.NONE);
        const message = friendStatus === FriendStatus.FRIEND ? 'Đã hủy kết bạn!' : 'Đã hủy lời mời kết bạn!';
        alert(message);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Thao tác thất bại!');
      }
    } catch (error) {
      console.error('Error canceling/unfriending:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const renderActionButton = () => {
    if (isLoadingStatus) {
      return (
        <button className="flex items-center px-3 py-2 bg-gray-400 text-white font-semibold rounded-md shadow-sm cursor-not-allowed text-sm">
          <span>Đang tải...</span>
        </button>
      );
    }
    
    switch (friendStatus) {
      case FriendStatus.FRIEND:
        return (
          <button
            className="flex items-center px-3 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 transition duration-300 text-sm cursor-pointer gap-2"
            onClick={handleCancelOrUnfriend}
            disabled={isAddingFriend}
          >
            <UserMinus className="w-4 h-4 mr-1" />
            <span>Hủy kết bạn</span>
          </button>
        );
      case FriendStatus.PENDING_SENT:
        return (
          <button
            className="flex items-center px-3 py-2 bg-gray-500 text-white font-semibold rounded-md shadow-sm cursor-not-allowed text-sm"
            disabled={true}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            <span>Đã gửi lời mời</span>
          </button>
        );
      case FriendStatus.PENDING_RECEIVED:
        return (
          <button
            className="flex items-center px-3 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition duration-300 text-sm cursor-pointer gap-2"
            onClick={handleAcceptFriend}
            disabled={isAddingFriend}
          >
            <UserCheck className="w-4 h-4 mr-1" />
            <span>Chấp nhận</span>
          </button>
        );
      case FriendStatus.NONE:
      default:
        return (
          <button
            className="flex items-center px-3 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition duration-300 text-sm cursor-pointer gap-2"
            onClick={handleAddFriend}
            disabled={isAddingFriend}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            <span>{isAddingFriend ? 'Đang gửi...' : 'Add Friend'}</span>
          </button>
        );
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-b-lg overflow-hidden mb-4 border-b border-gray-200 max-w-[1200px] mx-auto">
      {/* Cover Photo */}
      <div className="w-full h-40 md:h-60 lg:h-80 bg-gray-200 relative group cursor-pointer">
        <Image
          src={coverPhoto + '?v=' + coverVersion}
          alt="Cover Photo"
          layout="fill"
          objectFit="cover"
        />
        {isOwner && (
          <button
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
            onClick={() => setShowCoverModal(true)}
            title="Cập nhật cover photo"
          >
            <FolderDot className="w-10 h-10 text-white" />
          </button>
        )}
      </div>
      {/* Profile Info and Buttons */}
      <div className="flex flex-col md:flex-row items-center gap-4 px-6 py-4 mt-[-40px]">
        {/* Profile Picture */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md z-10 bg-gray-300 flex-shrink-0 relative group cursor-pointer">
          <Image
            src={currentProfilePictureUrl}
            alt="Profile Picture"
            layout="fill"
            objectFit="cover"
            className='rounded-full max-w-[130px] max-h-[130px] absolute top-0 left-0'
          />
          {isOwner && (
            <button
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer"
              onClick={() => setShowAvatarModal(true)}
              title="Cập nhật avatar"
            >
              <FolderDot className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
        <div className="flex-1 mt-4 md:ml-4 md:mt-0 text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{currentUserName}</h1>
          <p className="text-gray-600 text-sm mt-1">{friendsCount} friends</p>
        </div>
        {/* Action Buttons */}
        {isOwner ? (
          <button
            className="flex items-center px-3 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition duration-300 text-sm cursor-pointer gap-2"
            onClick={() => setShowEditModal(true)}
          >
            <UserCog className="w-5 h-5 mr-1" />
            <span>Edit Profile</span>
          </button>
        ) : (
          renderActionButton()
        )}
      </div>
      {/* Navigation Menu */}
      <div className="mt-2">
        <nav className="-mb-px flex space-x-6 px-4 md:px-6 text-sm overflow-x-auto hide-scrollbar">
          {[
            { name: 'Posts', href: '/profile' },
            { name: 'Friends', href: '/friends' },
            { name: 'Videos', href: '/watch' }
          ].map((item, index) => (
            <a
              key={item.name}
              href={item.href}
              className={`whitespace-nowrap py-3 px-1 border-b-2 ${index === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} font-semibold`}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
      {/* Modal sẽ được render qua portal ra ngoài root layout để tránh bị che */}
      {typeof window !== 'undefined' && createPortal(
        <EditDetailsModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            setDetails(data);
            setCurrentUserName(data.fullname);
            setCurrentProfilePictureUrl(data.profilepic);
            setShowEditModal(false);
            if (typeof onProfileUpdated === 'function') onProfileUpdated();
            if (profileId === currentUserId && typeof window !== 'undefined') {
              const userStr = sessionStorage.getItem('user');
              if (userStr) {
                const userObj = JSON.parse(userStr);
                userObj.fullname = data.fullname;
                userObj.profilepic = data.profilepic;
                sessionStorage.setItem('user', JSON.stringify(userObj));
                updateUser(userObj);
              }
            }
          }}
          initialData={{
            fullname: profile?.fullname || '',
            phone: profile?.phone || '',
            profilepic: profile?.profilepic || '',
            coverpic: profile?.coverpic || '',
            bio: profile?.bio || '',
            birthplace: profile?.birthplace || '',
            workingPlace: profile?.workingPlace || '',
            isActive: typeof profile?.isActive !== 'undefined' ? profile.isActive : true,
          }}
          userId={profileId}
          accessToken={typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || '' : ''}
        />, document.body)}
      {showAvatarModal && (
        <EditAvatarModal 
          onClose={() => setShowAvatarModal(false)}
          userId={currentUserId}
          accessToken={typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || '' : ''}
          onUploaded={(newAvatarUrl: string) => {
            if (typeof onProfileUpdated === 'function') onProfileUpdated();
            setCurrentProfilePictureUrl(newAvatarUrl);
            if (profileId === currentUserId && typeof window !== 'undefined') {
              const userStr = sessionStorage.getItem('user');
              if (userStr) {
                const userObj = JSON.parse(userStr);
                userObj.profilepic = newAvatarUrl;
                sessionStorage.setItem('user', JSON.stringify(userObj));
                updateUser(userObj);
              }
            }
          }}
        />
      )}
      {showCoverModal && (
        <EditCoverPhotoModal 
          onClose={() => setShowCoverModal(false)}
          userId={currentUserId}
          accessToken={typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || '' : ''}
          onUploaded={() => {
            if (typeof onProfileUpdated === 'function') onProfileUpdated();
            setCoverVersion(Date.now());
          }}
        />
      )}
    </div>
  );
};

export default ProfileHeader;
