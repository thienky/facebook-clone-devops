import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';

interface Story {
  id: number;
  user: { name: string; avatar: string };
  background: string;
  isAddStory?: boolean;
}

interface StoryViewerModalProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const reactions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😆', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
];

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ stories, currentIndex, onClose, onPrev, onNext }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Progress bar animation
  useEffect(() => {
    if (isPaused) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return prev;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  // Khi progress đạt 100, gọi onNext ngoài render phase
  useEffect(() => {
    if (progress >= 100) {
      setProgress(0);
      onNext();
    }
  }, [progress, onNext]);

  const handlers = useSwipeable({
    onSwipedLeft: () => onNext(),
    onSwipedRight: () => onPrev(),
    trackMouse: true,
  });

  const story = stories[currentIndex];
  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 bg-black rounded-xl shadow-xl flex flex-col items-center justify-center"
        {...handlers}
        onClick={e => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-2 z-20">
          {stories.map((_, index) => (
            <div
              key={index}
              className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-100 ${
                  index === currentIndex ? 'animate-progress' : ''
                }`}
                style={{
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-8 p-1 hover:bg-gray-800 rounded-full z-20 cursor-pointer"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header: avatar, name, time */}
        <div className="flex items-center gap-3 absolute left-4 top-8 z-10">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
            <Image src={story.user.avatar || '/avatars/default-avatar.png'} alt={story.user.name} width={40} height={40} className="object-cover" />
          </div>
          <div className="text-white">
            <div className="font-semibold text-base">{story.user.name}</div>
            <div className="text-xs opacity-80">8h ago</div>
          </div>
        </div>

        {/* Story image */}
        <div className="w-full h-[420px] flex items-center justify-center relative">
          <Image
            src={story.background}
            alt={story.user.name + "'s story"}
            fill
            style={{ objectFit: 'cover', borderRadius: '1rem' }}
            className="rounded-xl"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={onPrev}
          className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 z-10 transition-opacity cursor-pointer ${
            currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={currentIndex === 0}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onNext}
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 z-10 transition-opacity cursor-pointer ${
            currentIndex === stories.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={currentIndex === stories.length - 1}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </div>
  );
};

export default StoryViewerModal; 