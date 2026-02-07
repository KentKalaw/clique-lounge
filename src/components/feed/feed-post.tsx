"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { FeedPostProps } from "@/types";

export function FeedPost({ post, onLike, onComment, onShare, onFollow }: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isSaved, setIsSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike?.(post.id);
  }, [isLiked, post.id, onLike]);

  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      onLike?.(post.id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  }, [isLiked, post.id, onLike]);

  const handleFollow = useCallback(() => {
    onFollow?.(post.user_id, post.is_following ?? false);
  }, [post.user_id, post.is_following, onFollow]);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  return (
    <article className="border-b bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.username}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.user.avatar_url || undefined} />
              <AvatarFallback>
                {post.user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.user.username}`}
              className="flex flex-col"
            >
              <span className="text-sm font-semibold hover:underline">
                {post.user.username}
              </span>
              {post.location && (
                <span className="text-xs text-muted-foreground">
                  {post.location}
                </span>
              )}
            </Link>
            {!post.is_own_post && (
              post.is_following ? (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">Following</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">•</span>
                  <button
                    onClick={handleFollow}
                    className="text-sm font-semibold text-blue-500 hover:text-blue-400"
                  >
                    Follow
                  </button>
                </>
              )
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Go to post</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image */}
      <div
        className="relative aspect-square bg-muted cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={post.image_url}
          alt={post.caption || "Post image"}
          className="w-full h-full object-cover"
        />

        {/* Double-tap heart animation */}
        {showHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleLike}
          >
            <Heart
              className={cn(
                "h-6 w-6 transition-colors",
                isLiked && "fill-red-500 text-red-500"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onShare?.(post.id)}
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsSaved((prev) => !prev)}
        >
          <Bookmark
            className={cn(
              "h-6 w-6 transition-colors",
              isSaved && "fill-current"
            )}
          />
        </Button>
      </div>

      {/* Likes & Caption */}
      <div className="px-3 pb-3 space-y-1">
        <p className="font-semibold text-sm">
          {likesCount.toLocaleString()} likes
        </p>
        {post.caption && (
          <p className="text-sm">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-semibold hover:underline"
            >
              {post.user.username}
            </Link>{" "}
            {post.caption}
          </p>
        )}
        {post.comments_count > 0 ? (
          <button
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => onComment?.(post.id)}
          >
            View all {post.comments_count} comments
          </button>
        ) : (
          <button
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => onComment?.(post.id)}
          >
            Be the first one to comment
          </button>
        )}
        <p className="text-xs text-muted-foreground uppercase">{timeAgo}</p>
        
        {/* Add comment input */}
        <button
          className="text-sm text-muted-foreground pt-2 text-left"
          onClick={() => onComment?.(post.id)}
        >
          Add a comment...
        </button>
      </div>
    </article>
  );
}
