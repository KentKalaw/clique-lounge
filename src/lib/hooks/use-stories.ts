import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { UserStories, Story } from "@/types";

export function useStories() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { stories: [], currentUserStories: null };
      }

      // Get list of users the current user follows
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = following?.map((f) => f.following_id) || [];
      
      // Include current user's ID to fetch their stories too
      const userIdsToFetch = [...followingIds, user.id];

      // Fetch active stories (not expired) from followed users + current user
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select(
          `
          *,
          user:profiles(*)
        `
        )
        .in("user_id", userIdsToFetch)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      // Get viewed stories for current user
      let viewedStoryIds = new Set<string>();
      const { data: views } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("user_id", user.id);

      viewedStoryIds = new Set(views?.map((v) => v.story_id) || []);

      // Group stories by user
      const userStoriesMap = new Map<string, UserStories>();
      let currentUserStories: UserStories | null = null;

      for (const story of storiesData || []) {
        const userId = story.user_id;
        const isViewed = viewedStoryIds.has(story.id);

        if (!userStoriesMap.has(userId)) {
          userStoriesMap.set(userId, {
            user: story.user,
            stories: [],
            has_unviewed: false,
          });
        }

        const userStories = userStoriesMap.get(userId)!;
        userStories.stories.push({
          ...story,
          is_viewed: isViewed,
        } as Story);

        if (!isViewed) {
          userStories.has_unviewed = true;
        }
      }

      // Separate current user's stories from followed users' stories
      if (userStoriesMap.has(user.id)) {
        currentUserStories = userStoriesMap.get(user.id)!;
        userStoriesMap.delete(user.id);
      }

      return {
        stories: Array.from(userStoriesMap.values()),
        currentUserStories,
      };
    },
  });

  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("story_views").upsert(
        {
          story_id: storyId,
          user_id: user.id,
        },
        { onConflict: "story_id,user_id" }
      );

      // Increment view count
      await supabase.rpc("increment_story_views", { story_id: storyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async ({
      mediaUrl,
      mediaType,
    }: {
      mediaUrl: string;
      mediaType: "image" | "video";
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  return {
    stories: data?.stories || [],
    currentUserStories: data?.currentUserStories || null,
    isLoading,
    isError,
    error,
    refetch,
    viewStory: (storyId: string) => viewStoryMutation.mutate(storyId),
    createStory: (mediaUrl: string, mediaType: "image" | "video") =>
      createStoryMutation.mutateAsync({ mediaUrl, mediaType }),
  };
}
