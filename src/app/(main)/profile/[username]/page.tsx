"use client";

import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";
import { useProfileByUsername, useUserPosts, useFollowUser } from "@/lib/hooks/use-profile";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const { profile, isLoading: profileLoading } = useProfileByUsername(username);
  const { posts, isLoading: postsLoading } = useUserPosts(profile?.id || "");
  const followMutation = useFollowUser();

  const handleFollow = () => {
    if (profile) {
      followMutation.mutate({
        userId: profile.id,
        isFollowing: profile.is_following || false,
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center h-14 px-4 gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="h-20 w-20 md:h-32 md:w-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center h-14 px-4 gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">User not found</h1>
          </div>
        </header>
        <div className="p-8 text-center text-muted-foreground">
          <p>This user doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in animate-delay-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center h-14 px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold flex-1">{profile.username}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Share Profile</DropdownMenuItem>
              <DropdownMenuItem>Copy Profile URL</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Block
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Profile Info */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <Avatar className="h-20 w-20 md:h-32 md:w-32">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              <div className="flex gap-2">
                <Button
                  variant={profile.is_following ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={followMutation.isPending}
                >
                  {profile.is_following ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{profile.posts_count || 0}</span>{" "}
                <span className="text-muted-foreground">posts</span>
              </div>
              <button className="hover:underline">
                <span className="font-semibold">
                  {(profile.followers_count || 0).toLocaleString()}
                </span>{" "}
                <span className="text-muted-foreground">followers</span>
              </button>
              <button className="hover:underline">
                <span className="font-semibold">
                  {(profile.following_count || 0).toLocaleString()}
                </span>{" "}
                <span className="text-muted-foreground">following</span>
              </button>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              {profile.full_name && (
                <p className="font-semibold">{profile.full_name}</p>
              )}
              {profile.bio && (
                <p className="text-sm whitespace-pre-line">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="border-t">
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <button
                key={post.id}
                className="relative aspect-square overflow-hidden bg-muted"
              >
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="text-white text-sm font-semibold flex items-center gap-4">
                    <span>❤️ {post.likes_count}</span>
                    <span>💬 {post.comments_count}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
