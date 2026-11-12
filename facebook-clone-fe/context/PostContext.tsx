'use client';
import React, { createContext, useState, useContext } from 'react';
import { PostData, initialPosts } from '@/lib/dummyData';

interface PostContextType {
  posts: PostData[];
  addNewPost: (post: PostData) => void;
  removePost: (index: number) => void;
  toggleSavePost: (index: number) => void;
  updatePost: (index: number, updatedPost: PostData) => void;
  updatePostById: (updatedPost: PostData) => void;
}

const PostContext = createContext<PostContextType>({
  posts: [],
  addNewPost: () => {},
  removePost: () => {},
  toggleSavePost: () => {},
  updatePost: () => {},
  updatePostById: () => {},
});

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostData[]>(initialPosts);

  const addNewPost = (post: PostData) => {
    setPosts(prevPosts => [post, ...prevPosts]);
  };

  const removePost = (index: number) => {
    setPosts(prevPosts => prevPosts.filter((_, i) => i !== index));
  };

  const toggleSavePost = (index: number) => {
    setPosts(prevPosts => 
      prevPosts.map((post, i) => 
        i === index 
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
  };

  const updatePost = (index: number, updatedPost: PostData) => {
    setPosts(prevPosts => prevPosts.map((post, i) => (i === index ? updatedPost : post)));
  };

  const updatePostById = (updatedPost: PostData) => {
    setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  return (
    <PostContext.Provider value={{ posts, addNewPost, removePost, toggleSavePost, updatePost, updatePostById }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext); 