-- Clique Lounge Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- PROFILES TABLE
-- =====================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- =====================================
-- POSTS TABLE
-- =====================================
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- STORIES TABLE
-- =====================================
CREATE TABLE stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  views_count INTEGER DEFAULT 0
);

CREATE INDEX stories_user_id_idx ON stories(user_id);
CREATE INDEX stories_expires_at_idx ON stories(expires_at);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Active stories are viewable by everyone"
  ON stories FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Users can create their own stories"
  ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- STORY VIEWS TABLE
-- =====================================
CREATE TABLE story_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Enable RLS
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Story views policies
CREATE POLICY "Users can view story views"
  ON story_views FOR SELECT USING (true);

CREATE POLICY "Users can record their own views"
  ON story_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================
-- LIKES TABLE
-- =====================================
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX likes_post_id_idx ON likes(post_id);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT USING (true);

CREATE POLICY "Users can like posts"
  ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON likes FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- COMMENTS TABLE
-- =====================================
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX comments_post_id_idx ON comments(post_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- FOLLOWS TABLE
-- =====================================
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX follows_follower_idx ON follows(follower_id);
CREATE INDEX follows_following_idx ON follows(following_id);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- =====================================
-- POMODORO SESSIONS TABLE
-- =====================================
CREATE TABLE pomodoro_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  task_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX pomodoro_sessions_user_id_idx ON pomodoro_sessions(user_id);
CREATE INDEX pomodoro_sessions_started_at_idx ON pomodoro_sessions(started_at DESC);

-- Enable RLS
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Pomodoro sessions policies
CREATE POLICY "Users can view their own sessions"
  ON pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);

-- =====================================
-- PLAYLISTS TABLE
-- =====================================
CREATE TABLE playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Playlists are viewable by everyone"
  ON playlists FOR SELECT USING (true);

CREATE POLICY "Users can create their own playlists"
  ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON playlists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON playlists FOR DELETE USING (auth.uid() = user_id);

-- =====================================
-- PLAYLIST TRACKS TABLE
-- =====================================
CREATE TABLE playlist_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  duration_seconds INTEGER,
  track_url TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX playlist_tracks_playlist_id_idx ON playlist_tracks(playlist_id);

-- Enable RLS
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Playlist tracks policies
CREATE POLICY "Playlist tracks are viewable by everyone"
  ON playlist_tracks FOR SELECT USING (true);

CREATE POLICY "Playlist owners can add tracks"
  ON playlist_tracks FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM playlists WHERE id = playlist_id)
  );

CREATE POLICY "Playlist owners can remove tracks"
  ON playlist_tracks FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM playlists WHERE id = playlist_id)
  );

-- =====================================
-- FUNCTIONS
-- =====================================

-- Function to increment story views
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories SET views_count = views_count + 1 WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update likes_count on posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes count
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Function to update comments_count on posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comments count
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================
-- STORAGE BUCKETS
-- =====================================

-- Create storage buckets (run in Supabase Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies would be:
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('posts', 'stories', 'avatars'));
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (auth.uid() = owner);
-- CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (auth.uid() = owner);
