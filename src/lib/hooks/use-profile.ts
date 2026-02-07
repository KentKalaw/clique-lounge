import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface ProfileWithStats extends Profile {
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return profile as Profile;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return profile as Profile;
    },
    enabled: true,
  });

  return { profile, isLoading, isError, error, refetch };
}

export function useProfileByUsername(username: string) {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile", "username", username],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) throw error;

      // Get counts
      const [postsCount, followersCount, followingCount] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.id),
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", profile.id),
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", profile.id),
      ]);

      // Check if current user is following
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let isFollowing = false;
      if (user && user.id !== profile.id) {
        const { data: follow } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .single();
        isFollowing = !!follow;
      }

      return {
        ...profile,
        posts_count: postsCount.count || 0,
        followers_count: followersCount.count || 0,
        following_count: followingCount.count || 0,
        is_following: isFollowing,
      } as ProfileWithStats;
    },
    enabled: !!username,
  });

  return { profile, isLoading, isError, error, refetch };
}

export function useCurrentUserProfile() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile", "current"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Get counts
      const [postsCount, followersCount, followingCount] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", user.id),
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", user.id),
      ]);

      return {
        ...profile,
        posts_count: postsCount.count || 0,
        followers_count: followersCount.count || 0,
        following_count: followingCount.count || 0,
      } as ProfileWithStats;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile to remove avatar URL
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    profile,
    isLoading,
    isError,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    removeAvatar: removeAvatarMutation.mutate,
    isRemovingAvatar: removeAvatarMutation.isPending,
  };
}

export function useUserPosts(userId: string) {
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", "user", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return { posts, isLoading, isError, error, refetch };
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isFollowing,
    }: {
      userId: string;
      isFollowing: boolean;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isFollowing) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function usePomodoroStats(userId?: string) {
  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pomodoro-stats", userId],
    queryFn: async () => {
      let targetUserId = userId;

      if (!targetUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;
        targetUserId = user.id;
      }

      const { data: sessions, error } = await supabase
        .from("pomodoro_sessions")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("completed", true);

      if (error) throw error;

      const totalSessions = sessions?.length || 0;
      const totalMinutes = sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);

      // Get this week's sessions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekSessions = sessions?.filter(
        (s) => new Date(s.started_at) > weekAgo
      ).length || 0;

      return {
        totalSessions,
        totalMinutes,
        totalHours,
        thisWeekSessions,
      };
    },
  });

  return { stats, isLoading, isError, error };
}
