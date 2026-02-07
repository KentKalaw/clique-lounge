import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { PostWithUser } from "@/types";

const POSTS_PER_PAGE = 10;

export function usePosts() {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data: posts, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:profiles(*)
        `
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Get current user's likes and follows
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const postIds = posts?.map((p) => p.id) || [];
        const userIds = posts?.map((p) => p.user_id) || [];

        const [{ data: likes }, { data: follows }] = await Promise.all([
          supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds),
          supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id)
            .in("following_id", userIds),
        ]);

        const likedPostIds = new Set(likes?.map((l) => l.post_id));
        const followedUserIds = new Set(follows?.map((f) => f.following_id));

        return (posts || []).map((post) => ({
          ...post,
          is_liked: likedPostIds.has(post.id),
          is_following: followedUserIds.has(post.user_id),
          is_own_post: post.user_id === user.id,
        })) as PostWithUser[];
      }

      return (posts || []).map((post) => ({
        ...post,
        is_liked: false,
        is_following: false,
        is_own_post: false,
      })) as PostWithUser[];
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < POSTS_PER_PAGE) return undefined;
      return pages.length;
    },
    initialPageParam: 0,
  });

  const likeMutation = useMutation({
    mutationFn: async ({
      postId,
      isLiked,
    }: {
      postId: string;
      isLiked: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
      } else {
        // Like
        await supabase.from("likes").insert({
          user_id: user.id,
          post_id: postId,
        });
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: PostWithUser[]) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: !isLiked,
                    likes_count: isLiked
                      ? post.likes_count - 1
                      : post.likes_count + 1,
                  }
                : post
            )
          ),
        };
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
  });

  const posts = data?.pages.flat() || [];

  return {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    likePost: (postId: string, isLiked: boolean) =>
      likeMutation.mutate({ postId, isLiked }),
  };
}
