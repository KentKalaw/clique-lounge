"use client";

import { useState, useCallback } from "react";
import { Search, Play, Loader2, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicPlayerStore } from "@/lib/stores/music-player-store";
import type { MusicTrack } from "@/types";

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
}

interface YouTubeSearchProps {
  onTrackSelect?: (track: MusicTrack) => void;
}

export function YouTubeSearch({ onTrackSelect }: YouTubeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { setCurrentTrack, play } = useMusicPlayerStore();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Search failed");
        setResults([]);
        return;
      }

      setResults(data.videos || []);
    } catch (err) {
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handlePlayVideo = (video: YouTubeVideo) => {
    const track: MusicTrack = {
      id: `yt-${video.id}-${Date.now()}`,
      name: video.title,
      artist: video.channel,
      youtubeId: video.id,
      duration: 0,
      coverUrl: video.thumbnail,
    };

    setCurrentTrack(track);
    play();
    onTrackSelect?.(track);
  };

  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search music on YouTube..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
            {error.includes("API key") && (
              <p className="mt-2 text-xs text-muted-foreground">
                Add YOUTUBE_API_KEY to your .env.local file
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 pr-4">
            {results.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handlePlayVideo(video)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="relative flex-shrink-0 group">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">
                      {decodeHtmlEntities(video.title)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {video.channel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* No Results State */}
      {hasSearched && !isSearching && results.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground">
          <Music2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No results found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
