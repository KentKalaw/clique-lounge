"use client";

import { RefObject, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  ChevronDown,
  ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusicPlayerStore } from "@/lib/stores/music-player-store";
import { cn } from "@/lib/utils";
import { YouTubePlayerRef } from "./youtube-player";

interface ExpandedPlayerProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  youtubeRef: RefObject<YouTubePlayerRef | null>;
}

export function ExpandedPlayer({ audioRef, youtubeRef }: ExpandedPlayerProps) {
  
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    repeat,
    shuffle,
    toggle,
    nextTrack,
    prevTrack,
    setVolume,
    setExpanded,
    toggleRepeat,
    toggleShuffle,
  } = useMusicPlayerStore();

  const isYouTubeTrack = currentTrack?.youtubeId && !currentTrack?.audioUrl;

  const formatTime = (seconds: number) => {
    // Handle live streams (very long duration)
    if (seconds > 86400) return "LIVE";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = useCallback((value: number[]) => {
    if (isYouTubeTrack) {
      youtubeRef.current?.seekTo(value[0]);
    } else if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  }, [isYouTubeTrack, audioRef]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (isYouTubeTrack) {
      youtubeRef.current?.setVolume(value[0] * 100);
    } else if (audioRef.current) {
      audioRef.current.volume = value[0];
    }
    setVolume(value[0]);
  }, [isYouTubeTrack, audioRef, setVolume]);

  if (!currentTrack) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Background with blurred album art */}
      <div className="absolute inset-0 overflow-hidden">
        {currentTrack.coverUrl && (
          <div
            className="absolute inset-0 scale-150 blur-3xl opacity-30"
            style={{
              backgroundImage: `url(${currentTrack.coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(false)}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
          <span className="text-sm font-medium">Now Playing</span>
          <Button variant="ghost" size="icon">
            <ListMusic className="h-5 w-5" />
          </Button>
        </div>

        {/* Album Art / YouTube Video */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className={cn(
              "w-full max-w-[320px] aspect-square rounded-lg shadow-2xl overflow-hidden",
              "bg-gradient-to-br from-primary/20 to-primary/5"
            )}
            animate={{
              scale: isPlaying ? 1 : 0.95,
            }}
            transition={{ duration: 0.3 }}
          >
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">🎵</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Track Info & Controls */}
        <div className="p-8 space-y-6">
          {/* Track Info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold truncate">{currentTrack.name}</h2>
            <p className="text-lg text-muted-foreground truncate">
              {currentTrack.artist}
            </p>
            {currentTrack.album && (
              <p className="text-sm text-muted-foreground/70 truncate">
                {currentTrack.album}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            {duration > 86400 ? (
              // Live stream indicator
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-500">LIVE</span>
              </div>
            ) : (
              <>
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </>
            )}
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-12 w-12", shuffle && "text-primary")}
              onClick={toggleShuffle}
            >
              <Shuffle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={prevTrack}
            >
              <SkipBack className="h-7 w-7" />
            </Button>
            <Button
              size="icon"
              className="h-16 w-16 rounded-full"
              onClick={toggle}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={nextTrack}
            >
              <SkipForward className="h-7 w-7" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-12 w-12", repeat !== "off" && "text-primary")}
              onClick={toggleRepeat}
            >
              {repeat === "one" ? (
                <Repeat1 className="h-5 w-5" />
              ) : (
                <Repeat className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-4 px-4">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
