"use client";

import { useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useMusicPlayerStore } from "@/lib/stores/music-player-store";
import { cn } from "@/lib/utils";
import { ExpandedPlayer } from "@/components/music/expanded-player";
import { YouTubeMusicPlayer, YouTubePlayerRef } from "./youtube-player";

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isExpanded,
    toggle,
    nextTrack,
    prevTrack,
    setProgress,
    setDuration,
    setVolume,
    setExpanded,
    pause,
  } = useMusicPlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeRef = useRef<YouTubePlayerRef>(null);
  const isYouTubeTrack = !!currentTrack?.youtubeId;

  // Audio element setup (only for non-YouTube tracks)
  useEffect(() => {
    if (isYouTubeTrack) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [setProgress, setDuration, nextTrack, isYouTubeTrack]);

  // Play/pause for non-YouTube tracks
  useEffect(() => {
    if (isYouTubeTrack) return;
    if (!audioRef.current || !currentTrack?.audioUrl) return;

    const audio = audioRef.current;
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(() => {
        pause();
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, pause, isYouTubeTrack]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0 || !isFinite(seconds)) return "LIVE";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (isYouTubeTrack) {
      youtubeRef.current?.setVolume(newVolume * 100);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const toggleMute = () => {
    const newVolume = volume === 0 ? 1 : 0;
    handleVolumeChange([newVolume]);
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Hidden YouTube Player */}
      {isYouTubeTrack && <YouTubeMusicPlayer ref={youtubeRef} hidden />}

      <AnimatePresence>
        {isExpanded && <ExpandedPlayer audioRef={audioRef} youtubeRef={youtubeRef} />}
      </AnimatePresence>

      <motion.div
        className={cn(
          "fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 z-40",
          "bg-background/95 backdrop-blur border-t",
          isExpanded && "hidden"
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Progress bar */}
        <Progress value={progressPercent} className="h-1 rounded-none" />

        <div className="flex items-center gap-4 p-2 px-4">
          {/* Track Info */}
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden",
                "bg-gradient-to-br from-primary/20 to-primary/5"
              )}
            >
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{currentTrack.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
          </button>

          {/* Time Display (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hidden sm:flex"
              onClick={prevTrack}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={toggle}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
