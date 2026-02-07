"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, ImagePlus, X, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useStories } from "@/lib/hooks/use-stories";

export default function StoriesPage() {
  const router = useRouter();
  const { createStory } = useStories();
  const [media, setMedia] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!media || !mediaFile) {
      toast.error("Please select an image or video");
      return;
    }

    setIsUploading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a story");
        router.push("/login");
        return;
      }

      // Generate unique filename
      const fileExt = mediaFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("stories")
        .upload(fileName, mediaFile, {
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
        .from("stories")
        .getPublicUrl(uploadData.path);

      // Determine media type
      const mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";

      // Create story record
      await createStory(publicUrl, mediaType);
      
      toast.success("Story posted!");
      router.push("/feed");
    } catch (error) {
      console.error("Story creation error:", error);
      toast.error("Failed to create story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaFile(null);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in animate-delay-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create Story</h1>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!media || isUploading}
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
        {/* Media Upload */}
        {!media ? (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors aspect-[9/16] flex flex-col items-center justify-center
                ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
              `}
            >
              <input {...getInputProps()} />
              <ImagePlus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">
                {isDragActive ? "Drop the file here" : "Drag & drop media"}
              </p>
              <p className="text-sm text-muted-foreground">
                Images or videos (up to 30 seconds)
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" className="w-full" disabled>
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
          </div>
        ) : (
          <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black">
            {mediaFile?.type.startsWith("video/") ? (
              <video
                src={media}
                className="w-full h-full object-contain"
                controls
              />
            ) : (
              <img
                src={media}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={clearMedia}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Text overlay input */}
            <div className="absolute bottom-4 left-4 right-4">
              <Textarea
                placeholder="Add text to your story..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-black/50 border-white/20 text-white placeholder:text-white/50 resize-none"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
