"use client";

import { API_BASE } from '@/lib/apiBase';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PostCard from '@/components/profile/PostCard';
import Image from 'next/image';
import { PostData } from '@/lib/dummyData';
import Stories from '@/components/stories/Stories';
import CreatePostModal from '@/components/modals/CreatePostModal';
import Link from 'next/link';
import { useAuth } from '../auth/AuthContext';
import useRequireAuth from '@/lib/useRequireAuth';
import Avatar from '../user/Avatar';
import { useSearch } from '@/context/SearchContext';
import { fetchTaggedPeople } from '@/lib/utils/taggedPeople';

const PAGE_SIZE = 10;

const NewsFeed = () => {
  useRequireAuth();
  const { user, loading: authLoading } = useAuth();
  const { searchQuery } = useSearch();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (loading) return;
    setLoading(true);
    
    if (reset) {
      setPosts([]);
    }
    
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      let url = `${API_BASE}/backend/post/news?page=${pageNum}&limit=${PAGE_SIZE}`;
      console.log('URL:', url);
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Could not read error body');
        console.error('API Error Response:', `Status: ${res.status}`, `Body: ${errorText}`);
        throw new Error(`Failed to fetch posts. Status: ${res.status}`);
      }

      const data = await res.json();
      console.log('API Response:', data);
      let mappedPosts: any[] = [];
      
      const items = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      console.log('Items to process:', items);

      // Nếu page > 1 mà data trả về rỗng nhưng total > 0, tự động fetch lại page 1
      if (page > 1 && items.length === 0 && data.total > 0) {
        console.log('No data on this page, but total > 0. Refetching page 1...');
        setPage(1);
        fetchPosts(1, true);
        return;
      }

      // Process posts and fetch tagged people information
      mappedPosts = await Promise.all(items.map(async (item: any) => {
        let taggedPeople: any[] = [];
        if (item.friends && Array.isArray(item.friends) && item.friends.length > 0 && accessToken) {
          taggedPeople = await fetchTaggedPeople(item.friends, accessToken);
        }
        const reactionSummary: Record<string, number> = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
        let myReaction = null;
        if (item.reactions && Array.isArray(item.reactions)) {
          item.reactions.forEach((r: any) => {
            const type = String(r.type);
            if (reactionSummary[type] !== undefined) reactionSummary[type]++;
            if (user && r.userId === user.id) myReaction = r.type;
          });
        }
        if (!myReaction) {
          myReaction = sessionStorage.getItem(`myReaction_post_${item.id}`) || null;
        }
        // Avatar fallback: nếu không có hoặc không phải URL hợp lệ, dùng default
        let avatarUrl = item.user?.profilepic;
        if (!avatarUrl || typeof avatarUrl !== 'string' || !(avatarUrl.startsWith('http') || avatarUrl.startsWith('https'))) {
          avatarUrl = '/avatars/default-avatar.png';
        }
        return {
          id: item.id,
          author: {
            id: item.user?.id,
            name: item.user?.fullname || item.user?.email || 'User',
            avatar: avatarUrl, 
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
      console.log('Final mappedPosts:', mappedPosts);
      if (reset) {
        setPosts(mappedPosts);
      } else {
        setPosts(prev => [...prev, ...mappedPosts]);
      }
      setHasMore(mappedPosts.length === PAGE_SIZE);

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, user]);

  // Reset page về 1 khi search hoặc authLoading xong
  useEffect(() => {
    if (!authLoading) {
      setPage(1);
    }
  }, [searchQuery, authLoading]);

  // Khi page === 1 và đã load xong auth, fetch posts
  useEffect(() => {
    if (!authLoading && page === 1) {
      fetchPosts(1, true);
    }
  }, [page, authLoading, fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
  }, [hasMore, loading]);

  // Khi page > 1 và đã load xong auth, fetch posts tiếp theo
  useEffect(() => {
    if (!authLoading && page > 1) {
      fetchPosts(page, false);
    }
  }, [page, authLoading, fetchPosts]);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handlePostSubmit = useCallback((newPost: PostData) => {
    setPosts(prev => [newPost, ...prev]);
    handleCloseModal();
  }, [handleCloseModal]);
  
  const handleLiveVideoClick = useCallback(() => handleOpenModal(), [handleOpenModal]); 
  const handlePhotoVideoIconClick = useCallback(() => handleOpenModal(), [handleOpenModal]); 
  const handleFeelingActivityIconClick = useCallback(() => handleOpenModal(), [handleOpenModal]); 

  const handleDeletePost = useCallback((postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  const handleEditPost = useCallback((updatedPost: PostData) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === updatedPost.id ? { ...post, ...updatedPost } : post
      )
    );
  }, []);
  
  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;
    
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
      observer.disconnect();
    };
  }, [loading, hasMore, handleLoadMore]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSearching = searchQuery.trim() !== '';

  return (
    <div className="space-y-4 max-w-2xl mx-auto mt-4">
      
      {!isSearching && (
        <>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
            <div className="flex items-center mb-4 cursor-pointer gap-2 ">
              <Link href="/profile">
                <Avatar author={{avatar: "from-red-600 to-red-300", name: user?.fullname}} />
              </Link>
              <div className="flex-1 bg-gray-100 rounded-full py-2 px-4 text-gray-500 text-sm"  onClick={handleOpenModal}>
                What's on your mind, {user?.fullname || 'User'}?
              </div>
            </div>
            <div className="flex justify-around border-t border-gray-200 pt-2">
              <button className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md flex-1 justify-center gap-2 cursor-pointer" onClick={handleLiveVideoClick}>
                <svg width="29" height="22" viewBox="0 0 29 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.7727 0.90918C20.1223 0.90918 20.4576 1.04806 20.7048 1.29527C20.952 1.54247 21.0909 1.87776 21.0909 2.22736V7.76372L27.9626 2.95236C28.0614 2.8831 28.1773 2.84229 28.2977 2.83439C28.4181 2.82648 28.5384 2.85178 28.6454 2.90754C28.7524 2.96329 28.8421 3.04735 28.9046 3.15055C28.9671 3.25376 29.0001 3.37215 29 3.49282V19.4164C29.0001 19.5371 28.9671 19.6555 28.9046 19.7587C28.8421 19.8619 28.7524 19.946 28.6454 20.0017C28.5384 20.0575 28.4181 20.0828 28.2977 20.0749C28.1773 20.067 28.0614 20.0262 27.9626 19.9569L21.0909 15.1455V20.6819C21.0909 21.0315 20.952 21.3668 20.7048 21.614C20.4576 21.8612 20.1223 22.0001 19.7727 22.0001H1.31818C0.968578 22.0001 0.633293 21.8612 0.386086 21.614C0.138879 21.3668 0 21.0315 0 20.6819V2.22736C0 1.87776 0.138879 1.54247 0.386086 1.29527C0.633293 1.04806 0.968578 0.90918 1.31818 0.90918H19.7727ZM8.43636 7.27468C8.31481 7.27465 8.19698 7.31663 8.10282 7.39349C8.00866 7.47036 7.94395 7.5774 7.91964 7.6965L7.90909 7.80063V15.106C7.90908 15.1914 7.92981 15.2755 7.96949 15.3511C8.00917 15.4267 8.06662 15.4915 8.1369 15.54C8.20718 15.5885 8.28819 15.6192 8.37296 15.6295C8.45772 15.6398 8.54372 15.6293 8.62355 15.599L8.71977 15.5515L14.4605 11.8989C14.5275 11.8559 14.5839 11.7983 14.6255 11.7304C14.6672 11.6626 14.6929 11.5862 14.7009 11.507C14.7089 11.4278 14.6989 11.3478 14.6716 11.273C14.6444 11.1982 14.6006 11.1305 14.5435 11.075L14.4605 11.0091L8.71977 7.35509C8.63472 7.30237 8.53642 7.27362 8.43636 7.27468Z" fill="#F24E1E"/></svg>
                <span className="text-sm"> Video</span>
              </button>
              <button className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md flex-1 justify-center gap-2 cursor-pointer" onClick={handlePhotoVideoIconClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 0H6C5.46957 0 4.96086 0.210714 4.58579 0.585786C4.21071 0.960859 4 1.46957 4 2V4H2C1.46957 4 0.960859 4.21071 0.585786 4.58579C0.210714 4.96086 0 5.46957 0 6V22C0 22.5304 0.210714 23.0391 0.585786 23.4142C0.960859 23.7893 1.46957 24 2 24H18C18.5304 24 19.0391 23.7893 19.4142 23.4142C19.7893 23.0391 20 22.5304 20 22V20H22C22.5304 20 23.0391 19.7893 23.4142 19.4142C23.7893 19.0391 24 18.5304 24 18V2C24 1.46957 23.7893 0.960859 23.4142 0.585786C23.0391 0.210714 22.5304 0 22 0ZM6 2H22V10.6725L19.9125 8.585C19.5375 8.21021 19.029 7.99968 18.4988 7.99968C17.9685 7.99968 17.46 8.21021 17.085 8.585L7.67125 18H6V2ZM18 22H2V6H4V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H18V22ZM9 7C9 6.60444 9.1173 6.21776 9.33706 5.88886C9.55682 5.55996 9.86918 5.30362 10.2346 5.15224C10.6001 5.00087 11.0022 4.96126 11.3902 5.03843C11.7781 5.1156 12.1345 5.30608 12.4142 5.58579C12.6939 5.86549 12.8844 6.22186 12.9616 6.60982C13.0387 6.99778 12.9991 7.39991 12.8478 7.76537C12.6964 8.13082 12.44 8.44318 12.1111 8.66294C11.7822 8.8827 11.3956 9 11 9C10.4696 9 9.96086 8.78929 9.58579 8.41421C9.21071 8.03914 9 7.53043 9 7Z" fill="#00A400"/></svg>
                <span className="text-sm">Photo</span>
              </button>
              <button className="flex items-center text-gray-600 hover:bg-gray-100 p-2 rounded-md flex-1 justify-center gap-2 cursor-pointer" onClick={handleFeelingActivityIconClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.47 2 2 6.5 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM15.5 8C15.8978 8 16.2794 8.15804 16.5607 8.43934C16.842 8.72064 17 9.10218 17 9.5C17 9.89782 16.842 10.2794 16.5607 10.5607C16.2794 10.842 15.8978 11 15.5 11C15.1022 11 14.7206 10.842 14.4393 10.5607C14.158 10.2794 14 9.89782 14 9.5C14 9.10218 14.158 8.72064 14.4393 8.43934C14.7206 8.15804 15.1022 8 15.5 8ZM8.5 8C8.89782 8 9.27936 8.15804 9.56066 8.43934C9.84196 8.72064 10 9.10218 10 9.5C10 9.89782 9.84196 10.2794 9.56066 10.5607C9.27936 10.842 8.89782 11 8.5 11C8.10218 11 7.72064 10.842 7.43934 10.5607C7.15804 10.2794 7 9.89782 7 9.5C7 9.10218 7.15804 8.72064 7.43934 8.43934C7.72064 8.15804 8.10218 8 8.5 8ZM12 17.5C9.67 17.5 7.69 16.04 6.89 14H17.11C16.3 16.04 14.33 17.5 12 17.5Z" fill="#FFD233"/></svg>
                <span className="text-sm">Feeling/activity</span>
              </button>
            </div>
          </div>
          <Stories />
        </>
      )}

      {isSearching && (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-bold">Search Results for: "{searchQuery}"</h2>
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="text-center text-gray-400 py-8">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No posts found.</div>
      ) : (
        <div className="space-y-4 mt-4 ">
          {posts.map((post, index) => (
            <PostCard
              key={post.id ? String(post.id) : `fallback-${index}`}
              post={post}
              index={index}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              myReaction={post.myReaction}
            />
          ))}
        </div>
      )}
      {loading && <div className="text-center py-4">Loading more...</div>}
      {!loading && hasMore && <div ref={loaderRef} className="h-1"></div>}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-3 shadow-lg"
        >
          ↑
        </button>
      )}
      {isModalOpen && (
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handlePostSubmit}
        />
      )}
    </div>
  );
};

export default NewsFeed; 