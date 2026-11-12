import React from 'react';
import Image from 'next/image';
import Avatar from '../user/Avatar';
import { useAuth } from '../auth/AuthContext';
interface CommentProps {
  author: {
    name: string;
    avatar: string; // URL or path to avatar image
  };
  content: string;
  timeAgo: string;
}

const Comment: React.FC<CommentProps> = ({
  author,
  content,
  timeAgo,
}) => {

const { user } = useAuth();

  return (
    <div className="flex items-start space-x-2 mb-2">
      {/* Author Avatar */}
      <Avatar author={author} />
      <div className="flex-1">
        <div className="bg-gray-100 p-2 rounded-xl">
          <p className="text-gray-800 font-semibold text-sm">{author.name}</p>
          <p className="text-gray-700 text-sm mt-0.5">{content}</p>
        </div>
         {/* Optional: Time ago and Like/Reply options for comment */}
        <div className="text-xs text-gray-500 mt-1 ml-3 flex items-center space-x-3">
            <span>{timeAgo}</span>
            <span className="cursor-pointer hover:underline">Like</span>
            <span className="cursor-pointer hover:underline">Reply</span>
        </div>
      </div>
    </div>
  );
};

export default Comment; 