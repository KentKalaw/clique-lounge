"use client";

import { Settings, Grid3X3, Bookmark, Timer } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useCurrentUserProfile, useUserPosts, usePomodoroStats } from "@/lib/hooks/use-profile";

export default function ProfilePage() {
  const { profile, isLoading: profileLoading } = useCurrentUserProfile();
  const { posts, isLoading: postsLoading } = useUserPosts(profile?.id || "");
  const { stats: pomodoroStats, isLoading: statsLoading } = usePomodoroStats();

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between h-14 px-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-md" />
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
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Please sign in to view your profile</p>
        <Link href="/login">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in animate-delay-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-semibold">{profile.username}</h1>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
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
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
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

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none h-12 border-t">
          <TabsTrigger
            value="posts"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <Grid3X3 className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <Bookmark className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="pomodoro"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <Timer className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
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
              <Grid3X3 className="h-12 w-12 mx-auto mb-4" />
              <p>No posts yet</p>
              <Link href="/create">
                <Button variant="link">Create your first post</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <div className="py-12 text-center text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4" />
            <p>No saved posts yet</p>
          </div>
        </TabsContent>

        <TabsContent value="pomodoro" className="mt-0 p-4">
          <div className="text-center py-12">
            <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Pomodoro Statistics
            </h3>
            <p className="text-muted-foreground mb-4">
              Track your study sessions and view your productivity stats
            </p>
            {statsLoading ? (
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{pomodoroStats?.totalSessions || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{pomodoroStats?.totalHours || 0}h</p>
                  <p className="text-xs text-muted-foreground">Focus Time</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{pomodoroStats?.thisWeekSessions || 0}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
