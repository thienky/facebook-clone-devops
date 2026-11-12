"use client";
import { API_BASE } from '@/lib/apiBase';
import PostCard from '@/components/profile/PostCard';
import Image from 'next/image';
import CreatePostModal from '@/components/modals/CreatePostModal';
import React, { useState, useEffect } from 'react';
import { PostData } from '@/lib/dummyData';
import { useAuth } from '@/components/auth/AuthContext';
import Avatar from '../user/Avatar';
import { fetchTaggedPeople } from '@/lib/utils/taggedPeople';

const ProfileContent = ({ profile, currentUserId, profileId }: { profile?: any, currentUserId: number, profileId: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([]);

  const isOwner = profileId === currentUserId;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const accessToken = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/backend/post/user?user_id=${profileId}&page=1&limit=30`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      
      // Process posts and fetch tagged people information
      const mappedPosts = await Promise.all((Array.isArray(data.data) ? data.data : []).map(async (item: any) => {
        let taggedPeople: any[] = [];
        
        // If friends array exists, fetch user information for each friend ID
        if (item.friends && Array.isArray(item.friends) && item.friends.length > 0 && accessToken) {
          taggedPeople = await fetchTaggedPeople(item.friends, accessToken);
        }

        // Tổng hợp reactions
        const reactionSummary: Record<string, number> = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
        let myReaction = null;
        if (Array.isArray(item.reactions)) {
          item.reactions.forEach((r: any) => {
            const type = String(r.type);
            if (reactionSummary[type] !== undefined) reactionSummary[type]++;
            if (user && r.userId === user.id) myReaction = r.type;
          });
        }

        return {
          id: item.id,
          author: {
            name: item.user?.fullname || item.user?.email || 'User',
            avatar: item.user?.profilepic || '/default-avatar.png',
            email: item.user?.email || '',
          },
          timeAgo: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
          content: item.content || '',
          media: Array.isArray(item.mediaUrl)
            ? item.mediaUrl.map((url: string) => {
                const ext = url.split('.').pop()?.toLowerCase();
                let type: 'image'|'video' = 'image';
                if(['mp4','mov','avi','webm'].includes(ext||'')) type = 'video';
                return { type, url };
              })
            : [],
          reactions: reactionSummary,
          comments: Array.isArray(item.comments)
            ? item.comments.map((c: any) => ({
                author: c.author
                  ? {
                      name: c.author.fullname || c.author.email || 'User',
                      avatar: c.author.profilepic || '/avatars/default-avatar.png',
                      email: c.author.email || '',
                    }
                  : {
                      name: 'User',
                      avatar: '/avatars/default-avatar.png',
                      email: '',
                    },
                content: c.content,
                timeAgo: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
                likes: 0,
              }))
            : [],
          shares: item.shares || 0,
          taggedPeople: taggedPeople,
          myReaction: myReaction,
        };
      }));
      
      setPosts(mappedPosts);
      setLoading(false);
    };
    if (profileId) fetchPosts();
  }, [profileId]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditPost = (updatedPost: PostData) => {
    setPosts(prev => prev.map(post => post.id === updatedPost.id ? { ...post, ...updatedPost } : post));
  };

  const handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  return (
    <div className="w-full md:w-2/3 space-y-4">
      {/* Create Post section */}
      {isOwner && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Post</h2>
          <div className="flex items-center mb-4 gap-2">
            <Avatar author={{name:profile?.fullname, avatar: profile?.profilepic || "from-red-600 to-red-300"}} />
             <div
               onClick={handleOpenModal}
               className="flex-1 p-2 bg-gray-100 rounded-full text-sm text-gray-500 cursor-pointer hover:bg-gray-200"
               style={{ minHeight: '40px', paddingTop: '10px', paddingBottom: '10px' }}
             >
               What's on your mind, {profile?.fullname}?
             </div>
          </div>
          <div className="flex justify-around border-t border-gray-200 pt-3 -mx-4 px-4">
             <button 
               onClick={handleOpenModal}
               className="flex items-center text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md text-sm font-semibold cursor-pointer">
               <Image src="/images/icon-video.png" width={20} height={20} alt="Live Video"  className='gap-[10] flex mr-1'/>
               Video
             </button>
             <button 
               onClick={handleOpenModal}
               className="flex items-center text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md text-sm font-semibold cursor-pointer">
                <Image src="/images/icon-photo.png" width={20} height={20} alt="Photo/Video"  className='gap-[10] flex mr-1'/>
                Photo
             </button>
             <button 
               onClick={handleOpenModal}
               className="flex items-center text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md text-sm font-semibold cursor-pointer">
                <Image src="/images/icon-flag.png" width={20} height={20} alt="Feeling/Activity"  className='gap-[10] flex mr-1'/>
                Feeling/Activity
             </button>
          </div>
        </div>
      )}

      {/* Posts Feed section */}
      <div
        className="space-y-4"
      >
        {loading ? (
          <div className="text-center text-gray-400 py-8">Đang tải bài viết...</div>
        ) : !Array.isArray(posts) || posts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Chưa có bài viết nào.</div>
        ) : (
          posts.map((post, index) => (
            <PostCard
              key={post.id || String(index)}
              post={post}
              index={index}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
       {/* Create Post Modal */}
       {isModalOpen && (
         <CreatePostModal
           isOpen={isModalOpen}
           onClose={handleCloseModal}
           onSubmit={post => setPosts(prev => [post, ...prev])}
         />
       )} {/* Render modal conditionally */}
    </div>
  );
};

export default ProfileContent; 