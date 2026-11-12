import { PostProps } from '@/components/posts/Post';

export interface CommentData {
  author: {
    id?: number | string;
    name: string;
    avatar: string;
    email?: string;
  };
  content: string;
  timeAgo: string;
  likes: number;
  replies?: CommentData[];
}

export interface PostData {
  id: number;
  author: {
    name: string;
    avatar: string;
    email?: string;
  };
  timeAgo: string;
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  comments: CommentData[];
  shares: number;
  taggedPeople?: {
    id: string;
    name: string;
    avatar: string;
  }[];
  isSaved?: boolean;
  myReaction?: string | null;
}

export interface WatchVideoData {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  comments: CommentData[];
  shares: number;
}

export const initialPosts: PostData[] = [
  {
    id: 1,
    author: { name: 'Facebook User', avatar: 'https://randomuser.me/api/portraits/men/99.jpg', email: 'facebookuser@example.com' },
    timeAgo: '1 min ago',
    content: 'This is a saved post! 🎉',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/127513/pexels-photo-127513.jpeg' }
    ],
    reactions: { like: 100, love: 50, haha: 10, wow: 5, sad: 0, angry: 0 },
    comments: [
      { author: { name: 'Saved Friend', avatar: 'https://randomuser.me/api/portraits/women/88.jpg', email: '' }, content: 'I saved this too!', timeAgo: 'Just now', likes: 2 }
    ],
    shares: 10,
    taggedPeople: [
      { id: 'tag1', name: 'Tag One', avatar: 'https://randomuser.me/api/portraits/men/11.jpg' }
    ],
    isSaved: true,
  },
  {
    id: 2,
    author: { name: 'Anna Becklund', avatar: 'https://images.pexels.com/photos/1031081/pexels-photo-1031081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', email: 'anna@example.com' },
    timeAgo: '2 hours ago',
    content: 'Another saved post for testing.',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/2473143/pexels-photo-2473143.jpeg' }
    ],
    reactions: { like: 20, love: 5, haha: 2, wow: 1, sad: 0, angry: 0 },
    comments: [],
    shares: 2,
    isSaved: true,
  },
  {
    id: 3,
    author: { name: ' Russo', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', email: 'russo@example.com' },
    timeAgo: '5 mins',
    content: 'Not having fun at all 😂',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/127513/pexels-photo-127513.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ],
    reactions: { like: 15, love: 5, haha: 2, wow: 1, sad: 0, angry: 0 },
    comments: [
       { author: { name: 'Jenny', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', email: '' }, content: 'Great post!', timeAgo: '1 min ago', likes: 5 },
       { author: { name: 'Tom Russo', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', email: '' }, content: 'Thanks!', timeAgo: '30 seconds ago', likes: 3 },
    ],
    shares: 100,
    taggedPeople: [
      { id: 'thànhminh', name: 'Thành Minh', avatar: 'https://randomuser.me/api/portraits/men/11.jpg' },
      { id: 'quýphú', name: 'Quý Phú', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
      { id: 'lananh', name: 'Lan Anh', avatar: 'https://randomuser.me/api/portraits/women/13.jpg' },
    ],
    isSaved: false,
  },
  {
    id: 4,
    author: { name: 'Anna Becklund', avatar: 'https://images.pexels.com/photos/1031081/pexels-photo-1031081.jpeg', email: 'anna@example.com' },
    timeAgo: '1 hour ago',
    content: 'Loving this view!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/4613309/pexels-photo-4613309.jpeg' },
    ],
    reactions: { like: 50, love: 30, haha: 10, wow: 5, sad: 2, angry: 1 },
    comments: [
      { author: { name: 'Dennis Han', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', email: '' }, content: 'Where is this?', timeAgo: '50 mins ago', likes: 3 },
    ],
    shares: 20,
    taggedPeople: [
      { id: 'nguyennguyên', name: 'Nguyễn Nguyên', avatar: 'https://randomuser.me/api/portraits/men/14.jpg' },
    ],
    isSaved: false,
  },
   {
    id: 5,
    author: { name: 'Dennis Han', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', email: 'dennis@example.com' },
    timeAgo: '3 hours ago',
    content: 'Just a thought...',
    reactions: { like: 10, love: 1, haha: 0, wow: 0, sad: 0, angry: 0 },
    comments: [],
    shares: 5,
    isSaved: false,
  },
  {
    id: 6,
    author: { name: 'Lam Dan', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', email: 'lamdan@example.com' },
    timeAgo: '4 hours ago',
    content: 'Check out this awesome sunset!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg' },
    ],
    reactions: { like: 22, love: 8, haha: 1, wow: 3, sad: 0, angry: 0 },
    comments: [],
    shares: 7,
    isSaved: false,
  },
  {
    id: 7,
    author: { name: 'Jenny Smith', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', email: 'jenny@example.com' },
    timeAgo: '5 hours ago',
    content: 'Coffee time ☕',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/302902/pexels-photo-302902.jpeg' },
    ],
    reactions: { like: 12, love: 2, haha: 0, wow: 0, sad: 0, angry: 0 },
    comments: [],
    shares: 1,
    isSaved: false,
  },
  {
    id: 8,
    author: { name: 'Tom Russo', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', email: 'tomrusso@example.com' },
    timeAgo: '6 hours ago',
    content: 'Just finished a 10k run!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg' },
    ],
    reactions: { like: 30, love: 5, haha: 2, wow: 1, sad: 0, angry: 0 },
    comments: [],
    shares: 3,
    isSaved: false,
  },
  {
    id: 9,
    author: { name: 'Anna Becklund', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', email: 'anna@example.com' },
    timeAgo: '7 hours ago',
    content: 'Reading a new book today.',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg' },
    ],
    reactions: { like: 18, love: 4, haha: 0, wow: 0, sad: 0, angry: 0 },
    comments: [],
    shares: 2,
    isSaved: false,
  },
  {
    id: 10,
    author: { name: 'Dennis Han', avatar: 'https://randomuser.me/api/portraits/men/12.jpg', email: 'dennis@example.com' },
    timeAgo: '8 hours ago',
    content: 'Nature walk in the park.',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/34950/pexels-photo.jpg' },
    ],
    reactions: { like: 25, love: 6, haha: 1, wow: 2, sad: 0, angry: 0 },
    comments: [],
    shares: 4,
    isSaved: false,
  },
  {
    id: 11,
    author: { name: 'Cynthia Lopez', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
    timeAgo: '9 hours ago',
    content: 'Trying a new recipe!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg' },
    ],
    reactions: { like: 14, love: 3, haha: 0, wow: 1, sad: 0, angry: 0 },
    comments: [],
    shares: 1,
    isSaved: false,
  },
  {
    id: 12,
    author: { name: 'Eric Jones', avatar: 'https://randomuser.me/api/portraits/men/23.jpg' },
    timeAgo: '10 hours ago',
    content: 'At the gym!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' },
    ],
    reactions: { like: 19, love: 2, haha: 1, wow: 0, sad: 0, angry: 0 },
    comments: [],
    shares: 2,
    isSaved: false,
  },
  {
    id: 13,
    author: { name: 'Aiden Brown', avatar: 'https://randomuser.me/api/portraits/men/54.jpg' },
    timeAgo: '11 hours ago',
    content: 'Movie night!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/799137/pexels-photo-799137.jpeg' },
    ],
    reactions: { like: 11, love: 1, haha: 0, wow: 0, sad: 0, angry: 0 },
    comments: [],
    shares: 0,
    isSaved: false,
  },
  {
    id: 14,
    author: { name: 'Sophie Turner', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
    timeAgo: '12 hours ago',
    content: 'Baking cookies 🍪',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg' },
    ],
    reactions: { like: 16, love: 5, haha: 1, wow: 0, sad: 0, angry: 0 },
    comments: [],
    shares: 1,
    isSaved: false,
  },
  {
    id: 15,
    author: { name: 'Lucas White', avatar: 'https://randomuser.me/api/portraits/men/77.jpg' },
    timeAgo: '13 hours ago',
    content: 'Learning React is fun!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg' },
    ],
    reactions: { like: 21, love: 7, haha: 2, wow: 1, sad: 0, angry: 0 },
    comments: [],
    shares: 2,
    isSaved: false,
  },
  {
    id: 16,
    author: { name: 'Multi Photo User', avatar: 'https://randomuser.me/api/portraits/men/31.jpg' },
    timeAgo: 'Just now',
    content: 'Check out my trip photos!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/32549629/pexels-photo-32549629/free-photo-of-cho-va-co-gai.jpeg' },
    ],
    reactions: { like: 10, love: 2, haha: 0, wow: 1, sad: 0, angry: 0 },
    comments: [],
    shares: 1,
    isSaved: false,
  },
  {
    id: 17,
    author: { name: 'Gallery Girl', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
    timeAgo: '10 mins ago',
    content: '3 photos from the party!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/302902/pexels-photo-302902.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg' },
    ],
    reactions: { like: 8, love: 1, haha: 1, wow: 0, sad: 0, angry: 0 },
    comments: [],
    shares: 0,
    isSaved: false,
  },
  {
    id: 18,
    author: { name: 'Quad Squad', avatar: 'https://randomuser.me/api/portraits/men/33.jpg' },
    timeAgo: '30 mins ago',
    content: '4 friends, 4 photos!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/799137/pexels-photo-799137.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
    ],
    reactions: { like: 12, love: 3, haha: 0, wow: 2, sad: 0, angry: 0 },
    comments: [],
    shares: 2,
    isSaved: false,
  },
  {
    id: 19,
    author: { name: 'Photo Bomb', avatar: 'https://randomuser.me/api/portraits/women/34.jpg' },
    timeAgo: '1 hour ago',
    content: 'So many memories!',
    media: [
      { type: 'image', url: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg' },
      { type: 'image', url: 'https://images.pexels.com/photos/4613309/pexels-photo-4613309.jpeg' },
    ],
    reactions: { like: 20, love: 5, haha: 1, wow: 1, sad: 0, angry: 0 },
    comments: [],
    shares: 3,
    isSaved: false,
  },
];

