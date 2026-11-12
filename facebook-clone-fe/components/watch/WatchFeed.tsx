import { API_BASE } from '@/lib/apiBase';
import React, { useEffect, useRef, useState } from 'react';
// import { watchVideos } from '@/lib/dummyData';

interface ApiVideo {
  id: number;
  isType: number;
  name: string;
  url: string;
  createdAt: string;
  post: {
    id: number;
    isType: number;
    content: string;
    mediaUrl: string[];
    friends: any[];
    createdAt: string;
    updatedAt: string;
  };
  user?: {
    id: number;
    fullname?: string;
    email?: string;
    profilepic?: string;
  };
}

interface VideoCardProps {
  video: {
    id: number;
    postId: number;
    videoUrl: string;
    title: string;
    timeAgo: string;
    author: {
      name: string;
      avatar: string;
      email: string;
    };
    reactions: {
      like: number;
      love: number;
      haha: number;
      wow: number;
      sad: number;
      angry: number;
    };
    shares: number;
    thumbnail?: string;
  };
}

const WatchFeed = () => {
  const [videos, setVideos] = useState<VideoCardProps["video"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id;
        if (!userId) {
          setError('Bạn cần đăng nhập để xem video!');
          setLoading(false);
          return;
        }
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/backend/photo/user?type=1&page=1&limit=30`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          throw new Error('Không thể lấy dữ liệu video!');
        }
        const data: ApiVideo[] = await res.json();
        // Map API data sang format VideoCard
        const mapped = data.map(item => ({
          id: item.id,
          postId: item.post?.id,
          videoUrl: item.url,
          title: item.user?.fullname || 'User',
          timeAgo: new Date(item.createdAt).toLocaleString(),
          author: {
            name: item.user?.fullname || item.user?.email || 'User',
            avatar: item.user?.profilepic || '/avatars/default-avatar.png',
            email: '', // Không hiển thị email nữa
          },
          reactions: {
            like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, // backend chưa trả về reactions
          },
          shares: 0, // backend chưa trả về shares
          thumbnail: '', // nếu backend có trường thumbnail thì map vào đây
        }));
        setVideos(mapped);
      } catch (err: any) {
        setError(err.message || 'Đã có lỗi xảy ra!');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      {loading && <div className="text-center text-gray-500 py-8">Đang tải video...</div>}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center text-gray-500 py-8">Chưa có video nào!</div>
      )}
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

const VideoCard = ({ video }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [reactionSummary, setReactionSummary] = useState<any>({});

  useEffect(() => {
    // Gọi API tổng hợp reaction dựa vào postId
    const fetchReactions = async () => {
      if (!video || !video.postId) return;
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/backend/reaction/${video.postId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log(data);
          setReactionSummary(data);
        }
      } catch {}
    };
    fetchReactions();
  }, [video]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const value = parseFloat(e.target.value);
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  const handleHoverPlay = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Hàm trả về icon reaction
  function getReactionIcon(type: string) {
    switch (type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'haha': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😡';
      default: return '';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow duration-300 mb-8">
      <div className="relative w-full h-[350px] bg-black">
        <video
          ref={videoRef}
          poster={video.thumbnail}
          src={video.videoUrl}
          className="w-full h-full object-cover"
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
        />
        {/* Nút Play/Pause overlay */}
        <button
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={handlePlayPause}
        >
          <div className="bg-black bg-opacity-50 rounded-full p-3">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {isPlaying ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </div>
        </button>
        {/* Thanh điều khiển */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 px-4 py-2 flex items-center gap-3 text-white text-sm">
          {/* Thời gian */}
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          {/* Thanh seek */}
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 accent-white"
          />
          <span className="w-10">{formatTime(duration)}</span>
          {/* Nút âm lượng */}
          <button onClick={handleMuteToggle} title="Tắt/Bật tiếng">
            {isMuted ? (
              <span className="text-lg">🔇</span>
            ) : (
              <span className="text-lg">🔊</span>
            )}
          </button>
          {/* Nút fullscreen */}
          <button onClick={handleFullScreen} title="Toàn màn hình">
            <span className="text-lg">⛶</span>
          </button>
        </div>
      </div>
      <div className="p-4">
        {/* Hiển thị avatar và tên user thay cho tên file */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={video.author.avatar || '/avatars/default-avatar.png'}
            alt={video.author.name}
            className="w-8 h-8 rounded-full object-cover border"
          />
          <div>
            <span className="font-semibold text-base">{video.author.name}</span>
            <span className="text-xs text-gray-500 block">{video.timeAgo}</span>
          </div>
        </div>
        {/* Hiển thị tổng hợp reaction */}
        <div className="flex gap-2 mt-2">
          {Object.entries(reactionSummary).map(([type, count]) => (
            <span key={type} className="flex items-center text-xs text-gray-600">
              {getReactionIcon(type)} {Number(count)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchFeed;
