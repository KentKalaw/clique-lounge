"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { useMusicPlayerStore } from "@/lib/stores/music-player-store";

export interface YouTubePlayerRef {
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
}

interface YouTubeMusicPlayerProps {
  className?: string;
  hidden?: boolean;
}

export const YouTubeMusicPlayer = forwardRef<YouTubePlayerRef, YouTubeMusicPlayerProps>(
  function YouTubeMusicPlayer({ className, hidden = true }, ref) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    setProgress,
    setDuration,
    nextTrack,
  } = useMusicPlayerStore();

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        try {
          playerRef.current.seekTo(seconds, true);
        } catch (e) {
          // Player not ready
        }
      }
    },
    setVolume: (vol: number) => {
      if (playerRef.current) {
        try {
          playerRef.current.setVolume(vol);
        } catch (e) {
          // Player not ready
        }
      }
    },
  }), []);

  // Handle play/pause state changes
  useEffect(() => {
    if (!playerRef.current) return;
    
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      // Player not ready yet
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!playerRef.current) return;
    
    try {
      playerRef.current.setVolume(volume * 100);
    } catch (e) {
      // Player not ready yet
    }
  }, [volume]);

  // Handle seeking
  useEffect(() => {
    if (!playerRef.current) return;
    
    const handleSeek = () => {
      try {
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        // Only seek if the difference is more than 2 seconds (to avoid loop from progress updates)
        if (Math.abs(currentTime - progress) > 2) {
          playerRef.current?.seekTo(progress, true);
        }
      } catch (e) {
        // Player not ready yet
      }
    };

    // We'll handle seeking through a custom event to avoid conflicts
  }, [progress]);

  const onReady = useCallback((event: YouTubeEvent) => {
    playerRef.current = event.target;
    
    // Set initial volume
    event.target.setVolume(volume * 100);
    
    // Get duration
    const duration = event.target.getDuration();
    setDuration(duration);
    
    // Auto-play if isPlaying is true
    if (isPlaying) {
      event.target.playVideo();
    }
  }, [volume, isPlaying, setDuration]);

  const onStateChange = useCallback((event: YouTubeEvent) => {
    const state = event.data;
    
    // YouTube player states:
    // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    
    if (state === 1) {
      // Playing - start progress tracking
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            setProgress(currentTime);
          } catch (e) {
            // Player might be destroyed
          }
        }
      }, 1000);
    } else if (state === 2 || state === 0) {
      // Paused or ended - stop progress tracking
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      
      // If ended, play next track
      if (state === 0) {
        nextTrack();
      }
    }
  }, [setProgress, nextTrack]);

  const onError = useCallback((event: YouTubeEvent) => {
    console.error("YouTube player error:", event.data);
    // Try to play next track on error
    nextTrack();
  }, [nextTrack]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Don't render if no YouTube track
  if (!currentTrack?.youtubeId) {
    return null;
  }

  const opts = {
    height: hidden ? "0" : "360",
    width: hidden ? "0" : "640",
    playerVars: {
      autoplay: isPlaying ? 1 : 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  return (
    <div className={className} style={hidden ? { position: 'absolute', opacity: 0, pointerEvents: 'none' } : undefined}>
      <YouTube
        videoId={currentTrack.youtubeId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
      />
    </div>
  );
});

// Helper to seek - call this from player controls
export function seekYouTubePlayer(seconds: number) {
  const event = new CustomEvent('youtube-seek', { detail: seconds });
  window.dispatchEvent(event);
}
