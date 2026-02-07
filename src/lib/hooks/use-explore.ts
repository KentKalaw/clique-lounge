import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface ExplorePost {
  id: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
}

export function useExplorePosts(searchQuery?: string) {
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["explore", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id, image_url, likes_count, comments_count")
        .order("likes_count", { ascending: false })
        .limit(50);

      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("caption", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ExplorePost[];
    },
  });

  return { posts, isLoading, isError, error, refetch };
}

export function useSearchUsers(searchQuery: string) {
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search-users", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length < 2) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.trim().length >= 2,
  });

  return { users, isLoading, isError, error };
}
