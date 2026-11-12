"use client";
import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import EditDetailsModal, { DetailsData } from '../modals/EditDetailsModal';
import { useAuth } from '../auth/AuthContext';

const defaultDetails: DetailsData = {
  fullname: '',
  phone: '',
  profilepic: '',
  coverpic: '',
  bio: '',
  birthplace: '',
  workingPlace: '',
  isActive: true,
};

interface ProfileSidebarProps {
  profile?: any;
  currentUserId: number;
  profileId: number;
  onProfileUpdated?: () => void;
  setFriendsCount?: (count: number) => void;
}

const ProfileSidebar = ({ profile, currentUserId, profileId, onProfileUpdated, setFriendsCount }: ProfileSidebarProps) => {
  const { user, updateUser } = useAuth();
  const [details, setDetails] = useState<DetailsData>(defaultDetails);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setDetails({
        fullname: profile.fullname || '',
        phone: profile.phone || '',
        profilepic: profile.profilepic || '',
        coverpic: profile.coverpic || '',
        bio: profile.bio || '',
        birthplace: profile.birthplace || '',
        workingPlace: profile.workingPlace || '',
        isActive: profile.isActive ?? true,
      });
    }
  }, [profile?.workingPlace, profile?.phone, profile?.birthplace, profile?.bio, profile?.fullname, profile?.profilepic, profile?.coverpic, profile?.isActive]);

  // Fetch photos from backend
  const [photos, setPhotos] = useState<string[]>([]);
  useEffect(() => {
    const fetchPhotos = async () => {
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `${API_BASE}/backend/photo/user?user_id=${profileId}&type=0&page=1&limit=12`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();
      // console.log('Photo API response:', data);
      const arr = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const urls = arr.map((item: any) => {
        if (item.url) return item.url;
        if (item.path) return `${API_BASE}/${item.path.replace(/^\/+/, '')}`;
        return '';
      });
      setPhotos(urls.filter(Boolean));
    };
    if (profileId) fetchPhotos();
  }, [profileId]);

  // Fetch friends from backend
  const [friends, setFriends] = useState<any[]>([]);
  useEffect(() => {
    const fetchFriends = async () => {
      const accessToken = sessionStorage.getItem('accessToken');
      try {
        const res = await fetch(
          `${API_BASE}/backend/friendrequest/${profileId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        const data = await res.json();
        console.log('Friends API response:', data);
        const arr = Array.isArray(data) ? data : [];
        setFriends(arr);
        if (setFriendsCount) setFriendsCount(arr.length);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setFriends([]);
        if (setFriendsCount) setFriendsCount(0);
      }
    };
    if (profileId) fetchFriends();
  }, [profileId, setFriendsCount]);

  // console.log('Photos to render:', photos);

  const [isEditDetailOpen, setIsEditDetailOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalIndex, setPhotoModalIndex] = useState<number | null>(null);

  const isOwner = profileId === currentUserId;

  return (
    <div className="w-full md:w-1/3 p-2 md:p-0 md:pr-4 space-y-4">
      {/* Intro section */}
      <div className="bg-white p-4 rounded-lg shadow-sm text-gray-700 text-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Intro</h2>
        <div className="space-y-2">
          <p className="flex items-center"><span className="font-semibold mr-1">Works at:</span> {details.workingPlace}</p>
          <p className="flex items-center"><span className="font-semibold mr-1">Phone:</span> {details.phone}</p>
          <p className="flex items-center"><span className="font-semibold mr-1">Lives in:</span> {details.birthplace}</p>
          <p className="flex items-center"><span className="font-semibold mr-1">From:</span> {details.birthplace}</p>
          {details.bio && <p className="flex items-center"><span className="font-semibold mr-1">Bio:</span> {details.bio}</p>}
        </div>
        {isOwner && (
          <>
            <button className="w-full py-2 mt-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300 text-sm cursor-pointer" onClick={() => setShowModal(true)}>Edit Details</button>
            <EditDetailsModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onSave={(data) => {
                setShowModal(false);
                if (onProfileUpdated) onProfileUpdated();
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
                isActive: profile?.isActive ?? true,
              }}
              userId={profileId}
              accessToken={typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') || '' : ''}
            />
          </>
        )}
      </div>
      {/* Photos section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Photos</h2>
        </div>
        {/* Responsive photo grid giống dashboard */}
        {(() => {
          const count = photos.length;
          if (count === 0) return <div className="text-gray-400 text-center py-4">No photos yet.</div>;
          if (count === 1) {
            return (
              <div className="relative w-full aspect-square bg-gray-300 rounded overflow-hidden cursor-pointer" onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}>
                <Image src={photos[0]} alt="Photo 1" fill sizes="100vw" style={{objectFit:'cover'}} />
              </div>
            );
          }
          if (count === 2) {
            return (
              <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                {photos.slice(0,2).map((url, i) => (
                  <div key={i} className="relative w-full aspect-square bg-gray-300 cursor-pointer" onClick={() => { setPhotoModalIndex(i); setIsPhotoModalOpen(true); }}>
                    <Image src={url} alt={`Photo ${i+1}`} fill sizes="100vw" style={{objectFit:'cover'}} />
                  </div>
                ))}
              </div>
            );
          }
          if (count === 3) {
            return (
              <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-lg overflow-hidden" style={{height: 200}}>
                <div className="relative row-span-2 col-span-1 w-full h-full cursor-pointer" onClick={() => { setPhotoModalIndex(0); setIsPhotoModalOpen(true); }}>
                  <Image src={photos[0]} alt="Photo 1" fill sizes="100vw" style={{objectFit:'cover'}} />
                </div>
                {[1,2].map(i => (
                  <div key={i} className="relative w-full h-full cursor-pointer" onClick={() => { setPhotoModalIndex(i); setIsPhotoModalOpen(true); }}>
                    <Image src={photos[i]} alt={`Photo ${i+1}`} fill sizes="100vw" style={{objectFit:'cover'}} />
                  </div>
                ))}
              </div>
            );
          }
          // 4+ ảnh: 2x2 grid, ảnh cuối overlay số lượng còn lại
          return (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-lg overflow-hidden" style={{height: 200}}>
              {photos.slice(0,4).map((url, i) => (
                <div key={i} className="relative w-full h-full cursor-pointer" onClick={() => { setPhotoModalIndex(i); setIsPhotoModalOpen(true); }}>
                  <Image src={url} alt={`Photo ${i+1}`} fill sizes="100vw" style={{objectFit:'cover'}} />
                  {i === 3 && count > 4 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-2xl font-bold z-10">
                      +{count-4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
        {isPhotoModalOpen && photoModalIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setIsPhotoModalOpen(false)}>
            <div className="relative max-w-2xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <div className="relative">
                {/* Button X luôn nằm trên ảnh */}
                <button
                  className="absolute top-2 right-2 p-1 bg-blue-500 rounded-full z-20"
                  onClick={() => setIsPhotoModalOpen(false)}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {/* Nút prev */}
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 z-10"
                  onClick={() => setPhotoModalIndex(i => (i !== null && i > 0 ? i - 1 : i))}
                  disabled={photoModalIndex === 0}
                  aria-label="Previous photo"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                {/* Nút next */}
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 z-10"
                  onClick={() => setPhotoModalIndex(i => (i !== null && i < photos.length - 1 ? i + 1 : i))}
                  disabled={photoModalIndex === photos.length - 1}
                  aria-label="Next photo"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
                <Image src={photos[photoModalIndex]} alt={`Photo ${photoModalIndex + 1}`} width={600} height={600} className="object-contain rounded-lg max-h-[80vh] max-w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Friends section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className='flex flex-row gap-2 items-center justify-between'>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Friends</h2>
          </div>
          <p className="text-gray-700 text-base mb-3">{friends.length} friends</p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {friends.slice(0, 6).map((friend, index) => (
            <a 
              key={friend.id} 
              href={`/profile/${friend.id}`}
              className="w-full h-full aspect-square bg-gray-300 rounded overflow-hidden hover:opacity-80 transition-opacity"
            >
              <Image 
                src={friend.profilepic || '/avatars/default-avatar.png'} 
                alt={`${friend.fullname}`} 
                width={100} 
                height={100} 
                style={{objectFit:'cover', width:'100%', height:'100%'}} 
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar; 