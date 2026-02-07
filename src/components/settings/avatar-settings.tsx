"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Upload, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrentUserProfile } from "@/lib/hooks/use-profile";
import { toast } from "sonner";

export function AvatarSettings() {
  const {
    profile,
    uploadAvatar,
    isUploadingAvatar,
    removeAvatar,
    isRemovingAvatar,
  } = useCurrentUserProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadAvatar(selectedFile);
      toast.success("Avatar updated successfully");
      handleClose();
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  const handleRemove = () => {
    removeAvatar(undefined, {
      onSuccess: () => {
        toast.success("Avatar removed");
        handleClose();
      },
      onError: () => {
        toast.error("Failed to remove avatar");
      },
    });
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      else setIsDialogOpen(true);
    }}>
      <DialogTrigger asChild>
        <button className="w-full p-4 text-left hover:bg-accent transition-colors flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg">
              {profile?.username?.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">Profile Photo</p>
            <p className="text-sm text-muted-foreground">
              Tap to change your profile picture
            </p>
          </div>
          <Camera className="h-5 w-5 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Profile Photo</DialogTitle>
          <DialogDescription>
            Upload a new photo or remove your current one
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Preview Avatar */}
          <Avatar className="h-32 w-32">
            <AvatarImage src={previewUrl || profile?.avatar_url || undefined} />
            <AvatarFallback className="text-3xl">
              {profile?.username?.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex flex-col w-full gap-2">
            {previewUrl ? (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={isUploadingAvatar}
                  className="w-full"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Save Photo
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Photo
                </Button>
                {profile?.avatar_url && (
                  <Button
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isRemovingAvatar}
                    className="w-full"
                  >
                    {isRemovingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Current Photo
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
