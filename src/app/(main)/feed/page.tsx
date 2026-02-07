"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeedPost, CommentsSheet } from "@/components/feed";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { StoriesCarousel } from "@/components/stories/stories-carousel";
import { StoryViewer } from "@/components/stories/story-viewer";
import { AnimatePresence } from "framer-motion";
import { usePosts } from "@/lib/hooks/use-posts";
import { useStories } from "@/lib/hooks/use-stories";
import { useCurrentUserProfile, useFollowUser } from "@/lib/hooks/use-profile";
import type { Story, Profile, PostWithUser } from "@/types";

export default function FeedPage() {
  const router = useRouter();
  const { posts, isLoading: postsLoading, likePost } = usePosts();
  const { stories, currentUserStories, isLoading: storiesLoading, viewStory } = useStories();
  const { profile } = useCurrentUserProfile();
  const { mutate: followUser } = useFollowUser();
  
  const [selectedStory, setSelectedStory] = useState<{
    stories: Story[];
    user: Profile;
    index: number;
  } | null>(null);

  const [commentsPost, setCommentsPost] = useState<PostWithUser | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Combine current user's stories with followed users' stories for viewing
  const allStories = currentUserStories 
    ? [currentUserStories, ...stories] 
    : stories;

  const handleStoryClick = (userId: string) => {
    const storyIndex = allStories.findIndex((s) => s.user.id === userId);
    if (storyIndex !== -1) {
      setSelectedStory({
        stories: allStories[storyIndex].stories,
        user: allStories[storyIndex].user,
        index: storyIndex,
      });
      // Mark first story as viewed
      if (allStories[storyIndex].stories.length > 0) {
        viewStory(allStories[storyIndex].stories[0].id);
      }
    }
  };

  const handleViewOwnStory = () => {
    if (currentUserStories && currentUserStories.stories.length > 0) {
      setSelectedStory({
        stories: currentUserStories.stories,
        user: currentUserStories.user,
        index: 0,
      });
      // Mark first story as viewed
      viewStory(currentUserStories.stories[0].id);
    }
  };

  const handlePrevUser = () => {
    if (selectedStory && selectedStory.index > 0) {
      const newIndex = selectedStory.index - 1;
      setSelectedStory({
        stories: allStories[newIndex].stories,
        user: allStories[newIndex].user,
        index: newIndex,
      });
    }
  };

  const handleNextUser = () => {
    if (selectedStory && selectedStory.index < allStories.length - 1) {
      const newIndex = selectedStory.index + 1;
      setSelectedStory({
        stories: allStories[newIndex].stories,
        user: allStories[newIndex].user,
        index: newIndex,
      });
    } else {
      setSelectedStory(null);
    }
  };

  const handleLike = (postId: string, isLiked: boolean) => {
    likePost(postId, isLiked);
  };

  const handleFollow = (userId: string, isFollowing: boolean) => {
    followUser({ userId, isFollowing });
  };

  const handleOpenComments = (post: PostWithUser) => {
    setCommentsPost(post);
    setIsCommentsOpen(true);
  };

  if (postsLoading || storiesLoading) {
    return (
      <div className="max-w-xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-center h-14 px-4">
            <h1 className="text-xl font-bold">Clique Lounge</h1>
          </div>
        </header>
        <FeedSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in animate-delay-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-xl font-bold">Clique Lounge</h1>
        </div>
      </header>

      {/* Stories */}
      <div className="border-b">
        <StoriesCarousel
          stories={stories}
          currentUserStories={currentUserStories}
          onStoryClick={handleStoryClick}
          onAddStory={() => router.push("/stories")}
          onViewOwnStory={handleViewOwnStory}
          currentUserAvatar={profile?.avatar_url}
          currentUserUsername={profile?.username}
          currentUserId={profile?.id}
        />
      </div>

      {/* Feed */}
      <div className="divide-y">
        {posts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No posts yet. Follow some users to see their posts!</p>
          </div>
        ) : (
          posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onLike={(id) => handleLike(id, post.is_liked)}
              onComment={() => handleOpenComments(post)}
              onShare={(id) => navigator.share?.({ url: `/post/${id}` })}
              onFollow={handleFollow}
            />
          ))
        )}
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {selectedStory && (
          <StoryViewer
            stories={selectedStory.stories}
            user={selectedStory.user}
            onClose={() => setSelectedStory(null)}
            onPrevUser={selectedStory.index > 0 ? handlePrevUser : undefined}
            onNextUser={handleNextUser}
            onReply={(storyId, message) => {
              console.log("Reply to", storyId, message);
            }}
          />
        )}
      </AnimatePresence>

      {/* Comments Sheet */}
      <CommentsSheet
        post={commentsPost}
        open={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
      />
    </div>
  );
}
