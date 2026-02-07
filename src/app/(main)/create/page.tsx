"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, ImagePlus, X, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function CreatePostPage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!image || !imageFile) {
      toast.error("Please select an image");
      return;
    }

    setIsUploading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a post");
        router.push("/login");
        return;
      }

      // Generate unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("posts")
        .getPublicUrl(uploadData.path);

      // Create post record
      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: publicUrl,
        caption: caption || null,
        location: location || null,
      });

      if (postError) {
        console.error("Post creation error:", postError);
        toast.error(`Failed to create post: ${postError.message}`);
        return;
      }

      toast.success("Post created successfully!");
      router.push("/feed");
    } catch (error) {
      console.error("Post creation error:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in animate-delay-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create Post</h1>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!image || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Share"
            )}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Image Upload */}
        {!image ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
            `}
          >
            <input {...getInputProps()} />
            <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">
              {isDragActive ? "Drop the image here" : "Drag & drop an image"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select from your device
            </p>
          </div>
        ) : (
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Caption */}
        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Add location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
