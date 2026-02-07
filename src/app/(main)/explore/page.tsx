"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useExplorePosts, useSearchUsers } from "@/lib/hooks/use-explore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { posts, isLoading } = useExplorePosts(searchQuery);
  const { users, isLoading: usersLoading } = useSearchUsers(searchQuery);

  const displayPosts = posts || [];

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in animate-delay-100">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-background pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, users, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim().length >= 2 && users && users.length > 0 && (
        <div className="mb-4 p-2 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">Users</h3>
          <div className="space-y-1">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.username}</p>
                  {user.full_name && (
                    <p className="text-sm text-muted-foreground">{user.full_name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="for-you" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="vibes">Vibes</TabsTrigger>
        </TabsList>

        <TabsContent value="for-you" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No posts found. Be the first to share!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {displayPosts.map((post, index) => (
                <button
                  key={post.id}
                  className={cn(
                    "relative aspect-square overflow-hidden bg-muted",
                    index % 7 === 0 && "col-span-2 row-span-2"
                  )}
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
          )}
        </TabsContent>

        <TabsContent value="study" className="mt-0">
          <div className="grid grid-cols-3 gap-1">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))
            ) : (
              displayPosts.slice(0, 12).map((post) => (
                <button
                  key={post.id}
                  className="relative aspect-square overflow-hidden bg-muted"
                >
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="music" className="mt-0">
          <div className="grid grid-cols-3 gap-1">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))
            ) : (
              displayPosts.slice(4, 16).map((post) => (
                <button
                  key={post.id}
                  className="relative aspect-square overflow-hidden bg-muted"
                >
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="vibes" className="mt-0">
          <div className="grid grid-cols-3 gap-1">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))
            ) : (
              displayPosts.slice(8, 20).map((post) => (
                <button
                  key={post.id}
                  className="relative aspect-square overflow-hidden bg-muted"
                >
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
