"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Send, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Story, Profile } from "@/types";

interface StoryViewerProps {
  stories: Story[];
  user: Profile;
  initialIndex?: number;
  onClose: () => void;
  onPrevUser?: () => void;
  onNextUser?: () => void;
  onReply?: (storyId: string, message: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewer({
  stories,
  user,
  initialIndex = 0,
  onClose,
  onPrevUser,
  onNextUser,
  onReply,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reply, setReply] = useState("");

  const currentStory = stories[currentIndex];

  // Lock body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onNextUser?.() || onClose();
    }
  }, [currentIndex, stories.length, onNextUser, onClose]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      onPrevUser?.();
    }
  }, [currentIndex, onPrevUser]);

  // Auto-progress timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (STORY_DURATION / 100));
        if (newProgress >= 100) {
          goToNext();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const handleReply = () => {
    if (reply.trim()) {
      onReply?.(currentStory.id, reply);
      setReply("");
    }
  };

  const timeAgo = formatDistanceToNow(new Date(currentStory.created_at), {
    addSuffix: true,
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Story Container */}
      <div className="relative w-full h-dvh max-w-md mx-auto flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-2 pt-2">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width:
                    index < currentIndex
                      ? "100%"
                      : index === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex-shrink-0 z-30 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-white">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="text-sm font-semibold">{user.username}</p>
              <p className="text-xs opacity-70">{timeAgo}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Story Content - Main area */}
        <div
          className="flex-1 min-h-0 relative flex items-center justify-center"
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="w-full h-full flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {currentStory.media_type === "video" ? (
                <video
                  src={currentStory.media_url}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={currentStory.media_url}
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Areas */}
          <div className="absolute inset-0 flex z-10">
            <button
              className="w-1/3 h-full cursor-pointer"
              onClick={goToPrev}
              aria-label="Previous story"
            />
            <div className="w-1/3 h-full" />
            <button
              className="w-1/3 h-full cursor-pointer"
              onClick={goToNext}
              aria-label="Next story"
            />
          </div>
        </div>

        {/* Desktop Navigation Arrows */}
        {onPrevUser && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex text-white hover:bg-white/20 h-12 w-12"
            onClick={onPrevUser}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {onNextUser && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex text-white hover:bg-white/20 h-12 w-12"
            onClick={onNextUser}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Reply Input */}
        <div className="flex-shrink-0 z-30 p-4 pb-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Send a reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
              className="bg-transparent border-white/30 text-white placeholder:text-white/50"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 flex-shrink-0"
              onClick={handleReply}
            >
              <Send className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
