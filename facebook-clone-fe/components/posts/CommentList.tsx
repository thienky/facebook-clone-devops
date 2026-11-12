import React from 'react';
import Comment from './Comment'; // Import the Comment component

interface CommentListProps {
  comments: {
    author: {
      id?: number | string;
      name: string;
      avatar: string;
    };
    content: string;
    timeAgo: string;
  }[];
}

const CommentList: React.FC<CommentListProps> = ({
  comments
}) => {
  return (
    <div className="mt-4">
      {comments.map((comment, index) => (
        <Comment
          key={index}
          author={comment.author || { name: 'User', avatar: '/avatars/default-avatar.png' }}
          content={comment.content}
          timeAgo={comment.timeAgo}
        />
      ))}
    </div>
  );
};

export default CommentList; 