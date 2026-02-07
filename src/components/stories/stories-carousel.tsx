"use client";

import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserStories } from "@/types";

interface StoriesCarouselProps {
  stories: UserStories[];
  currentUserStories?: UserStories | null;
  onStoryClick?: (userId: string) => void;
  onAddStory?: () => void;
  onViewOwnStory?: () => void;
  currentUserId?: string;
  currentUserAvatar?: string | null;
  currentUserUsername?: string;
}

export function StoriesCarousel({
  stories,
  currentUserStories,
  onStoryClick,
  onAddStory,
  onViewOwnStory,
  currentUserId,
  currentUserAvatar,
  currentUserUsername,
}: StoriesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasOwnStories = currentUserStories && currentUserStories.stories.length > 0;

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-4 p-4" ref={scrollRef}>
        {/* Current User Story Button */}
        {hasOwnStories ? (
          // User HAS stories - show avatar with gradient ring and plus badge
          <div
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="relative">
              <button
                onClick={onViewOwnStory}
                className={cn(
                  "rounded-full p-[3px]",
                  currentUserStories.has_unviewed
                    ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                    : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                )}
              >
                <Avatar className="h-16 w-16 border-2 border-background">
                  <AvatarImage src={currentUserAvatar || undefined} />
                  <AvatarFallback>
                    {currentUserUsername?.slice(0, 2).toUpperCase() || "You"}
                  </AvatarFallback>
                </Avatar>
              </button>
              {/* Plus badge for adding more stories */}
              <button
                onClick={onAddStory}
                className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background hover:scale-110 transition-transform"
              >
                <Plus className="h-3 w-3 text-primary-foreground" />
              </button>
            </div>
            <span className="text-xs">Your Story</span>
          </div>
        ) : (
          // User has NO stories - show "Your Story" add button
          <button
            onClick={onAddStory}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-muted">
                <AvatarImage src={currentUserAvatar || undefined} />
                <AvatarFallback>
                  {currentUserUsername?.slice(0, 2).toUpperCase() || "You"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs">Your Story</span>
          </button>
        )}

        {/* Followed Users Stories */}
        {stories.map((userStory) => (
          <button
            key={userStory.user.id}
            onClick={() => onStoryClick?.(userStory.user.id)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div
              className={cn(
                "rounded-full p-[3px]",
                userStory.has_unviewed
                  ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                  : "bg-muted"
              )}
            >
              <Avatar className="h-16 w-16 border-2 border-background">
                <AvatarImage src={userStory.user.avatar_url || undefined} />
                <AvatarFallback>
                  {userStory.user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs max-w-[64px] truncate">
              {userStory.user.username}
            </span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
