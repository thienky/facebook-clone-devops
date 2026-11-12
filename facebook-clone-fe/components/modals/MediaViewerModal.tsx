import React, { useState } from 'react';
import Image from 'next/image';
import { CommentData } from '@/lib/dummyData';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface MediaViewerModalProps {
  media: MediaItem[];
  initialIndex: number;
  comments: CommentData[];
  onClose: () => void;
  onComment: (text: string) => void;
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ media, initialIndex, comments, onClose, onComment }) => {
  const [current, setCurrent] = useState(initialIndex);
  const [commentText, setCommentText] = useState('');

  const handlePrev = () => setCurrent((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setCurrent((prev) => (prev < media.length - 1 ? prev + 1 : prev));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-[80%] h-[80vh] bg-white rounded-lg flex overflow-hidden">
        {/* Media section */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/60 rounded-full hover:bg-black/80 cursor-pointer">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Prev/Next */}
          {current > 0 && (
            <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10 cursor-pointer">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {current < media.length - 1 && (
            <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10 cursor-pointer">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {/* Media display */}
          <div className="w-full h-full flex items-center justify-center">
            {media[current].type === 'image' ? (
              <Image src={media[current].url} alt="media" width={800} height={600} className="max-h-[75vh] max-w-full object-contain rounded-lg" />
            ) : (
              <video src={media[current].url} controls className="max-h-[75vh] max-w-full rounded-lg bg-black" />
            )}
          </div>
        </div>
        {/* Comment section */}
        {/* <div className="w-[350px] flex flex-col bg-white h-full border-l border-gray-200">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="font-semibold mb-2">Comments</div>
            {comments.length === 0 && <div className="text-gray-400 text-sm">No comments yet.</div>}
            {comments.map((c, i) => (
              <div key={i} className="mb-3 flex items-start gap-2">
                <Image src={c.author?.avatar || '/avatars/default-avatar.png'} alt={c.author?.name || 'User'} width={32} height={32} className="rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sm">{c.author?.name || 'User'}</div>
                  <div className="text-gray-700 text-sm">{c.content}</div>
                  <div className="text-xs text-gray-400 mt-1">{c.timeAgo}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full border px-3 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600">Send</button>
          </form>
        </div> */}
      </div>
    </div>
  );
};

export default MediaViewerModal; 