import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { CommentWithUser } from "@/types";

export function useComments(postId: string | null) {
  const queryClient = useQueryClient();

  const {
    data: comments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:profiles(*)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CommentWithUser[];
    },
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: postId,
          content,
        })
        .select(
          `
          *,
          user:profiles(*)
        `
        )
        .single();

      if (error) throw error;
      return data as CommentWithUser;
    },
    onSuccess: (newComment) => {
      // Update comments cache
      queryClient.setQueryData(
        ["comments", postId],
        (old: CommentWithUser[] | undefined) => {
          return old ? [...old, newComment] : [newComment];
        }
      );
      
      // Update post comments count in posts cache
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) =>
            page.map((post) =>
              post.id === postId
                ? { ...post, comments_count: (post.comments_count || 0) + 1 }
                : post
            )
          ),
        };
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return commentId;
    },
    onSuccess: (deletedCommentId) => {
      // Update comments cache
      queryClient.setQueryData(
        ["comments", postId],
        (old: CommentWithUser[] | undefined) => {
          return old ? old.filter((c) => c.id !== deletedCommentId) : [];
        }
      );
      
      // Update post comments count
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) =>
            page.map((post) =>
              post.id === postId
                ? { ...post, comments_count: Math.max(0, (post.comments_count || 0) - 1) }
                : post
            )
          ),
        };
      });
    },
  });

  return {
    comments: comments || [],
    isLoading,
    isError,
    error,
    refetch,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
  };
}
