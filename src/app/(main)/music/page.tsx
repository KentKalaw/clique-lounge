"use client";

import { Play, Plus, Clock, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMusicPlayerStore } from "@/lib/stores/music-player-store";
import { usePlaylists, useRecentlyPlayed, defaultTracks } from "@/lib/hooks/use-playlists";
import { YouTubeSearch } from "@/components/music/youtube-search";
import type { MusicTrack } from "@/types";

export default function MusicPage() {
  const { setCurrentTrack, setQueue, play } = useMusicPlayerStore();
  const { playlists, isLoading: playlistsLoading } = usePlaylists();
  const { tracks: recentlyPlayed, addToRecentlyPlayed } = useRecentlyPlayed();

  // Use default tracks if user has no playlists
  const availableTracks = defaultTracks;
  const displayRecentlyPlayed = recentlyPlayed?.slice(0, 3) || [];

  const handlePlayTrack = (track: MusicTrack) => {
    setCurrentTrack(track);
    setQueue(availableTracks);
    addToRecentlyPlayed(track);
    play();
  };

  const handlePlayPlaylist = (playlistId: string) => {
    // In real app, fetch playlist tracks
    setQueue(availableTracks);
    setCurrentTrack(availableTracks[0]);
    addToRecentlyPlayed(availableTracks[0]);
    play();
  };

  const handleSearchTrackSelect = (track: MusicTrack) => {
    addToRecentlyPlayed(track);
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0 || seconds > 86400) return "LIVE";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in animate-delay-100">
      {/* Header */}
      <header>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Music</h1>
        </div>
        <p className="text-muted-foreground">
          Study playlists and focus beats
        </p>
      </header>

      {/* YouTube Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Search Music on YouTube</h3>
          </div>
          <YouTubeSearch onTrackSelect={handleSearchTrackSelect} />
        </CardContent>
      </Card>

      {/* Recently Played */}
      {displayRecentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recently Played</h2>
            <Button variant="ghost" size="sm">
              See All
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {displayRecentlyPlayed.map((track) => (
              <Card
                key={track.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handlePlayTrack(track)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-14 w-14 rounded-md">
                      <AvatarImage src={track.coverUrl} />
                      <AvatarFallback className="rounded-md">
                        <Music2 className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Playlists</h2>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {playlistsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="w-40 h-40 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : playlists && playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className="flex flex-col gap-2 text-left group"
                  onClick={() => handlePlayPlaylist(playlist.id)}
                >
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted">
                    {playlist.cover_url ? (
                      <img
                        src={playlist.cover_url}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium truncate">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.track_count} tracks
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground w-full">
                <Music2 className="h-12 w-12 mx-auto mb-2" />
                <p>No playlists yet. Create one to get started!</p>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Recommended Tracks */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recommended Tracks</h2>
        <Card>
          <CardContent className="p-0">
            {availableTracks.map((track, index) => (
              <button
                key={track.id}
                className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors border-b last:border-0"
                onClick={() => handlePlayTrack(track)}
              >
                <span className="text-sm text-muted-foreground w-6">
                  {index + 1}
                </span>
                <Avatar className="h-12 w-12 rounded-md">
                  <AvatarImage src={track.coverUrl} />
                  <AvatarFallback className="rounded-md">
                    <Music2 className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate">{track.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artist} • {track.album}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(track.duration)}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
