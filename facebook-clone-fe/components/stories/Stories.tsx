import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import StoryViewerModal from '../modals/StoryViewerModal';

const Stories = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Placeholder for dummy data or fetched data
  const dummyStories = [
    { id: 1, user: { name: 'Your Story', avatar: 'https://images.pexels.com/photos/32771890/pexels-photo-32771890.jpeg' }, background: 'https://images.pexels.com/photos/4056509/pexels-photo-4056509.jpeg', isAddStory: true },
    { id: 2, user: { name: 'Tom Russo', avatar: 'https://images.pexels.com/photos/32768207/pexels-photo-32768207.jpeg' }, background: 'https://images.pexels.com/photos/4056509/pexels-photo-4056509.jpeg' },
    { id: 3, user: { name: 'Anna Becklund', avatar: 'https://images.pexels.com/photos/9072375/pexels-photo-9072375.jpeg' }, background: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg' },
    { id: 4, user: { name: 'Dennis Han', avatar: 'https://images.pexels.com/photos/24861173/pexels-photo-24861173.jpeg' }, background: 'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg' },
    { id: 5, user: { name: 'Cynthia Lopez', avatar: 'https://images.pexels.com/photos/1243046/pexels-photo-1243046.jpeg' }, background: 'https://images.pexels.com/photos/32304890/pexels-photo-32304890.jpeg' },
    { id: 6, user: { name: 'John Mathen', avatar: 'https://images.pexels.com/photos/1698482/pexels-photo-1698482.jpeg' }, background: 'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg' },
    { id: 7, user: { name: 'Madison', avatar: 'https://images.pexels.com/photos/1161547/pexels-photo-1161547.jpeg' }, background: 'https://images.pexels.com/photos/268941/pexels-photo-268941.jpeg' },
    { id: 8, user: { name: 'Luna', avatar: 'https://images.pexels.com/photos/12169089/pexels-photo-12169089.jpeg' }, background: 'https://images.pexels.com/photos/15328422/pexels-photo-15328422.jpeg' },
    { id: 9, user: { name: 'Mathew Smith', avatar: 'https://images.pexels.com/photos/32756432/pexels-photo-32756432.jpeg' }, background: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg' },
    // Add more dummy stories as needed
  ];

  const updateScrollStatus = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200; // Adjust this value as needed
      if (direction === 'left') {
        scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== 'undefined' && scrollContainerRef.current) {
      updateScrollStatus();
      const container = scrollContainerRef.current;
      container.addEventListener('scroll', updateScrollStatus);
      // Also update status on window resize
      window.addEventListener('resize', updateScrollStatus);

      return () => {
        if (container) {
          container.removeEventListener('scroll', updateScrollStatus);
          window.removeEventListener('resize', updateScrollStatus);
        }
      };
    }
  }, []); // Empty dependency array means this effect runs once after the initial render

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 relative group">
      {/* Navigation Arrow Left */}
      {canScrollLeft && (
        <div
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer z-20 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </div>
      )}

      <div className="flex space-x-2 overflow-x-auto p-2 scrollbar-hide" ref={scrollContainerRef}>
        {/* Add to Story Card */}
        {/* <div className="relative w-28 h-40 rounded-lg overflow-hidden shadow-md flex-shrink-0 cursor-pointer group">
           <Image
            src="https://images.pexels.com/photos/9072375/pexels-photo-9072375.jpeg"
            alt="Add to Story"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs font-semibold">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            Add to Story
          </div>
        </div> */}

        {/* Individual Story Cards */}
        {dummyStories.filter(story => !story.isAddStory).map((story, idx, arr) => (
          <div
            key={story.id}
            className="relative w-28 h-40 rounded-lg overflow-hidden shadow-md flex-shrink-0 cursor-pointer group"
            onClick={() => {
              setCurrentStoryIndex(idx);
              setViewerOpen(true);
            }}
          >
            <Image
              src={story.background}
              alt={`${story.user.name}'s story`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            {/* User Avatar on Story */}
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500 group-hover:scale-105 transition-transform z-10">
               <Image
                src={story.user.avatar || '/avatars/default-avatar.png'}
                alt={`${story.user.name}'s avatar`}
                width={32}
                height={32}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            {/* User Name on Story */}
            <div className="absolute bottom-2 left-2 text-white text-xs font-semibold z-10">
              {story.user.name}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrow Right */}
      {canScrollRight && (
        <div
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer z-20 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </div>
      )}

      {/* Story Viewer Modal */}
      {viewerOpen && (
        <StoryViewerModal
          stories={dummyStories.filter(story => !story.isAddStory)}
          currentIndex={currentStoryIndex}
          onClose={() => setViewerOpen(false)}
          onPrev={() => setCurrentStoryIndex(i => (i > 0 ? i - 1 : i))}
          onNext={() => setCurrentStoryIndex(i => (i < dummyStories.filter(story => !story.isAddStory).length - 1 ? i + 1 : i))}
        />
      )}
    </div>
  );
};

export default Stories;