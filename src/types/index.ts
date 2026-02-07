// Database Types
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  location: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface PostWithUser extends Post {
  user: Profile;
  is_liked: boolean;
  is_following?: boolean;
  is_own_post?: boolean;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  views_count: number;
}

export interface StoryWithUser extends Story {
  user: Profile;
  is_viewed: boolean;
}

export interface UserStories {
  user: Profile;
  stories: Story[];
  has_unviewed: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
}

export interface CommentWithUser extends Comment {
  user: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  completed: boolean;
  task_name: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  created_at: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_name: string;
  artist_name: string;
  duration_seconds: number | null;
  track_url: string | null;
  added_at: string;
}

// Component Props Types
export interface FeedPostProps {
  post: PostWithUser;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onFollow?: (userId: string, isFollowing: boolean) => void;
}

export interface StoryAvatarProps {
  user: Profile;
  hasUnviewed: boolean;
  onClick?: () => void;
}

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string;
  audioUrl?: string;
  youtubeId?: string; // YouTube video ID for iframe player
}

export interface PomodoroState {
  isRunning: boolean;
  mode: 'work' | 'break';
  timeRemaining: number;
  workDuration: number;
  breakDuration: number;
  completedSessions: number;
  currentTask: string | null;
}
