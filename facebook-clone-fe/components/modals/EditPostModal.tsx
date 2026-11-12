import { API_BASE } from '@/lib/apiBase';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { PostData } from '@/lib/dummyData';
import { useAuth } from '../auth/AuthContext';
import Avatar from '../user/Avatar';
import TagPeopleModal from './TagPeopleModal';

interface Person {
  id: string;
  name: string;
  avatar: string;
}

interface EditPostModalProps {
  post: PostData;
  onClose: () => void;
  onEdit: (updatedPost: PostData) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onEdit }) => {
  const [postContent, setPostContent] = useState(post.content);
  const [previewMedia, setPreviewMedia] = useState<{type: 'image'|'video', url: string, file?: File}[]>(
    post.media?.map(m => ({ type: m.type, url: m.url })) || []
  );
  const [showTagPeopleModal, setShowTagPeopleModal] = useState(false);
  const [taggedPeople, setTaggedPeople] = useState<Person[]>(
    (post.taggedPeople || []).map(p => ({
      id: p.id || '',
      name: p.name,
      avatar: p.avatar
    }))
  );
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Nếu không có text và không có media thì không cho đăng
    if (!postContent.trim() && previewMedia.length === 0) {
      setToast('Vui lòng nhập nội dung hoặc chọn ảnh/video.');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    try {
      const accessToken = sessionStorage.getItem('accessToken');
      let mediaUrl: string[] = [];

      // 1. UPLOAD MEDIA
      if (previewMedia.length > 0) {
        const images = previewMedia.filter(media => media.type === 'image' && media.file);
        const videos = previewMedia.filter(media => media.type === 'video' && media.file);
        // Upload images
        if (images.length > 0) {
          const formData = new FormData();
          images.forEach(media => {
            if (media.file) {
              formData.append('files', media.file);
            }
          });
          const uploadRes = await fetch(`${API_BASE}/backend/common/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && Array.isArray(uploadData?.paths)) {
            mediaUrl = mediaUrl.concat(uploadData.paths.map((p: string) => `${API_BASE}/${p.replace(/^\/+/,'')}`));
          } else {
            throw new Error(uploadData?.message || 'Upload file thất bại.');
          }
        }
        // Upload videos
        if (videos.length > 0) {
          const formData = new FormData();
          videos.forEach(media => {
            if (media.file) {
              formData.append('files', media.file);
            }
          });
          const uploadRes = await fetch(`${API_BASE}/backend/common/upload-videos`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          });
          const uploadData = await uploadRes.json();
          
          if (uploadRes.ok) {
            mediaUrl = mediaUrl.concat(uploadData.files.map((file: { path: string }) => `${API_BASE}/${file.path.replace(/^[/\\]+/, '')}`));
          } else {
            throw new Error(uploadData?.message || 'Upload file thất bại.');
          }
        }
      }

      // Lấy media cũ không có file (chỉ có url)
      const oldMediaUrls = previewMedia.filter(m => !m.file).map(m => m.url);
      // mediaUrl là media cũ + media mới upload
      mediaUrl = oldMediaUrls.concat(mediaUrl);

      // 2. EDIT POST
      const payload: any = {
        content: postContent,
        friends: taggedPeople.map(p => Number(p.id)).filter(id => !isNaN(id)),
      };
      if (mediaUrl.length > 0) {
        payload.mediaUrl = mediaUrl;
      }
      console.log(payload.mediaUrl)
      const res = await fetch(`${API_BASE}/backend/post/${post.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      
      const result = await res.json().catch(() => null);
      console.log(result  )
      if (!res.ok) throw new Error(result?.message || 'Đăng bài thất bại');
      
      // Process tagged people from friends array
      let updatedTaggedPeople: Person[] = [];
      if (result.friends && Array.isArray(result.friends) && result.friends.length > 0 && accessToken) {
        try {
          const friendPromises = result.friends.map(async (friendId: number) => {
            try {
              const friendRes = await fetch(`${API_BASE}/backend/user/${friendId}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              });
              if (friendRes.ok) {
                const friendData = await friendRes.json();
                return {
                  id: friendData.id.toString(),
                  name: friendData.fullname || friendData.email || 'User',
                  avatar: friendData.profilepic || '/avatars/default-avatar.png',
                };
              }
              return null;
            } catch (error) {
              console.error('Error fetching friend info:', error);
              return null;
            }
          });
          
          const friendResults = await Promise.all(friendPromises);
          updatedTaggedPeople = friendResults.filter(friend => friend !== null);
        } catch (error) {
          console.error('Error processing tagged people:', error);
        }
      }
      
      const mappedPost: PostData = {
        id: result.id,
        author: {
          name: user?.fullname || user?.email || 'User',
          avatar: result.user?.profilepic || '/default-avatar.png',
          email: user?.email || '',
        },
        timeAgo: result.createdAt ? new Date(result.createdAt).toLocaleString() : '',
        content: result.content || '',
        media: Array.isArray(result.mediaUrl)
          ? result.mediaUrl.map((url: string) => {
              const ext = url.split('.').pop()?.toLowerCase();
              let type: 'image'|'video' = 'image';
              if(['mp4','mov','avi','webm'].includes(ext||'')) type = 'video';
              return { type, url };
            })
          : [],
        reactions: result.reactions || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        comments: result.comments || [],
        shares: result.shares || 0,
        taggedPeople: updatedTaggedPeople,
      };
      onEdit(mappedPost);
      setToast('Cập nhật bài viết thành công!');
      setPostContent('');
      setPreviewMedia([]);
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error when posting:', err);
      setToast(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMedia = files.map(file => ({
      type: file.type.startsWith('image/') ? 'image' as 'image' : 'video' as 'video',
      url: URL.createObjectURL(file),
      file
    }));
    setPreviewMedia(prev => [...prev, ...newMedia]);
  };

  const removeFile = (index: number) => {
    if (previewMedia[index].file) {
      URL.revokeObjectURL(previewMedia[index].url);
    }
    setPreviewMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagPeople = (people: Person[]) => {
    setTaggedPeople(people);
    setShowTagPeopleModal(false);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewMedia.forEach(m => {
        if (m.file) URL.revokeObjectURL(m.url);
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="relative border-b px-4 py-3 border-b-[#dedede]">
          <h1 className="text-xl font-semibold text-center">Edit post</h1>
          <button
            onClick={onClose}
            className="absolute right-4 top-3 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center mb-4 gap-2">
              <Avatar author={{avatar: "from-red-600 to-red-300", name: user?.fullname}} />
              <div>
                <p className="font-semibold text-sm">{user?.displayName || post.author.name || "User"}</p>
              </div>
            </div>

            {/* Post Content Input */}
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] text-lg resize-none border-0 focus:outline-none focus:ring-0 p-0"
            />

            {/* Tagged People Display */}
            {taggedPeople.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {taggedPeople.map(person => (
                    <div
                      key={person.id}
                      className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{person.name}</span>
                      <button
                        type="button"
                        onClick={() => setTaggedPeople(prev => prev.filter(p => p.id !== person.id))}
                        className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Preview */}
            {previewMedia.length > 0 && (
              <div className="mb-4 border border-gray-300 rounded-lg p-2 h-[300px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {previewMedia.map((media, index) => (
                    <div key={index} className="relative aspect-video">
                      {media.type === 'image' ? (
                        <Image src={media.url} alt="Preview" fill className="object-cover rounded-lg" />
                      ) : (
                        <video src={media.url} className="w-full h-full object-cover rounded-lg" controls />
                      )}
                      <button type="button" onClick={() => removeFile(index)} className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 hover:bg-opacity-75 rounded-full text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Media */}
            <div className='flex items-center justify-between'>
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Add to your post</span>
              <div className="flex items-center space-x-1.5">
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer" onClick={handleFileSelect}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#45BD62" className="w-6 h-6">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer" onClick={() => setShowTagPeopleModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1B74E4" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {/* Post Button */}
          <button
            type="submit"
            disabled={!postContent.trim() && previewMedia.length === 0}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Save changes
          </button>
        </form>

        {/* Tag People Modal */}
        {showTagPeopleModal && (
          <TagPeopleModal
            onClose={() => setShowTagPeopleModal(false)}
            onTagPeople={handleTagPeople}
          />
        )}

        {toast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-[9999]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPostModal; 