export const moreDummyPosts: PostData[] = [
    {
      id: 101,
      author: { name: 'Cynthia Lopez', avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      timeAgo: '1 day ago',
      content: 'Throwback time!',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      ],
      reactions: { like: 120, love: 50, haha: 15, wow: 10, sad: 5, angry: 3 },
      comments: [
         { author: { name: 'Aiden Brown', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }, content: 'Looks great!', timeAgo: '23 hours ago', likes: 5 },
      ],
      shares: 30,
      isSaved: false,
    },
    {
      id: 102,
      author: { name: 'Eric Jones', avatar: 'https://images.pexels.com/photos/842871/pexels-photo-842871.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
      timeAgo: '2 days ago',
      content: 'Coding session...',
      reactions: { like: 8, love: 2, haha: 1, wow: 0, sad: 0, angry: 0 },
      comments: [],
      shares: 2,
      isSaved: false,
    },
    {
      id: 103,
      author: { name: 'Mia Green', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
      timeAgo: '3 days ago',
      content: 'Picnic with friends!',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' },
      ],
      reactions: { like: 40, love: 12, haha: 3, wow: 2, sad: 0, angry: 0 },
      comments: [],
      shares: 5,
      isSaved: false,
    },
    {
      id: 104,
      author: { name: 'Noah Black', avatar: 'https://randomuser.me/api/portraits/men/88.jpg' },
      timeAgo: '4 days ago',
      content: 'Just chilling...',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg' },
      ],
      reactions: { like: 13, love: 2, haha: 0, wow: 0, sad: 0, angry: 0 },
      comments: [],
      shares: 1,
      isSaved: false,
    },
    {
      id: 105,
      author: { name: 'Emma Stone', avatar: 'https://randomuser.me/api/portraits/women/66.jpg' },
      timeAgo: '5 days ago',
      content: 'Yoga in the morning!',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg' },
      ],
      reactions: { like: 17, love: 4, haha: 1, wow: 0, sad: 0, angry: 0 },
      comments: [],
      shares: 2,
      isSaved: false,
    },
    {
      id: 106,
      author: { name: 'Oliver King', avatar: 'https://randomuser.me/api/portraits/men/99.jpg' },
      timeAgo: '6 days ago',
      content: 'Working on a new project.',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/256401/pexels-photo-256401.jpeg' },
      ],
      reactions: { like: 23, love: 6, haha: 2, wow: 1, sad: 0, angry: 0 },
      comments: [],
      shares: 3,
      isSaved: false,
    },
    {
      id: 107,
      author: { name: 'Sophia Lee', avatar: 'https://randomuser.me/api/portraits/women/77.jpg' },
      timeAgo: '7 days ago',
      content: 'First day at new job!',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg' },
      ],
      reactions: { like: 29, love: 9, haha: 1, wow: 2, sad: 0, angry: 0 },
      comments: [],
      shares: 4,
      isSaved: false,
    },
    {
      id: 108,
      author: { name: 'James Bond', avatar: 'https://randomuser.me/api/portraits/men/7.jpg' },
      timeAgo: '8 days ago',
      content: 'Mission accomplished.',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/167964/pexels-photo-167964.jpeg' },
      ],
      reactions: { like: 35, love: 10, haha: 2, wow: 1, sad: 0, angry: 0 },
      comments: [],
      shares: 6,
      isSaved: false,
    },
    {
      id: 109,
      author: { name: 'Lily Brown', avatar: 'https://randomuser.me/api/portraits/women/88.jpg' },
      timeAgo: '9 days ago',
      content: 'Weekend getaway!',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg' },
      ],
      reactions: { like: 27, love: 8, haha: 1, wow: 0, sad: 0, angry: 0 },
      comments: [],
      shares: 2,
      isSaved: false,
    },
    {
      id: 110,
      author: { name: 'William Scott', avatar: 'https://randomuser.me/api/portraits/men/66.jpg' },
      timeAgo: '10 days ago',
      content: 'Hiking adventure!',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg' },
      ],
      reactions: { like: 31, love: 7, haha: 2, wow: 1, sad: 0, angry: 0 },
      comments: [],
      shares: 3,
      isSaved: false,
    },
    {
      id: 111,
      author: { name: 'Ella Walker', avatar: 'https://randomuser.me/api/portraits/women/99.jpg' },
      timeAgo: '11 days ago',
      content: 'Art class fun!',
      media: [
        { type: 'image', url: 'https://images.pexels.com/photos/207666/pexels-photo-207666.jpeg' },
      ],
      reactions: { like: 15, love: 3, haha: 0, wow: 0, sad: 0, angry: 0 },
      comments: [],
      shares: 1,
      isSaved: false,
    },
];

export const watchVideos: WatchVideoData[] = [
  {
    id: '1',
    author: {
      name: 'Tom Russo',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    timeAgo: '10 mins ago',
    title: 'Amazing Guitar Solo!',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.pexels.com/photos/164936/pexels-photo-164936.jpeg',
    reactions: {
      like: 120,
      love: 45,
      haha: 12,
      wow: 8,
      sad: 2,
      angry: 1,
    },
    comments: [],
    shares: 3,
  },
  {
    id: '2',
    author: {
      name: 'Anna Becklund',
      avatar: 'https://i.pravatar.cc/150?img=6',
    },
    timeAgo: '30 mins ago',
    title: 'Funny Cat Compilation',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail: 'https://images.pexels.com/photos/45201/pexels-photo-45201.jpeg',
    reactions: {
      like: 200,
      love: 60,
      haha: 50,
      wow: 10,
      sad: 1,
      angry: 0,
    },
    comments: [],
    shares: 5,
  },
]; 