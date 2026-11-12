'use client';

import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

interface Story {
  id: number;
  imageUrl: string;
  username: string;
  userAvatar: string;
  timestamp: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex?: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialStoryIndex = 0, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
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
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-2">
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

      {/* User info */}
      <div className="absolute top-6 left-6 flex items-center text-white">
        <img
          src={currentStory.userAvatar || '/avatars/default-avatar.png'}
          alt={currentStory.username}
          className="w-10 h-10 rounded-full border-2 border-white"
        />
        <span className="ml-3 font-semibold">{currentStory.username}</span>
        <span className="ml-3 text-sm text-gray-300">{currentStory.timestamp}</span>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
      >
        ×
      </button>

      {/* Story content */}
      <div
        {...handlers}
        className="relative w-full h-full flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <img
          src={currentStory.imageUrl}
          alt="Story"
          className="max-h-full max-w-full object-contain"
        />

        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center hover:bg-opacity-70 ${
            currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={currentIndex === 0}
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center hover:bg-opacity-70 ${
            currentIndex === stories.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={currentIndex === stories.length - 1}
        >
          ›
        </button>
      </div>
    </div>
  );
} 