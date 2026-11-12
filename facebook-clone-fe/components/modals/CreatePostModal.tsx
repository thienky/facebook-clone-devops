import { API_BASE } from '@/lib/apiBase';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';
import TagPeopleModal from './TagPeopleModal';
import { PostData } from '@/lib/dummyData';
import { useAuth } from '../auth/AuthContext';
import Avatar from '../user/Avatar';
import { fetchTaggedPeople } from '@/lib/utils/taggedPeople';

interface Person {
  id: string;
  name: string;
  avatar: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPost: PostData) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const [postContent, setPostContent] = useState('');
  const [selectedAudience, setSelectedAudience] = useState(0); // 0: Public, 1: Only me, 2: Friends
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTagPeopleModal, setShowTagPeopleModal] = useState(false);
  const [taggedPeopleState, setTaggedPeople] = useState<Person[]>([]);
  const [previewMedia, setPreviewMedia] = useState<{type: 'image'|'video', url: string, file: File}[]>([]);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const getAudienceLabel = (audience: number) => {
    switch (audience) {
      case 0:
        return <><span role="img" aria-label="public">🌍</span> Public</>;
      case 1:
        return <><span role="img" aria-label="only me">🔒</span> Only me</>;
      case 2:
        return <><span role="img" aria-label="friends">👥</span> Friends</>;
      default:
        return <><span role="img" aria-label="public">🌍</span> Public</>;
    }
  };

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

      // 2. CREATE POST
      const isType = selectedAudience;

      // Nếu không có text, nhưng có media, gửi content là 'media'
      const payload = {
        content: postContent.trim() || 'media',
        userId: user?.id,
        isType,
        mediaUrl,
        friends: taggedPeopleState.map(p => Number(p.id)),
      };

      const res = await fetch(`${API_BASE}/backend/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.message || 'Đăng bài thất bại');
      
      let taggedPeople: Person[] = [];
      if (result.friends && Array.isArray(result.friends) && result.friends.length > 0 && accessToken) {
        taggedPeople = await fetchTaggedPeople(result.friends, accessToken);
      } else if (result.taggedPeople && Array.isArray(result.taggedPeople)) {
        taggedPeople = result.taggedPeople;
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
        taggedPeople: taggedPeople,
      };

      onSubmit(mappedPost);
      setToast('Đăng bài thành công!');
      setPostContent('');
      setPreviewMedia([]);
      setTaggedPeople([]);
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

  const toggleAudienceDropdown = () => {
    setIsAudienceDropdownOpen(!isAudienceDropdownOpen);
    setShowEmojiPicker(false);
  };

  const selectAudience = (audience: number) => {
    setSelectedAudience(audience);
    setIsAudienceDropdownOpen(false);
  };

  const handleEmojiClick = (emojiData: any) => {
    setPostContent(prevContent => prevContent + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEmojiPicker(!showEmojiPicker);
    setIsAudienceDropdownOpen(false);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMedia = files.map(file => ({
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      file
    }));
    setPreviewMedia(prev => [...prev, ...newMedia] as { type: 'image' | 'video'; url: string; file: File }[]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewMedia[index].url);
    setPreviewMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagPeople = (people: Person[]) => {
    setTaggedPeople(people);
    setShowTagPeopleModal(false);
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previewMedia.forEach(m => URL.revokeObjectURL(m.url));
    };
  }, []);

  const PlayIcon = () => (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="bg-black/50 rounded-full p-2">
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );

  const renderPreviewGrid = () => {
    if (!previewMedia || previewMedia.length === 0) return null;
    const renderItem = (m: {type: 'image'|'video', url: string}, i: number, aspect = '1/1', overlay: React.ReactNode = null) => (
      <div
        key={i}
        className="relative w-full cursor-pointer overflow-hidden bg-black"
        style={{ aspectRatio: aspect }}
      >
        {m.type === 'image' ? (
          <Image src={m.url} alt={`Preview ${i}`} fill className="object-cover object-center" />
        ) : (
          <>
            <video src={m.url} className="w-full h-full object-cover object-center" />
            {PlayIcon()}
          </>
        )}
        {overlay}
        <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 hover:bg-opacity-75 rounded-full text-white z-20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
    switch (previewMedia.length) {
      case 1:
        return (
          <div className="w-full max-w-[500px] mx-auto h-[300px] rounded-lg overflow-auto cursor-pointer mb-4">
            {renderItem(previewMedia[0], 0, '1/1')}
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-1 w-full max-w-[500px] h-[300px] mx-auto rounded-lg overflow-auto mb-4">
            {previewMedia.slice(0, 2).map((m, i) => renderItem(m, i, '4/5'))}
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-2 gap-1 w-full max-w-[400px] h-[300px] mx-auto rounded-lg overflow-auto mb-4">
            <div className="col-span-1 row-span-2">{renderItem(previewMedia[0], 0, '4/5')}</div>
            <div className="flex flex-col gap-1">
              {previewMedia.slice(1).map((m, i) => renderItem(m, i + 1, '4/5'))}
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-2 gap-1 w-full max-w-[500px] max-h-[300px] mx-auto rounded-lg overflow-auto mb-4">
            {previewMedia.slice(0, 4).map((m, i) =>
              renderItem(
                m,
                i,
                '1/1',
                i === 3 && previewMedia.length > 4 ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-semibold z-20">
                    +{previewMedia.length - 4}
                  </div>
                ) : null
              )
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="relative border-b px-4 py-3 border-b-[#dedede]">
          <h1 className="text-xl font-semibold text-center">Create post</h1>
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
            {/* User Info and Privacy Selector */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                <Avatar author={{avatar: "from-red-600 to-red-300", name: user?.fullname}} />
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.fullname}</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleAudienceDropdown}
                    className="flex items-center space-x-1 text-xs bg-gray-200 px-2 py-1 rounded-md hover:bg-gray-300"
                  >
                    {getAudienceLabel(selectedAudience)}
                  </button>

                  {isAudienceDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => selectAudience(0)}
                        >
                          <span role="img" aria-label="public">🌍</span> Public
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => selectAudience(2)}
                        >
                          <span role="img" aria-label="friends">👥</span> Friends
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => selectAudience(1)}
                        >
                          <span role="img" aria-label="only me">🔒</span> Only me
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Content Input */}
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[80px] text-lg resize-none border-0 focus:outline-none focus:ring-0 p-0"
            />

            {/* Tagged People Display */}
            {taggedPeopleState.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {taggedPeopleState.map(person => (
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
            {renderPreviewGrid()}

            {/* Add to Post Options */}
            <div className="flex items-center justify-between border border-[#dedede] rounded-lg px-3 py-1.5">
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
                <button type="button" className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer" onClick={toggleEmojiPicker}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EAB026" className="w-6 h-6">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" />
                  </svg>
                </button>
              
              </div>
            </div>

            {/* Emoji Picker Dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-[180px] right-4 z-50" onClick={(e) => e.stopPropagation()}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

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
          <div className="p-4">
            <button
              type="submit"
              disabled={!postContent.trim() && previewMedia.length === 0}
              className="w-full bg-blue-500 text-white cursor-pointer font-semibold py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </form>

        {/* Tag People Modal */}
        {showTagPeopleModal && (
          <TagPeopleModal
            onClose={() => setShowTagPeopleModal(false)}
            onTagPeople={handleTagPeople}
          />
        )}

        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-[9999] animate-fadeIn">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostModal;