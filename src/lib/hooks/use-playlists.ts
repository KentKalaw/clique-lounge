import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { MusicTrack } from "@/types";

interface Playlist {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  created_at: string;
  track_count?: number;
}

interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_name: string;
  artist_name: string;
  duration_seconds: number | null;
  track_url: string | null;
  added_at: string;
}

export function usePlaylists() {
  const queryClient = useQueryClient();

  const {
    data: playlists,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get track counts for each playlist
      const playlistsWithCounts = await Promise.all(
        (data || []).map(async (playlist) => {
          const { count } = await supabase
            .from("playlist_tracks")
            .select("id", { count: "exact", head: true })
            .eq("playlist_id", playlist.id);

          return {
            ...playlist,
            track_count: count || 0,
          };
        })
      );

      return playlistsWithCounts as Playlist[];
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async ({
      name,
      cover_url,
    }: {
      name: string;
      cover_url?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("playlists")
        .insert({
          user_id: user.id,
          name,
          cover_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  return {
    playlists,
    isLoading,
    isError,
    error,
    refetch,
    createPlaylist: createPlaylistMutation.mutate,
    deletePlaylist: deletePlaylistMutation.mutate,
    isCreating: createPlaylistMutation.isPending,
  };
}

export function usePlaylistTracks(playlistId: string) {
  const queryClient = useQueryClient();

  const {
    data: tracks,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["playlist-tracks", playlistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlist_tracks")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("added_at", { ascending: true });

      if (error) throw error;

      // Transform to MusicTrack format
      return (data || []).map((track) => ({
        id: track.id,
        name: track.track_name,
        artist: track.artist_name,
        album: "",
        duration: track.duration_seconds || 0,
        coverUrl: "",
        audioUrl: track.track_url || "",
      })) as MusicTrack[];
    },
    enabled: !!playlistId,
  });

  const addTrackMutation = useMutation({
    mutationFn: async ({
      track_name,
      artist_name,
      duration_seconds,
      track_url,
    }: {
      track_name: string;
      artist_name: string;
      duration_seconds?: number;
      track_url?: string;
    }) => {
      const { error } = await supabase.from("playlist_tracks").insert({
        playlist_id: playlistId,
        track_name,
        artist_name,
        duration_seconds,
        track_url,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist-tracks", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  const removeTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("id", trackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist-tracks", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  return {
    tracks,
    isLoading,
    isError,
    error,
    refetch,
    addTrack: addTrackMutation.mutate,
    removeTrack: removeTrackMutation.mutate,
  };
}

// For recently played - we'll store this in localStorage with user-specific keys
export function useRecentlyPlayed() {
  const {
    data: tracks,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["recently-played"],
    queryFn: async () => {
      if (typeof window === "undefined") return [];
      
      // Get current user for user-specific storage
      const { data: { user } } = await supabase.auth.getUser();
      const storageKey = user ? `recently-played-${user.id}` : "recently-played-guest";
      
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      
      try {
        return JSON.parse(stored) as MusicTrack[];
      } catch {
        return [];
      }
    },
  });

  const addToRecentlyPlayed = async (track: MusicTrack) => {
    if (typeof window === "undefined") return;
    
    // Get current user for user-specific storage
    const { data: { user } } = await supabase.auth.getUser();
    const storageKey = user ? `recently-played-${user.id}` : "recently-played-guest";
    
    const stored = localStorage.getItem(storageKey);
    let recent: MusicTrack[] = [];
    
    try {
      recent = stored ? JSON.parse(stored) : [];
    } catch {
      recent = [];
    }

    // Remove if already exists
    recent = recent.filter((t) => t.id !== track.id);
    // Add to front
    recent.unshift(track);
    // Keep only last 10
    recent = recent.slice(0, 10);

    localStorage.setItem(storageKey, JSON.stringify(recent));
  };

  return { tracks, isLoading, refetch, addToRecentlyPlayed };
}

// Default tracks for users without playlists - using YouTube Music
export const defaultTracks: MusicTrack[] = [
  {
    id: "yt-1",
    name: "Chill Lofi Hip Hop Radio",
    artist: "Lofi Girl",
    album: "Study Beats",
    duration: 0, // Live stream
    coverUrl: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    youtubeId: "jfKfPfyJRdk",
  },
  {
    id: "yt-2",
    name: "Synthwave Radio",
    artist: "Lofi Girl",
    album: "Synthwave Mix",
    duration: 0,
    coverUrl: "https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg",
    youtubeId: "4xDzrJKXOOY",
  },
  {
    id: "yt-3",
    name: "Relaxing Jazz Piano",
    artist: "Cafe Music BGM",
    album: "Jazz Collection",
    duration: 10800,
    coverUrl: "https://i.ytimg.com/vi/Dx5qFachd3A/hqdefault.jpg",
    youtubeId: "Dx5qFachd3A",
  },
  {
    id: "yt-4",
    name: "Deep Focus Music",
    artist: "Greenred Productions",
    album: "Study Music",
    duration: 10800,
    coverUrl: "https://i.ytimg.com/vi/oPVte6aMprI/hqdefault.jpg",
    youtubeId: "oPVte6aMprI",
  },
  {
    id: "yt-5",
    name: "Ambient Study Music",
    artist: "Yellow Brick Cinema",
    album: "Concentration Music",
    duration: 10800,
    coverUrl: "https://i.ytimg.com/vi/sjkrrmBnpGE/hqdefault.jpg",
    youtubeId: "sjkrrmBnpGE",
  },
];
