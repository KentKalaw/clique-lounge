"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MoreHorizontal, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useComments } from "@/lib/hooks/use-comments";
import { useCurrentUserProfile } from "@/lib/hooks/use-profile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { PostWithUser } from "@/types";

interface CommentsSheetProps {
  post: PostWithUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentsSheet({ post, open, onOpenChange }: CommentsSheetProps) {
  const [commentText, setCommentText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { profile } = useCurrentUserProfile();
  const {
    comments,
    isLoading,
    addComment,
    isAddingComment,
    deleteComment,
  } = useComments(post?.id || null);

  // Focus input when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Scroll to bottom when new comment is added
  useEffect(() => {
    if (scrollRef.current && comments.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;

    addComment(
      { postId: post.id, content: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!post) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[70vh]">
        <DrawerHeader className="border-b px-4 py-3">
          <DrawerTitle className="text-center">Comments</DrawerTitle>
        </DrawerHeader>

        {/* Comments list */}
        <ScrollArea className="flex-1 h-[calc(70vh-140px)]" ref={scrollRef}>
          <div className="p-4 space-y-4">
            {/* Loading skeleton */}
            {isLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Comments */}
            {!isLoading && comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            )}

            {!isLoading &&
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Link href={`/profile/${comment.user.username}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {comment.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link
                        href={`/profile/${comment.user.username}`}
                        className="font-semibold hover:underline"
                      >
                        {comment.user.username}
                      </Link>{" "}
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                      <button className="text-xs text-muted-foreground font-semibold hover:text-foreground">
                        Reply
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    {profile?.id === comment.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteComment(comment.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>

        {/* Comment input */}
        <div className="border-t p-3 bg-background">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.username?.slice(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <Input
              ref={inputRef}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-none bg-muted"
              disabled={isAddingComment}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={!commentText.trim() || isAddingComment}
              className={cn(
                "text-primary",
                !commentText.trim() && "text-muted-foreground"
              )}
            >
              {isAddingComment ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
