import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface SharePostModalProps {
  onClose: () => void;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  imageUrl?: string;
  postId?: number | string;
}

const SharePostModal: React.FC<SharePostModalProps> = ({
  onClose,
  author,
  content,
  imageUrl,
  postId
}) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const postLink = typeof window !== 'undefined' && postId ? `${window.location.origin}/post/${postId}` : '';
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleCopyLink = async () => {
    if (postLink) {
      await navigator.clipboard.writeText(postLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Modal Header */}
        <div className="border-b border-b-[#dedede] px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Share post</h1>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Link Only */}
        <div className="p-4">
          {/* Original Post Preview */}
          <div className="border border-[#dedede] rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <div className="rounded-full overflow-hidden mr-2">
                <Image
                  src={author.avatar || '/avatars/default-avatar.png'}
                  alt={author.name}
                  width={32}
                  height={32}
                  className="object-cover w-8 h-8"
                />
              </div>
              <div>
                <p className="font-semibold text-sm">{author.name}</p>
              </div>
            </div>
            <p className="text-sm mb-2">{content}</p>
            {imageUrl && (
              <div className="relative w-full h-48">
                <Image
                  src={imageUrl}
                  alt="Post image"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Share Link Section */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={postLink}
              readOnly
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100"
              onFocus={e => e.target.select()}
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Copy link
            </button>
          </div>
          {copied && <div className="text-green-600 text-sm mb-2">Link copied!</div>}
        </div>
      </div>
    </div>
  );
};

export default SharePostModal; 